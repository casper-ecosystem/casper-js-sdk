import { beforeAll, describe, expect, it } from 'vitest';

import {
  AccountIdentifier,
  EntityIdentifier,
  PrivateKey,
  PurseIdentifier
} from '../src';
import { NETWORK_NAME, loadFaucetKey } from './config';
import { newRpcClient, waitForBlockHeight } from './helpers';

describe('RPC read surface', () => {
  const client = newRpcClient();
  let faucetKey: PrivateKey;

  beforeAll(async () => {
    faucetKey = loadFaucetKey();
    await waitForBlockHeight(client, 2);
  }, 120_000);

  it('getStatus reports the network name and a build version', async () => {
    const status = await client.getStatus();

    expect(status.chainSpecName).toBe(NETWORK_NAME);
    expect(status.buildVersion).toBeTruthy();
    expect(status.lastAddedBlockInfo).toBeDefined();
  });

  it('getBlockByHeight, getBlockByHash and getLatestBlock agree', async () => {
    const latest = await client.getLatestBlock();
    const byHeight = await client.getBlockByHeight(latest.block.height);
    const byHash = await client.getBlockByHash(latest.block.hash.toHex());

    expect(byHeight.block.hash.toHex()).toBe(latest.block.hash.toHex());
    expect(byHash.block.height).toBe(latest.block.height);
  });

  it('getStateRootHashByHash, getStateRootHashByHeight and getStateRootHashLatest agree', async () => {
    const latestBlock = await client.getLatestBlock();
    const latestRoot = await client.getStateRootHashLatest();
    const byHash = await client.getStateRootHashByHash(
      latestBlock.block.hash.toHex()
    );
    const byHeight = await client.getStateRootHashByHeight(
      latestBlock.block.height
    );

    expect(byHash.stateRootHash.toHex()).toBe(latestRoot.stateRootHash.toHex());
    expect(byHeight.stateRootHash.toHex()).toBe(
      latestRoot.stateRootHash.toHex()
    );
  });

  it('getPeers reports the 5-node net', async () => {
    const peers = await client.getPeers();
    expect(peers.peers.length).toBe(4);
  });

  it('getLatestAuctionInfo falls back from v2 to v1 and reports 5 validators', async () => {
    const auctionInfo = await client.getLatestAuctionInfo();
    const validatorBids = auctionInfo.auctionState.bids.filter(
      wrapper => wrapper.bid.validator
    );

    expect(validatorBids.length).toBe(5);
  });

  it('getLatestAuctionInfoV1 reports validator bids directly', async () => {
    const v1 = await client.getLatestAuctionInfoV1();
    expect(v1.auctionState.bids.length).toBeGreaterThan(0);
  });

  it('getAuctionInfoByHeight reports the auction state at that height', async () => {
    const latest = await client.getLatestBlock();
    const auctionInfo = await client.getAuctionInfoByHeight(
      latest.block.height
    );

    expect(auctionInfo.auctionState.blockHeight).toBe(latest.block.height);
  });

  it('getEraInfoLatest and getEraSummaryLatest agree on the era summary', async () => {
    const eraInfo = await client.getEraInfoLatest();
    const eraSummaryLatest = await client.getEraSummaryLatest();

    expect(eraInfo.eraSummary.eraID).toBe(eraSummaryLatest.eraSummary.eraID);
  });

  it('getEraSummaryByHash matches getEraSummaryLatest', async () => {
    const latest = await client.getEraSummaryLatest();
    const byHash = await client.getEraSummaryByHash(
      latest.eraSummary.blockHash.toHex()
    );

    expect(byHash.eraSummary.blockHash.toHex()).toBe(
      latest.eraSummary.blockHash.toHex()
    );
  });

  // A 2.x node wraps a classic account as `{"Account": {…}}`, which the
  // `LegacyAccount` member in `StateGetEntityResult` has to accept too.
  it('getLatestEntity resolves the faucet as an entity or a legacy account', async () => {
    const entity = await client.getLatestEntity(
      EntityIdentifier.fromPublicKey(faucetKey.publicKey)
    );
    const resolved =
      entity.entity.addressableEntity?.entity ?? entity.entity.legacyAccount;
    expect(resolved).toBeDefined();
  });

  it('getAccountInfo reports the faucet account hash', async () => {
    const accountInfo = await client.getAccountInfo(
      null,
      new AccountIdentifier(undefined, faucetKey.publicKey)
    );

    expect(accountInfo.account.accountHash.toPrefixedString()).toBe(
      faucetKey.publicKey.accountHash().toPrefixedString()
    );
  });

  it('queryLatestBalance, queryLatestBalanceDetails and getLatestBalance agree on the faucet balance', async () => {
    const accountInfo = await client.getAccountInfo(
      null,
      new AccountIdentifier(undefined, faucetKey.publicKey)
    );
    const mainPurse = accountInfo.account.mainPurse;

    const byPublicKey = await client.queryLatestBalance(
      PurseIdentifier.fromPublicKey(faucetKey.publicKey)
    );
    const byUref = await client.queryLatestBalance(
      PurseIdentifier.fromUref(mainPurse)
    );
    expect(byUref.balance.toString()).toBe(byPublicKey.balance.toString());

    const details = await client.queryLatestBalanceDetails(
      PurseIdentifier.fromPublicKey(faucetKey.publicKey)
    );
    expect(details.availableBalance.toString()).toBe(
      byPublicKey.balance.toString()
    );

    const legacyBalance = await client.getLatestBalance(
      mainPurse.toPrefixedString()
    );
    expect(legacyBalance.balanceValue.toString()).toBe(
      byPublicKey.balance.toString()
    );
  });

  it('getChainspec returns chainspec bytes', async () => {
    const chainspec = await client.getChainspec();
    expect(chainspec.chainspecBytes).toBeDefined();
  });

  it('queryLatestGlobalState resolves the faucet account key', async () => {
    const result = await client.queryLatestGlobalState(
      faucetKey.publicKey.accountHash().toPrefixedString(),
      []
    );

    expect(result.storedValue).toBeDefined();
  });

  it('getValidatorChangesInfo returns a changes array', async () => {
    const changes = await client.getValidatorChangesInfo();
    expect(changes.changes).toBeDefined();
  });
});
