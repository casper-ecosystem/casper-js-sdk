import { describe, it, expect } from 'vitest';
import {
  getRuntimeArgsForCep47Transfer,
  getRuntimeArgsForCep78Transfer,
  getRuntimeArgsForCep95Transfer,
  getRuntimeArgsForNftTransfer,
  makeNftTransferDeploy,
  makeNftTransferTransaction
} from '../../utils/cep-nft-transfer';
import { CasperNetworkName, NFTTokenStandard } from '../../@types';
import {
  ContractCallBuilder,
  ExecutableDeployItem,
  PublicKey,
  Timestamp,
  Transaction
} from '../../types';

const SENDER_HEX =
  '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64';
const RECIPIENT_HEX =
  '01f0b77e728673aef7f984fd41d38a9424fd1796e07968534625c5b24b997ab34b';
const CONTRACT_PACKAGE_HASH =
  '0101010101010101010101010101010101010101010101010101010101010101';
const TIMESTAMP = '2024-06-01T00:00:00.000Z';

const expectBytesEqual = (a: Uint8Array, b: Uint8Array) =>
  expect(Array.from(a)).to.deep.equal(Array.from(b));

describe('getRuntimeArgsForCep47Transfer', () => {
  it('builds recipient key and token_ids list args', () => {
    const args = getRuntimeArgsForCep47Transfer({
      tokenId: '234',
      recipientPublicKeyHex: RECIPIENT_HEX
    });

    const recipient = args.getByName('recipient');
    expect(recipient?.key?.account?.toHex()).to.equal(
      PublicKey.fromHex(RECIPIENT_HEX).accountHash().toHex()
    );

    const tokenIds = args.getByName('token_ids');
    expect(tokenIds?.list?.elements).to.have.length(1);
    expect(tokenIds?.list?.elements[0].ui256?.toString()).to.equal('234');
  });
});

describe('getRuntimeArgsForCep78Transfer', () => {
  it('sets is_hash_identifier_mode false and token_id for a tokenId transfer', () => {
    const args = getRuntimeArgsForCep78Transfer({
      tokenId: '234',
      recipientPublicKeyHex: RECIPIENT_HEX,
      senderPublicKeyHex: SENDER_HEX
    });

    expect(args.getByName('target_key')?.key?.account?.toHex()).to.equal(
      PublicKey.fromHex(RECIPIENT_HEX).accountHash().toHex()
    );
    expect(args.getByName('source_key')?.key?.account?.toHex()).to.equal(
      PublicKey.fromHex(SENDER_HEX).accountHash().toHex()
    );
    expect(
      args.getByName('is_hash_identifier_mode')?.bool?.getValue()
    ).to.equal(false);
    expect(args.getByName('token_id')?.ui64?.toString()).to.equal('234');
    expect(args.getByName('token_hash')).to.be.undefined;
  });

  it('sets is_hash_identifier_mode true and token_hash for a tokenHash transfer', () => {
    const args = getRuntimeArgsForCep78Transfer({
      tokenHash: 'deadbeef',
      recipientPublicKeyHex: RECIPIENT_HEX,
      senderPublicKeyHex: SENDER_HEX
    });

    expect(
      args.getByName('is_hash_identifier_mode')?.bool?.getValue()
    ).to.equal(true);
    expect(args.getByName('token_hash')?.stringVal?.toString()).to.equal(
      'deadbeef'
    );
    expect(args.getByName('token_id')).to.be.undefined;
  });

  it('rejects a non-numeric tokenId', () => {
    expect(() =>
      getRuntimeArgsForCep78Transfer({
        tokenId: 'not-a-number',
        recipientPublicKeyHex: RECIPIENT_HEX,
        senderPublicKeyHex: SENDER_HEX
      })
    ).to.throw('Invalid "tokenId" value');
  });
});

