import { BigNumber } from '@ethersproject/bignumber';

import { Duration, Timestamp } from './Time';
import { TransactionV1 } from './Transaction';
import { InitiatorAddr } from './InitiatorAddr';
import { PrivateKey } from './keypair/PrivateKey';
import { FixedMode, PricingMode } from './PricingMode';

import { KeyAlgorithm } from './keypair/Algorithm';

import { SessionTarget, TransactionTarget } from './TransactionTarget';
import {
  TransactionEntryPoint,
  TransactionEntryPointEnum
} from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { Args } from './Args';
import {
  CLValue,
  CLValueOption,
  CLValueUInt512,
  CLValueUInt64
} from './clvalue';
import { PublicKey } from './keypair';
import { TransactionV1Payload } from './TransactionV1Payload';
import { Hash } from './key';
import { assert, expect } from 'chai';

describe('Test Transaction', () => {
  it('should create a Transaction from TransactionV1', async () => {
    const keys = await PrivateKey.generate(KeyAlgorithm.ED25519);
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
      amount: CLValueUInt512.newCLUInt512(BigNumber.from(paymentAmount)),
      id: CLValueOption.newCLOption(CLValueUInt64.newCLUint64(3))
    });

    const sessionTarget = new SessionTarget();

    sessionTarget.runtime = 'VmCasperV1';
    sessionTarget.transferredValue = 1000;
    sessionTarget.moduleBytes = Uint8Array.from([1]);
    sessionTarget.isInstallUpgrade = false;
    sessionTarget.seed = Hash.fromHex(
      '8bf9d406ab901428d43ecd3a6f214b864e7ef8316934e5e0f049650a65b40d73'
    );

    const transactionPayload = TransactionV1Payload.build({
      initiatorAddr: new InitiatorAddr(keys.publicKey),
      ttl: new Duration(1800000),
      args,
      timestamp: new Timestamp(new Date()),
      category: 2,
      entryPoint: new TransactionEntryPoint(TransactionEntryPointEnum.Call),
      scheduling: new TransactionScheduling({}),
      transactionTarget: new TransactionTarget(
        undefined,
        undefined,
        sessionTarget
      ),
      chainName: 'casper-net-1',
      pricingMode
    });

    const transaction = TransactionV1.makeTransactionV1(transactionPayload);
    await transaction.sign(keys);

    const toJson = TransactionV1.toJson(transaction);
    const parsed = TransactionV1.fromJSON(toJson);

    const transactionPaymentAmount = parsed.payload.args.args
      .get('amount')!
      .toString();

    assert.deepEqual(parsed.approvals[0].signer, keys.publicKey);
    expect(transaction.payload).to.deep.equal(transactionPayload);
    assert.deepEqual(parseInt(transactionPaymentAmount, 10), paymentAmount);
  });
});
