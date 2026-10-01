import { describe, it, expect, vi } from 'vitest';
import { CasperNetwork } from '../../utils/casper-network';
import {
  Args,
  CLValue,
  ContractCallBuilder,
  Hash,
  NativeDelegateBuilder,
  NativeRedelegateBuilder,
  NativeTransferBuilder,
  NativeUndelegateBuilder,
  PublicKey,
  SessionBuilder,
  TransactionHash,
  URef
} from '../../types';
import { CasperNetworkName, ErrorCode } from '../../@types';
import {
  InfoGetDeployResult,
  InfoGetTransactionResult,
  PurseIdentifier,
  PutDeployResult,
  PutTransactionResult,
  RpcClient,
  StateGetBalanceResult
} from '../../rpc';
import { HttpError } from '../../rpc/error';

const SENDER_HEX =
  '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64';
const VALIDATOR_HEX =
  '01f0b77e728673aef7f984fd41d38a9424fd1796e07968534625c5b24b997ab34b';
const AUCTION_CONTRACT_HASH =
  '0101010101010101010101010101010101010101010101010101010101010101';

const SENDER = PublicKey.fromHex(SENDER_HEX);
const VALIDATOR = PublicKey.fromHex(VALIDATOR_HEX);

const expectBytesEqual = (a: Uint8Array, b: Uint8Array) =>
  expect(Array.from(a)).to.deep.equal(Array.from(b));

// CasperNetwork touches only a handful of RpcClient methods, so a plain object
// carrying those stands in — no real IHandler or transport needed.
const mockRpcClient = (overrides: Partial<RpcClient> = {}): RpcClient =>
  ({ ...overrides }) as unknown as RpcClient;

describe('CasperNetwork.create', () => {
  it('uses the explicit apiVersion without calling getStatus', async () => {
    const getStatus = vi.fn();
    const network = await CasperNetwork.create(mockRpcClient({ getStatus }), 1);

    expect(getStatus).not.toHaveBeenCalled();
    // apiVersion 1 requires an auctionContractHash for delegate transactions.
    expect(() =>
      network.createDelegateTransaction(
        SENDER,
        VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).to.throw('Auction contract hash is required');
  });

  it('resolves apiVersion 2 from a "2.x" status when none is given', async () => {
    const getStatus = vi
      .fn()
      .mockResolvedValue({ apiVersion: '2.0.0' } as never);
    const network = await CasperNetwork.create(mockRpcClient({ getStatus }));

    expect(getStatus).toHaveBeenCalledOnce();
    expect(() =>
      network.createDelegateTransaction(
        SENDER,
        VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).not.to.throw();
  });

  it('resolves apiVersion 1 from a "1.x" status when none is given', async () => {
    const getStatus = vi
      .fn()
      .mockResolvedValue({ apiVersion: '1.5.6' } as never);
    const network = await CasperNetwork.create(mockRpcClient({ getStatus }));

    expect(() =>
      network.createDelegateTransaction(
        SENDER,
        VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).to.throw('Auction contract hash is required');
  });
});

describe('createDelegateTransaction', () => {
  it('matches NativeDelegateBuilder on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createDelegateTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000,
      undefined,
      2
    );

    const expected = new NativeDelegateBuilder()
      .validator(VALIDATOR)
      .from(SENDER)
      .amount('500000000000')
      .chainName(CasperNetworkName.Testnet)
      .payment(2_500_000_000, 2)
      .ttl(1_800_000)
      .build();

    // build() stamps its own (current-time) timestamp, so only the
    // CLValue-bearing runtime args are directly comparable byte-for-byte.
    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches ContractCallBuilder("delegate") on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createDelegateTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000,
      AUCTION_CONTRACT_HASH,
      2
    );

    const expected = new ContractCallBuilder()
      .from(SENDER)
      .byHash(AUCTION_CONTRACT_HASH)
      .entryPoint('delegate')
      .payment(2_500_000_000, 2)
      .chainName(CasperNetworkName.Testnet)
      .runtimeArgs(
        Args.fromMap({
          validator: CLValue.newCLPublicKey(VALIDATOR),
          delegator: CLValue.newCLPublicKey(SENDER),
          amount: CLValue.newCLUInt512('500000000000')
        })
      )
      .ttl(1_800_000)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });

  it('throws on 1.5.x without an auction contract hash', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    expect(() =>
      network.createDelegateTransaction(
        SENDER,
        VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).to.throw('Auction contract hash is required');
  });
});

