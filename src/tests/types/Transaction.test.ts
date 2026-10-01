import { BigNumber } from '@ethersproject/bignumber';
import { TypedJSON } from 'typedjson';
import { assert, expect } from 'vitest';

import {
  Duration,
  Timestamp,
  Transaction,
  TransactionV1,
  InitiatorAddr,
  FixedMode,
  PricingMode,
  KeyAlgorithm,
  PrivateKey,
  PublicKey,
  SessionTarget,
  TransactionRuntime,
  TransactionTarget,
  TransactionEntryPoint,
  TransactionEntryPointEnum,
  TransactionScheduling,
  Args,
  CLValue,
  TransactionV1Payload,
  NativeTransferBuilder,
  Hash,
  TransactionHash
} from '../../types';

describe('Test Transaction', () => {
  it('should create a TransactionV1 with correct payload instance', async () => {
    const keys = PrivateKey.generate(KeyAlgorithm.ED25519);
    const paymentAmount = 20000000000000;

    const pricingMode = new PricingMode();
    const fixedMode = new FixedMode();
    fixedMode.gasPriceTolerance = 3;
    fixedMode.additionalComputationFactor = 1;
    pricingMode.fixed = fixedMode;

    const args = Args.fromMap({
      target: CLValue.newCLPublicKey(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      ),
      amount: CLValue.newCLUInt512(BigNumber.from(paymentAmount)),
      id: CLValue.newCLOption(CLValue.newCLUint64(3))
    });

    const sessionTarget = new SessionTarget();

    sessionTarget.runtime = TransactionRuntime.vmCasperV1();
    sessionTarget.moduleBytes = Uint8Array.from([1]);
    sessionTarget.isInstallUpgrade = false;

    const transactionTarget = new TransactionTarget(
      undefined,
      undefined,
      sessionTarget
    );
    const scheduling = new TransactionScheduling({});
    const entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Call
    );

    const transactionPayload = TransactionV1Payload.build({
      initiatorAddr: new InitiatorAddr(keys.publicKey),
      ttl: new Duration(1800000),
      args,
      timestamp: new Timestamp(new Date()),
      entryPoint,
      scheduling,
      transactionTarget,
      chainName: 'casper-net-1',
      pricingMode
    });

    const transaction = TransactionV1.makeTransactionV1(transactionPayload);
    transaction.sign(keys);

    const transactionPaymentAmount = transaction.payload.fields.args.args
      .get('amount')!
      .toString();

    assert.deepEqual(transaction.approvals[0].signer, keys.publicKey);
    expect(transaction.payload).to.deep.equal(transactionPayload);
    assert.deepEqual(parseInt(transactionPaymentAmount, 10), paymentAmount);
    expect(transaction.payload.chainName).to.deep.equal('casper-net-1');
    expect(transaction.payload.fields.target).to.deep.equal(transactionTarget);
    expect(transaction.payload.fields.args).to.deep.equal(args);
    expect(transaction.payload.fields.scheduling).to.deep.equal(scheduling);
    expect(transaction.payload.fields.entryPoint).to.deep.equal(entryPoint);
  });

  it('should create native transfer TransactionV1 with builder', async () => {
    const sender = PrivateKey.generate(KeyAlgorithm.ED25519);

    const transaction = new NativeTransferBuilder()
      .from(sender.publicKey)
      .target(
        PublicKey.fromHex(
          '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
        )
      )
      .amount('25000000000')
      .id(Date.now())
      .chainName('casper-net-1')
      .payment(100_000_000)
      .build();

    transaction.sign(sender);

    const transactionV1 = transaction.getTransactionV1()!;
    const transactionPaymentAmount = transactionV1.payload.fields.args.args
      .get('amount')!
      .toString();

    assert.deepEqual(transaction.approvals[0].signer, sender.publicKey);
    assert.deepEqual(parseInt(transactionPaymentAmount, 10), 25000000000);
    expect(transactionV1.payload.chainName).to.deep.equal('casper-net-1');

    const txBytes = transaction.toBytes();
    assert.deepEqual(txBytes[0], 0x01);
  });

  it('should parse deploy json', async () => {
    const json = {
      deploy: {
        approvals: [],
        hash: '076E77DE17De7F262c5531017c214afd664D9702D4b5b771996aE4dcAf9C01f9',
        header: {
          account:
            '02024570ae3c361650d5b1Bcd1724a1aF09ffe067d7F69ebd75B567c10c8379a7719',
          timestamp: '2025-01-21T18:07:52.214Z',
          ttl: '30m',
          dependencies: [],
          gas_price: 1,
          body_hash:
            'D52E4B46542D9C83BA6EF894dBA82e475011166A4C5F434b0d99248cfDC9Abc5',
          chain_name: 'casper-test'
        },
        payment: {
          ModuleBytes: {
            module_bytes: '',
            args: [
              [
                'amount',
                {
                  cl_type: 'U512',
                  bytes: '0400943577',
                  parsed: '2000000000'
                }
              ]
            ]
          }
        },
        session: {
          StoredVersionedContractByHash: {
            hash: '6497c59f1bcfBBBC468Dc889dd73dCd542827fb966a24Eb33e4140Ab5BB4aE28',
            version: null,
            entry_point: 'mint',
            args: [
              [
                'recipient',
                {
                  cl_type: 'Key',
                  bytes:
                    '00ABbc44715BA77Ea117f9379A3f5b62879Be71D105b7508b610a676AEf4c3C26a',
                  parsed: {
                    Account:
                      'account-hash-ABBC44715ba77ea117f9379a3f5b62879Be71D105B7508B610a676AeF4C3C26A'
                  }
                }
              ],
              [
                'token_metas',
                {
                  cl_type: {
                    List: {
                      Map: {
                        key: 'String',
                        value: 'String'
                      }
                    }
                  },
                  bytes:
                    '0100000003000000040000006e616d65080000004e6f6f6f6f6f6f6f0b0000006465736372697074696f6e04000000747275650500000061737365745400000068747470733a2f2f697066732d676174657761792e637370722e73747564696f2f697066732f516d5a62714d767a5036706a45415554753135376d5470736e38526b4d637a585a48767a56784454647854436572',
                  parsed: ''
                }
              ]
            ]
          }
        }
      }
    };

    const tx = Transaction.fromJSON(json);
    const deployHash = Hash.fromJSON(json.deploy.hash);

    expect(tx.hash.toHex()).to.equal(
      '076e77de17de7f262c5531017c214afd664d9702d4b5b771996ae4dcaf9c01f9'
    );
    expect(tx.hash.equals(deployHash)).to.equal(true);
    // The reverse direction is the fragile one: reading the argument's private
    // `hashBytes` instead of `getHash()` bypasses `TransactionHash`'s override
    // and answers false here while the comparison above still answers true.
    expect(deployHash.equals(tx.hash)).to.equal(true);

    const txBytes = tx.toBytes();
    assert.deepEqual(txBytes[0], 0x00);
  });
});

