import { BigNumber } from '@ethersproject/bignumber';
import { assert, expect } from 'chai';

import { Duration, Timestamp } from './Time';
import { TransactionV1 } from './Transaction';
import { InitiatorAddr } from './InitiatorAddr';
import { FixedMode, PricingMode } from './PricingMode';
import { KeyAlgorithm, PrivateKey, PublicKey } from './keypair';
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
import { TransactionV1Payload } from './TransactionV1Payload';
import { Hash } from './key';

describe('Test Transaction', () => {
  it('should create a TransactionV1 with correct payload instance', async () => {
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
    await transaction.sign(keys);

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
});