describe('createUndelegateTransaction', () => {
  it('matches NativeUndelegateBuilder on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createUndelegateTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000
    );

    const expected = new NativeUndelegateBuilder()
      .validator(VALIDATOR)
      .from(SENDER)
      .amount('500000000000')
      .chainName(CasperNetworkName.Testnet)
      .payment(2_500_000_000)
      .ttl(1_800_000)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches ContractCallBuilder("undelegate") on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createUndelegateTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000,
      AUCTION_CONTRACT_HASH
    );

    const expected = new ContractCallBuilder()
      .from(SENDER)
      .byHash(AUCTION_CONTRACT_HASH)
      .entryPoint('undelegate')
      .chainName(CasperNetworkName.Testnet)
      .payment(2_500_000_000)
      .ttl(1_800_000)
      .runtimeArgs(
        Args.fromMap({
          validator: CLValue.newCLPublicKey(VALIDATOR),
          delegator: CLValue.newCLPublicKey(SENDER),
          amount: CLValue.newCLUInt512('500000000000')
        })
      )
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });

  it('throws on 1.5.x without an auction contract hash', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    expect(() =>
      network.createUndelegateTransaction(
        SENDER,
        VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).to.throw('Auction contract hash is required');
  });
});

describe('createRedelegateTransaction', () => {
  const NEW_VALIDATOR = SENDER;

  it('matches NativeRedelegateBuilder on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createRedelegateTransaction(
      SENDER,
      VALIDATOR,
      NEW_VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000
    );

    const expected = new NativeRedelegateBuilder()
      .validator(VALIDATOR)
      .newValidator(NEW_VALIDATOR)
      .from(SENDER)
      .amount('500000000000')
      .chainName(CasperNetworkName.Testnet)
      .payment(2_500_000_000)
      .ttl(1_800_000)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches ContractCallBuilder("redelegate") on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createRedelegateTransaction(
      SENDER,
      VALIDATOR,
      NEW_VALIDATOR,
      CasperNetworkName.Testnet,
      '500000000000',
      2_500_000_000,
      1_800_000,
      AUCTION_CONTRACT_HASH
    );

    const expected = new ContractCallBuilder()
      .from(SENDER)
      .byHash(AUCTION_CONTRACT_HASH)
      .entryPoint('redelegate')
      .chainName(CasperNetworkName.Testnet)
      .payment(2_500_000_000)
      .runtimeArgs(
        Args.fromMap({
          validator: CLValue.newCLPublicKey(VALIDATOR),
          delegator: CLValue.newCLPublicKey(SENDER),
          amount: CLValue.newCLUInt512('500000000000'),
          new_validator: CLValue.newCLPublicKey(NEW_VALIDATOR)
        })
      )
      .ttl(1_800_000)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });

  it('throws on 1.5.x without an auction contract hash', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    expect(() =>
      network.createRedelegateTransaction(
        SENDER,
        VALIDATOR,
        NEW_VALIDATOR,
        CasperNetworkName.Testnet,
        '500000000000',
        2_500_000_000,
        1_800_000
      )
    ).to.throw('Auction contract hash is required');
  });
});

describe('createTransferTransaction', () => {
  it('matches NativeTransferBuilder.build() on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createTransferTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '25000000000',
      100_500_000,
      1_800_000,
      42
    );

    const expected = new NativeTransferBuilder()
      .from(SENDER)
      .target(VALIDATOR)
      .amount('25000000000')
      .chainName(CasperNetworkName.Testnet)
      .payment(100_500_000)
      .ttl(1_800_000)
      .id(42)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches NativeTransferBuilder.buildFor1_5() on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createTransferTransaction(
      SENDER,
      VALIDATOR,
      CasperNetworkName.Testnet,
      '25000000000',
      100_500_000,
      1_800_000,
      42
    );

    const expected = new NativeTransferBuilder()
      .from(SENDER)
      .target(VALIDATOR)
      .amount('25000000000')
      .chainName(CasperNetworkName.Testnet)
      .payment(100_500_000)
      .ttl(1_800_000)
      .id(42)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });
});