// typedjson deserializes `TransactionHash` in Transfer, rpc/response and
// sse/event — always through the argument-less constructor, with the members
// assigned afterwards, so that path needs coverage of its own.
describe('TransactionHash', () => {
  const hex =
    '076e77de17de7f262c5531017c214afd664d9702d4b5b771996ae4dcaf9c01f9';

  it('should round-trip the Deploy variant through typedjson', () => {
    const serializer = new TypedJSON(TransactionHash);
    const parsed = serializer.parse({ Deploy: hex })!;

    expect(parsed.deploy?.toHex()).to.equal(hex);
    expect(parsed.transactionV1).to.be.undefined;
    expect(parsed.toHex()).to.equal(hex);
    expect(serializer.toPlainJson(parsed)).to.deep.equal({ Deploy: hex });
  });

  it('should round-trip the Version1 variant through typedjson', () => {
    const serializer = new TypedJSON(TransactionHash);
    const parsed = serializer.parse({ Version1: hex })!;

    expect(parsed.transactionV1?.toHex()).to.equal(hex);
    expect(parsed.deploy).to.be.undefined;
    expect(parsed.toHex()).to.equal(hex);
    expect(serializer.toPlainJson(parsed)).to.deep.equal({ Version1: hex });
  });

  it('should compare equal to a plain Hash in both directions, however built', () => {
    const hash = Hash.fromHex(hex);
    const fromFactory = TransactionHash.fromDeployHash(hash);
    const fromJson = new TypedJSON(TransactionHash).parse({ Deploy: hex })!;

    for (const transactionHash of [fromFactory, fromJson]) {
      expect(transactionHash.equals(hash)).to.equal(true);
      expect(hash.equals(transactionHash)).to.equal(true);
    }

    const other = Hash.fromHex('bb'.repeat(32));
    expect(other.equals(fromFactory)).to.equal(false);
    expect(fromFactory.equals(other)).to.equal(false);
  });
});