describe('getRuntimeArgsForCep95Transfer', () => {
  it('builds from/to keys, token_id and an empty data option', () => {
    const args = getRuntimeArgsForCep95Transfer({
      tokenId: '234',
      recipientPublicKeyHex: RECIPIENT_HEX,
      senderPublicKeyHex: SENDER_HEX
    });

    expect(args.getByName('from')?.key?.account?.toHex()).to.equal(
      PublicKey.fromHex(SENDER_HEX).accountHash().toHex()
    );
    expect(args.getByName('to')?.key?.account?.toHex()).to.equal(
      PublicKey.fromHex(RECIPIENT_HEX).accountHash().toHex()
    );
    expect(args.getByName('token_id')?.ui256?.toString()).to.equal('234');
    expect(args.getByName('data')?.option?.isEmpty()).to.equal(true);
  });
});

describe('getRuntimeArgsForNftTransfer', () => {
  it('requires either tokenId or tokenHash regardless of standard', () => {
    expect(() =>
      getRuntimeArgsForNftTransfer({
        nftStandard: NFTTokenStandard.CEP78,
        senderPublicKeyHex: SENDER_HEX,
        recipientPublicKeyHex: RECIPIENT_HEX
      })
    ).to.throw('Specify either tokenId or tokenHash to make a transfer');
  });

  it('requires tokenId for CEP-47', () => {
    expect(() =>
      getRuntimeArgsForNftTransfer({
        nftStandard: NFTTokenStandard.CEP47,
        senderPublicKeyHex: SENDER_HEX,
        recipientPublicKeyHex: RECIPIENT_HEX,
        tokenHash: 'deadbeef'
      })
    ).to.throw('TokenId is required for CEP-47 transfer');
  });

  it('requires tokenId for CEP-95', () => {
    expect(() =>
      getRuntimeArgsForNftTransfer({
        nftStandard: NFTTokenStandard.CEP95,
        senderPublicKeyHex: SENDER_HEX,
        recipientPublicKeyHex: RECIPIENT_HEX,
        tokenHash: 'deadbeef'
      })
    ).to.throw('TokenId is required for CEP-95 transfer');
  });

  it.each([
    [
      NFTTokenStandard.CEP47,
      () =>
        getRuntimeArgsForCep47Transfer({
          tokenId: '234',
          recipientPublicKeyHex: RECIPIENT_HEX
        })
    ],
    [
      NFTTokenStandard.CEP78,
      () =>
        getRuntimeArgsForCep78Transfer({
          tokenId: '234',
          recipientPublicKeyHex: RECIPIENT_HEX,
          senderPublicKeyHex: SENDER_HEX
        })
    ],
    [
      NFTTokenStandard.CEP95,
      () =>
        getRuntimeArgsForCep95Transfer({
          tokenId: '234',
          recipientPublicKeyHex: RECIPIENT_HEX,
          senderPublicKeyHex: SENDER_HEX
        })
    ]
  ])('dispatches %s to its dedicated helper', (nftStandard, direct) => {
    const dispatched = getRuntimeArgsForNftTransfer({
      nftStandard,
      senderPublicKeyHex: SENDER_HEX,
      recipientPublicKeyHex: RECIPIENT_HEX,
      tokenId: '234'
    });

    expectBytesEqual(dispatched.toBytes(), direct().toBytes());
  });
});

describe('makeNftTransferDeploy', () => {
  it('builds a deploy calling "transfer" on the versioned contract, paid via standard payment', () => {
    const deploy = makeNftTransferDeploy({
      nftStandard: NFTTokenStandard.CEP47,
      contractPackageHash: CONTRACT_PACKAGE_HASH,
      senderPublicKeyHex: SENDER_HEX,
      recipientPublicKeyHex: RECIPIENT_HEX,
      paymentAmount: '3000000000',
      chainName: CasperNetworkName.Testnet,
      ttl: 1_800_000,
      tokenId: '234',
      timestamp: TIMESTAMP,
      gasPrice: 3
    });

    expect(deploy.header.account?.toHex()).to.equal(SENDER_HEX);
    expect(deploy.header.chainName).to.equal(CasperNetworkName.Testnet);
    expect(deploy.header.ttl.duration).to.equal(1_800_000);
    expect(deploy.header.gasPrice).to.equal(3);
    expect(deploy.header.timestamp.toJSON()).to.equal(TIMESTAMP);

    const session = deploy.session.storedVersionedContractByHash;
    expect(session).to.exist;
    expect(session!.entryPoint).to.equal('transfer');
    expect(session!.hash.toJSON()).to.equal(CONTRACT_PACKAGE_HASH);
    expectBytesEqual(
      session!.args.toBytes(),
      getRuntimeArgsForNftTransfer({
        nftStandard: NFTTokenStandard.CEP47,
        senderPublicKeyHex: SENDER_HEX,
        recipientPublicKeyHex: RECIPIENT_HEX,
        tokenId: '234'
      }).toBytes()
    );

    expectBytesEqual(
      deploy.payment.bytes(),
      ExecutableDeployItem.standardPayment('3000000000').bytes()
    );
  });
});