describe('createContractCallTransaction', () => {
  const runtimeArgs = Args.fromMap({
    amount: CLValue.newCLUInt256('1000000000')
  });

  it('matches ContractCallBuilder.build() on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createContractCallTransaction(
      SENDER,
      AUCTION_CONTRACT_HASH,
      'transfer',
      CasperNetworkName.Testnet,
      2_000_000_000,
      1_800_000,
      runtimeArgs
    );

    const expected = new ContractCallBuilder()
      .byHash(AUCTION_CONTRACT_HASH)
      .from(SENDER)
      .entryPoint('transfer')
      .chainName(CasperNetworkName.Testnet)
      .runtimeArgs(runtimeArgs)
      .ttl(1_800_000)
      .payment(2_000_000_000)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches ContractCallBuilder.buildFor1_5() on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createContractCallTransaction(
      SENDER,
      AUCTION_CONTRACT_HASH,
      'transfer',
      CasperNetworkName.Testnet,
      2_000_000_000,
      1_800_000,
      runtimeArgs
    );

    const expected = new ContractCallBuilder()
      .byHash(AUCTION_CONTRACT_HASH)
      .from(SENDER)
      .entryPoint('transfer')
      .chainName(CasperNetworkName.Testnet)
      .runtimeArgs(runtimeArgs)
      .ttl(1_800_000)
      .payment(2_000_000_000)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });
});

describe('createContractPackageCallTransaction', () => {
  const runtimeArgs = Args.fromMap({
    amount: CLValue.newCLUInt256('1000000000')
  });

  it('matches ContractCallBuilder.byPackageHash().build() on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createContractPackageCallTransaction(
      SENDER,
      AUCTION_CONTRACT_HASH,
      'transfer',
      CasperNetworkName.Testnet,
      2_000_000_000,
      runtimeArgs,
      1_800_000,
      3
    );

    const expected = new ContractCallBuilder()
      .byPackageHash(AUCTION_CONTRACT_HASH, 3)
      .from(SENDER)
      .entryPoint('transfer')
      .chainName(CasperNetworkName.Testnet)
      .runtimeArgs(runtimeArgs)
      .ttl(1_800_000)
      .payment(2_000_000_000)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );

    const target =
      tx.getTransactionV1()!.payload.fields.target.stored!.id.byPackageHash!;
    expect(target.addr.toHex()).to.equal(AUCTION_CONTRACT_HASH);
    expect(target.version).to.equal(3);
  });

  it('matches ContractCallBuilder.byPackageHash().buildFor1_5() on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createContractPackageCallTransaction(
      SENDER,
      AUCTION_CONTRACT_HASH,
      'transfer',
      CasperNetworkName.Testnet,
      2_000_000_000,
      runtimeArgs,
      1_800_000
    );

    const expected = new ContractCallBuilder()
      .byPackageHash(AUCTION_CONTRACT_HASH)
      .from(SENDER)
      .entryPoint('transfer')
      .chainName(CasperNetworkName.Testnet)
      .runtimeArgs(runtimeArgs)
      .ttl(1_800_000)
      .payment(2_000_000_000)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });
});

