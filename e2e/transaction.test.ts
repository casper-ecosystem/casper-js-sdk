import { beforeAll, describe, expect, it } from 'vitest';

import {
  Args,
  KeyAlgorithm,
  NativeDelegateBuilder,
  NativeTransferBuilder,
  NativeUndelegateBuilder,
  PrivateKey,
  PurseIdentifier,
  SessionBuilder,
  makeCsprTransferDeploy
} from '../src';
import { NETWORK_NAME, loadFaucetKey } from './config';
import {
  assertTransactionSucceeded,
  nativeTransfer,
  newRpcClient,
  waitForBlockHeight
} from './helpers';

// Every case here ends in on-chain confirmation, not just RPC acceptance —
// see `assertTransactionSucceeded`.
describe('transaction write path', () => {
  const client = newRpcClient();
  let faucetKey: PrivateKey;

  beforeAll(async () => {
    faucetKey = loadFaucetKey();
    await waitForBlockHeight(client, 2);
  }, 120_000);

  it('native transfer with an Ed25519 signer', async () => {
    const recipient = PrivateKey.generate(KeyAlgorithm.ED25519);
    const amount = '2500000000'; // 2.5 CSPR

    await nativeTransfer(client, faucetKey, recipient.publicKey, amount);

    const balance = await client.queryLatestBalance(
      PurseIdentifier.fromPublicKey(recipient.publicKey)
    );
    expect(balance.balance.toString()).toBe(amount);
  }, 60_000);

  it('native transfer with a Secp256K1 signer', async () => {
    // The faucet is Ed25519-only; fund a fresh Secp256K1 account from it
    // first so this case exercises the Secp256K1 signing path end to end.
    const secpSender = PrivateKey.generate(KeyAlgorithm.SECP256K1);
    const recipient = PrivateKey.generate(KeyAlgorithm.ED25519);
    const amount = '2500000000'; // 2.5 CSPR

    await nativeTransfer(
      client,
      faucetKey,
      secpSender.publicKey,
      '5000000000' // 5 CSPR — covers the transfer amount plus payment
    );
    await nativeTransfer(client, secpSender, recipient.publicKey, amount);

    const balance = await client.queryLatestBalance(
      PurseIdentifier.fromPublicKey(recipient.publicKey)
    );
    expect(balance.balance.toString()).toBe(amount);
  }, 120_000);

  it('legacy Deploy path via makeCsprTransferDeploy', async () => {
    const recipient = PrivateKey.generate(KeyAlgorithm.ED25519);
    const amount = '2500000000';

    const deploy = makeCsprTransferDeploy({
      senderPublicKeyHex: faucetKey.publicKey.toHex(),
      recipientPublicKeyHex: recipient.publicKey.toHex(),
      transferAmount: amount,
      chainName: NETWORK_NAME
    });
    deploy.sign(faucetKey);

    await client.putDeploy(deploy);
    const confirmed = await client.waitForDeploy(deploy, 120_000);
    assertTransactionSucceeded(confirmed, 'legacy Deploy transfer');

    const fetched = await client.getDeploy(deploy.hash.toHex());
    expect(fetched.deploy.hash.toHex()).toBe(deploy.hash.toHex());
  }, 150_000);

  it('rejects a transaction payload larger than 1 megabyte', async () => {
    // RpcClient does no client-side size check, so the rejection has to come
    // back from the node rather than from a pre-send guard.
    const oneMegabyte = 1_048_576;
    const oversizedWasm = new Uint8Array(oneMegabyte + 1);

    const transaction = new SessionBuilder()
      .from(faucetKey.publicKey)
      .wasm(oversizedWasm)
      .installOrUpgrade()
      .runtimeArgs(Args.fromMap({}))
      .chainName(NETWORK_NAME)
      .payment(500_000_000_000)
      .build();
    transaction.sign(faucetKey);

    await expect(client.putTransaction(transaction)).rejects.toThrow();
  }, 30_000);

  // No wasm-install or CEP-18 case: both fixtures in `services/` are built
  // against the 1.x contract ABI and cannot install on a 2.x node. Restoring
  // them needs a contract rebuilt against casper-contract 2.x — see
  // e2e/README.md.

  it('delegates then undelegates to a validator', async () => {
    const auctionInfo = await client.getLatestAuctionInfo();
    const validatorBid = auctionInfo.auctionState.bids.find(
      wrapper => wrapper.bid.validator
    )?.bid.validator;
    expect(validatorBid).toBeDefined();
    const validatorPublicKey = validatorBid!.validatorPublicKey;

    const delegateAmount = '500000000000'; // 500 CSPR

    const delegateTx = new NativeDelegateBuilder()
      .from(faucetKey.publicKey)
      .validator(validatorPublicKey)
      .amount(delegateAmount)
      .chainName(NETWORK_NAME)
      .payment(2_500_000_000)
      .build();
    delegateTx.sign(faucetKey);
    await client.putTransaction(delegateTx);
    const delegateResult = await client.waitForTransaction(delegateTx, 120_000);
    assertTransactionSucceeded(delegateResult, 'delegate');

    const afterDelegate = await client.getLatestAuctionInfo();
    const delegated = afterDelegate.auctionState.bids.some(
      wrapper =>
        wrapper.bid.delegator?.validatorPublicKey.toHex() ===
          validatorPublicKey.toHex() &&
        wrapper.bid.delegator?.delegatorKind.publicKey?.toHex() ===
          faucetKey.publicKey.toHex()
    );
    expect(delegated).toBe(true);

    const undelegateTx = new NativeUndelegateBuilder()
      .from(faucetKey.publicKey)
      .validator(validatorPublicKey)
      .amount(delegateAmount)
      .chainName(NETWORK_NAME)
      .payment(2_500_000_000)
      .build();
    undelegateTx.sign(faucetKey);
    await client.putTransaction(undelegateTx);
    const undelegateResult = await client.waitForTransaction(
      undelegateTx,
      120_000
    );
    assertTransactionSucceeded(undelegateResult, 'undelegate');
  }, 180_000);

  it('waitForTransaction rejects cleanly on an unknown hash', async () => {
    // Built but never signed or submitted — its hash will never resolve.
    const bogus = new NativeTransferBuilder()
      .from(faucetKey.publicKey)
      .target(PrivateKey.generate(KeyAlgorithm.ED25519).publicKey)
      .amount('1')
      .id(Date.now())
      .chainName(NETWORK_NAME)
      .payment(100_000_000)
      .build();

    const timeoutMs = 5_000;
    const start = Date.now();
    // An unknown hash draws an RPC error rather than a pending transaction, so
    // it is the retry budget that ends this, not the deadline. The regression
    // guarded here is the hang: either way the promise has to settle.
    await expect(client.waitForTransaction(bogus, timeoutMs)).rejects.toThrow(
      /Failed after \d+ retries|Timeout/
    );
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(timeoutMs + 15_000);
  }, 30_000);
});