describe('makeNftTransferTransaction', () => {
  it('builds a ContractCallBuilder "transfer" transaction for Casper 2.x', () => {
    const tx = makeNftTransferTransaction({
      nftStandard: NFTTokenStandard.CEP78,
      contractPackageHash: CONTRACT_PACKAGE_HASH,
      senderPublicKeyHex: SENDER_HEX,
      recipientPublicKeyHex: RECIPIENT_HEX,
      paymentAmount: '3000000000',
      chainName: CasperNetworkName.Testnet,
      ttl: 1_800_000,
      tokenId: '234',
      timestamp: TIMESTAMP,
      gasPrice: 3,
      casperNetworkApiVersion: '2.0.0'
    });

    const expected = new ContractCallBuilder()
      .byPackageHash(CONTRACT_PACKAGE_HASH)
      .entryPoint('transfer')
      .from(PublicKey.fromHex(SENDER_HEX))
      .chainName(CasperNetworkName.Testnet)
      .ttl(1_800_000)
      .payment(3_000_000_000, 3)
      .timestamp(Timestamp.fromJSON(TIMESTAMP))
      .runtimeArgs(
        getRuntimeArgsForNftTransfer({
          nftStandard: NFTTokenStandard.CEP78,
          senderPublicKeyHex: SENDER_HEX,
          recipientPublicKeyHex: RECIPIENT_HEX,
          tokenId: '234'
        })
      )
      .build();

    expectBytesEqual(tx.toBytes(), expected.toBytes());
  });

  it('uses "transfer_from" as the entry point for CEP-95', () => {
    const tx = makeNftTransferTransaction({
      nftStandard: NFTTokenStandard.CEP95,
      contractPackageHash: CONTRACT_PACKAGE_HASH,
      senderPublicKeyHex: SENDER_HEX,
      recipientPublicKeyHex: RECIPIENT_HEX,
      paymentAmount: '3000000000',
      chainName: CasperNetworkName.Testnet,
      ttl: 1_800_000,
      tokenId: '234',
      timestamp: TIMESTAMP,
      casperNetworkApiVersion: '2.1.2'
    });

    const target = tx.getTransactionV1()!.payload.fields.target.stored;
    expect(target?.id.byPackageHash?.addr.toHex()).to.equal(
      CONTRACT_PACKAGE_HASH
    );
    expect(
      tx.getTransactionV1()!.payload.fields.entryPoint.customEntryPoint
    ).to.equal('transfer_from');
  });

  it('falls back to the legacy Deploy path when the network is not 2.x', () => {
    const params = {
      nftStandard: NFTTokenStandard.CEP47,
      contractPackageHash: CONTRACT_PACKAGE_HASH,
      senderPublicKeyHex: SENDER_HEX,
      recipientPublicKeyHex: RECIPIENT_HEX,
      paymentAmount: '3000000000',
      chainName: CasperNetworkName.Testnet,
      ttl: 1_800_000,
      tokenId: '234',
      timestamp: TIMESTAMP
    };

    const tx = makeNftTransferTransaction({
      ...params,
      casperNetworkApiVersion: '1.5.6'
    });
    const expected = Transaction.fromDeploy(makeNftTransferDeploy(params));

    expect(tx.getDeploy()).to.exist;
    expectBytesEqual(
      tx.getDeploy()!.toBytes(),
      expected.getDeploy()!.toBytes()
    );
  });
});