describe('createSessionWasmTransaction', () => {
  const wasm = Uint8Array.from([1, 2, 3]);
  const runtimeArgs = Args.fromMap({
    amount: CLValue.newCLUInt256('1000000000')
  });

  it('matches SessionBuilder.build() on Casper 2.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 2);

    const tx = network.createSessionWasmTransaction(
      SENDER,
      CasperNetworkName.Testnet,
      2_000_000_000,
      1_800_000,
      wasm,
      runtimeArgs
    );

    const expected = new SessionBuilder()
      .from(SENDER)
      .chainName(CasperNetworkName.Testnet)
      .payment(2_000_000_000)
      .ttl(1_800_000)
      .wasm(wasm)
      .runtimeArgs(runtimeArgs)
      .build();

    expectBytesEqual(
      tx.getTransactionV1()!.payload.fields.args.toBytes(),
      expected.getTransactionV1()!.payload.fields.args.toBytes()
    );
  });

  it('matches SessionBuilder.buildFor1_5() on Casper 1.5.x', () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = network.createSessionWasmTransaction(
      SENDER,
      CasperNetworkName.Testnet,
      2_000_000_000,
      1_800_000,
      wasm,
      runtimeArgs
    );

    const expected = new SessionBuilder()
      .from(SENDER)
      .chainName(CasperNetworkName.Testnet)
      .payment(2_000_000_000)
      .ttl(1_800_000)
      .wasm(wasm)
      .runtimeArgs(runtimeArgs)
      .buildFor1_5();

    expectBytesEqual(
      tx.getDeploy()!.session.bytes(),
      expected.getDeploy()!.session.bytes()
    );
  });
});

describe('putTransaction', () => {
  it('submits via putTransaction on Casper 2.x', async () => {
    const sentinel = {} as PutTransactionResult;
    const putTransaction = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(mockRpcClient({ putTransaction }), 2);

    const tx = new NativeTransferBuilder()
      .from(SENDER)
      .target(VALIDATOR)
      .amount('1')
      .chainName(CasperNetworkName.Testnet)
      .payment(100_000_000)
      .build();

    const result = await network.putTransaction(tx);

    expect(result).to.equal(sentinel);
    expect(putTransaction).toHaveBeenCalledWith(tx);
  });

  it('submits via putDeploy on Casper 1.5.x when the transaction wraps a Deploy', async () => {
    const sentinel = {} as PutDeployResult;
    const putDeploy = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(mockRpcClient({ putDeploy }), 1);

    const tx = new NativeTransferBuilder()
      .from(SENDER)
      .target(VALIDATOR)
      .amount('1')
      .chainName(CasperNetworkName.Testnet)
      .payment(100_000_000)
      .buildFor1_5();

    const result = await network.putTransaction(tx);

    expect(result).to.equal(sentinel);
    expect(putDeploy).toHaveBeenCalledWith(tx.getDeploy());
  });

  it('rejects a Casper 1.5.x submission that is not a legacy Deploy', async () => {
    const network = new CasperNetwork(mockRpcClient(), 1);

    const tx = new NativeTransferBuilder()
      .from(SENDER)
      .target(VALIDATOR)
      .amount('1')
      .chainName(CasperNetworkName.Testnet)
      .payment(100_000_000)
      .build();

    await expect(network.putTransaction(tx)).rejects.toThrow(
      'Legacy deploy transaction is required when submitting to Casper Network 1.5'
    );
  });
});

describe('getTransaction', () => {
  const txHash = Hash.fromHex(
    '0202020202020202020202020202020202020202020202020202020202020202'
  );
  const deployHash = Hash.fromHex(
    '0303030303030303030303030303030303030303030303030303030303030303'
  );

  it('reads a TransactionV1 hash directly by transaction hash', async () => {
    const sentinel = {} as InfoGetTransactionResult;
    const getTransactionByTransactionHash = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(
      mockRpcClient({ getTransactionByTransactionHash }),
      2
    );

    const result = await network.getTransaction(
      TransactionHash.fromTransactionHash(txHash)
    );

    expect(result).to.equal(sentinel);
    expect(getTransactionByTransactionHash).toHaveBeenCalledWith(
      txHash.toHex()
    );
  });

  it('reads a Deploy hash directly by deploy hash', async () => {
    const sentinel = {} as InfoGetTransactionResult;
    const getTransactionByDeployHash = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(
      mockRpcClient({ getTransactionByDeployHash }),
      2
    );

    const result = await network.getTransaction(
      TransactionHash.fromDeployHash(deployHash)
    );

    expect(result).to.equal(sentinel);
    expect(getTransactionByDeployHash).toHaveBeenCalledWith(deployHash.toHex());
  });

  it('tries transaction-hash first for an unwrapped Hash, and does not fall back on success', async () => {
    const sentinel = {} as InfoGetTransactionResult;
    const getTransactionByTransactionHash = vi.fn().mockResolvedValue(sentinel);
    const getTransactionByDeployHash = vi.fn();
    const network = new CasperNetwork(
      mockRpcClient({
        getTransactionByTransactionHash,
        getTransactionByDeployHash
      }),
      2
    );

    const result = await network.getTransaction(txHash.toHex());

    expect(result).to.equal(sentinel);
    expect(getTransactionByTransactionHash).toHaveBeenCalledWith(
      txHash.toHex()
    );
    expect(getTransactionByDeployHash).not.toHaveBeenCalled();
  });

  it('falls back to the deploy hash when the node reports NoSuchTransaction', async () => {
    const sentinel = {} as InfoGetTransactionResult;
    const notFound = new HttpError(
      ErrorCode.NoSuchTransaction,
      new Error('not found')
    );
    const getTransactionByTransactionHash = vi.fn().mockRejectedValue(notFound);
    const getTransactionByDeployHash = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(
      mockRpcClient({
        getTransactionByTransactionHash,
        getTransactionByDeployHash
      }),
      2
    );

    const result = await network.getTransaction(txHash);

    expect(result).to.equal(sentinel);
    expect(getTransactionByDeployHash).toHaveBeenCalledWith(txHash.toHex());
  });

  it('rethrows any other error without falling back', async () => {
    const otherError = new HttpError(500, new Error('boom'));
    const getTransactionByTransactionHash = vi
      .fn()
      .mockRejectedValue(otherError);
    const getTransactionByDeployHash = vi.fn();
    const network = new CasperNetwork(
      mockRpcClient({
        getTransactionByTransactionHash,
        getTransactionByDeployHash
      }),
      2
    );

    await expect(network.getTransaction(txHash)).rejects.toBe(otherError);
    expect(getTransactionByDeployHash).not.toHaveBeenCalled();
  });

  it('reads via getDeploy on Casper 1.5.x', async () => {
    const sentinel = {} as InfoGetTransactionResult;
    const deployResult = {
      toInfoGetTransactionResult: () => sentinel
    } as unknown as InfoGetDeployResult;
    const getDeploy = vi.fn().mockResolvedValue(deployResult);
    const network = new CasperNetwork(mockRpcClient({ getDeploy }), 1);

    const result = await network.getTransaction(deployHash);

    expect(result).to.equal(sentinel);
    expect(getDeploy).toHaveBeenCalledWith(deployHash.toHex());
  });
});

describe('queryLatestBalance', () => {
  it('delegates straight to rpcClient.queryLatestBalance on Casper 2.x', async () => {
    const sentinel = {} as never;
    const queryLatestBalance = vi.fn().mockResolvedValue(sentinel);
    const network = new CasperNetwork(mockRpcClient({ queryLatestBalance }), 2);
    const identifier = PurseIdentifier.fromPublicKey(SENDER);

    const result = await network.queryLatestBalance(identifier);

    expect(result).to.equal(sentinel);
    expect(queryLatestBalance).toHaveBeenCalledWith(identifier);
  });

  it('returns undefined on Casper 1.5.x without a purse URef', async () => {
    const getLatestBalance = vi.fn();
    const network = new CasperNetwork(mockRpcClient({ getLatestBalance }), 1);
    const identifier = PurseIdentifier.fromPublicKey(SENDER);

    const result = await network.queryLatestBalance(identifier);

    expect(result).to.be.undefined;
    expect(getLatestBalance).not.toHaveBeenCalled();
  });

  it('maps to rpcClient.getLatestBalance by purse URef on Casper 1.5.x', async () => {
    const uref = URef.fromString(
      'uref-0101010101010101010101010101010101010101010101010101010101010101-007'
    );
    const sentinel = {} as never;
    const balanceResult = {
      toQueryBalanceResult: () => sentinel
    } as unknown as StateGetBalanceResult;
    const getLatestBalance = vi.fn().mockResolvedValue(balanceResult);
    const network = new CasperNetwork(mockRpcClient({ getLatestBalance }), 1);
    const identifier = PurseIdentifier.fromUref(uref);

    const result = await network.queryLatestBalance(identifier);

    expect(result).to.equal(sentinel);
    expect(getLatestBalance).toHaveBeenCalledWith(uref.toPrefixedString());
  });
});
