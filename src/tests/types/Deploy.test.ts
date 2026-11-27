import { assert, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import {
  ExecutableDeployItem,
  TransferDeployItem,
  Deploy,
  DeployHeader,
  KeyAlgorithm,
  PrivateKey,
  Duration,
  Timestamp,
  Hash,
  dehumanizerTTL,
  humanizerTTL,
  Args,
  CLValue
} from '../../types';

describe('Deploy', () => {
  it('should stringify/parse DeployHeader correctly', async function () {
    const key = PrivateKey.generate(KeyAlgorithm.ED25519);

    const deployHeader = new DeployHeader(
      'test-network',
      Hash.createHashArray(Uint8Array.from(Array(32).fill(2))),
      10,
      new Timestamp(new Date(123456)),
      new Duration(654321),
      key.publicKey,
      new Hash(Uint8Array.from(Array(32).fill(42)))
    );

    const serializer = new TypedJSON(DeployHeader);
    const json = serializer.stringify(deployHeader);
    const deployHeader1 = serializer.parse(json);
    expect(deployHeader1).to.deep.equal(deployHeader);
  });

  it('should allow to extract data from Transfer', async function () {
    const senderKey = PrivateKey.generate(KeyAlgorithm.ED25519);
    const recipientKey = PrivateKey.generate(KeyAlgorithm.ED25519);
    const networkName = 'test-network';
    const paymentAmount = '10000000000000';
    const transferAmount = '10';
    const id = 34;
    const executableDeployItem = new ExecutableDeployItem();

    const deployHeader = new DeployHeader(
      networkName,
      undefined,
      undefined,
      undefined,
      undefined,
      senderKey.publicKey,
      undefined
    );

    executableDeployItem.transfer = TransferDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
      id
    );

    const payment = ExecutableDeployItem.standardPayment(paymentAmount);
    let deploy = Deploy.makeDeploy(deployHeader, payment, executableDeployItem);
    deploy.sign(senderKey);
    deploy.sign(recipientKey);

    const json = Deploy.toJSON(deploy);

    deploy = Deploy.fromJSON(json);

    const deployPayment = deploy.payment.getArgByName('amount')!.toString();
    const deployTransferAmount = deploy.session
      .getArgByName('amount')!
      .toString();
    const deployId = deploy.session.getArgByName('id')!.toString();

    assert.isTrue(deploy.isTransfer());
    assert.isTrue(deploy.isStandardPayment());
    assert.deepEqual(deploy.header.account, senderKey.publicKey);
    assert.deepEqual(deployPayment, paymentAmount);
    assert.deepEqual(deployPayment, paymentAmount);
    assert.deepEqual(deployTransferAmount, transferAmount);
    assert.deepEqual(
      deploy.session.getArgByName('target')!.publicKey,
      recipientKey.publicKey
    );
    assert.deepEqual(parseInt(deployId, 10), id);
    assert.deepEqual(deploy.approvals[0].signer, senderKey.publicKey);
    assert.deepEqual(deploy.approvals[1].signer, recipientKey.publicKey);
  });

  it('Should convert ms to humanized string', function () {
    const strTtl30m = humanizerTTL(1800000);
    const strTtl45m = humanizerTTL(2700000);
    const strTtl1h = humanizerTTL(3600000);
    const strTtl1h30m = humanizerTTL(5400000);
    const strTtl1day = humanizerTTL(86400000);
    const strTtlCustom = humanizerTTL(86103000);

    expect(strTtl30m).to.be.eq('30m');
    expect(strTtl45m).to.be.eq('45m');
    expect(strTtl1h).to.be.eq('1h');
    expect(strTtl1h30m).to.be.eq('1h 30m');
    expect(strTtl1day).to.be.eq('1day');
    expect(strTtlCustom).to.be.eq('23h 55m 3s');
  });

  it('Should convert humanized string to ms', function () {
    const msTtl30m = dehumanizerTTL('30m');
    const msTtl45m = dehumanizerTTL('45m');
    const msTtl1h = dehumanizerTTL('1h');
    const msTtl1h30m = dehumanizerTTL('1h 30m');
    const msTtl1day = dehumanizerTTL('1day');
    const msTtlCustom = dehumanizerTTL('23h 55m 3s');

    expect(msTtl30m).to.be.eq(1800000);
    expect(msTtl45m).to.be.eq(2700000);
    expect(msTtl1h).to.be.eq(3600000);
    expect(msTtl1h30m).to.be.eq(5400000);
    expect(msTtl1day).to.be.eq(86400000);
    expect(msTtlCustom).to.be.eq(86103000);
  });

  it('Is possible to chain deploys using dependencies', async () => {
    const senderKey = PrivateKey.generate(KeyAlgorithm.ED25519);
    const recipientKey = PrivateKey.generate(KeyAlgorithm.ED25519);
    const networkName = 'test-network';
    const paymentAmount = '10000000000000';
    const transferAmount = '10';
    const transferId = 35;
    const payment = ExecutableDeployItem.standardPayment(paymentAmount);

    const executableDeployItem = new ExecutableDeployItem();

    const deployHeader = new DeployHeader(
      networkName,
      undefined,
      undefined,
      undefined,
      undefined,
      senderKey.publicKey,
      undefined
    );

    executableDeployItem.transfer = TransferDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
      transferId
    );

    const firstDeploy = Deploy.makeDeploy(
      deployHeader,
      payment,
      executableDeployItem
    );

    // Build second deploy with the first one as a dependency.
    const gasPrice = 1;
    const ttl = 1800000;
    const dependencies = [firstDeploy.hash];
    const secondDeployHeader = new DeployHeader(
      networkName,
      dependencies,
      gasPrice,
      undefined,
      new Duration(ttl),
      senderKey.publicKey
    );

    const secondDeploy = Deploy.makeDeploy(
      secondDeployHeader,
      payment,
      executableDeployItem
    );

    assert.deepEqual(secondDeploy.header.dependencies, [firstDeploy.hash]);
  });

  describe('newTransactionFromDeploy payment amount', () => {
    function deployWithPaymentAmount(amount: CLValue): Deploy {
      const key = PrivateKey.generate(KeyAlgorithm.ED25519);
      const header = new DeployHeader('test-network');
      header.account = key.publicKey;
      const session = new ExecutableDeployItem();
      session.transfer = TransferDeployItem.newTransfer(
        '2500000000',
        PrivateKey.generate(KeyAlgorithm.ED25519).publicKey,
        null,
        1
      );
      const payment = ExecutableDeployItem.newModuleBytes(
        new Uint8Array(),
        Args.fromMap({ amount })
      );
      return Deploy.makeDeploy(header, payment, session);
    }

    it('carries a decimal amount over exactly', () => {
      const tx = Deploy.newTransactionFromDeploy(
        deployWithPaymentAmount(CLValue.newCLUInt512('100000000'))
      );
      expect(tx.pricingMode.paymentLimited!.paymentAmount).to.equal(100000000);
    });

    it('reads a string amount as 0 instead of its numeric prefix', () => {
      // Custom payment wasm may take an amount of any type, so reading one must not throw.
      const tx = Deploy.newTransactionFromDeploy(
        deployWithPaymentAmount(CLValue.newCLString('5000xyz'))
      );
      expect(tx.pricingMode.paymentLimited!.paymentAmount).to.equal(0);
    });

    it.each([
      ['U8', CLValue.newCLUint8(50), 50],
      ['U64', CLValue.newCLUint64('5000'), 5000],
      ['U256', CLValue.newCLUInt256('5000'), 5000],
      ['decimal String', CLValue.newCLString('5000'), 5000]
    ])('reads a %s amount', (_name, amount, expected) => {
      const tx = Deploy.newTransactionFromDeploy(
        deployWithPaymentAmount(amount)
      );
      expect(tx.pricingMode.paymentLimited!.paymentAmount).to.equal(expected);
    });

    it('reads a negative amount as 0', () => {
      const tx = Deploy.newTransactionFromDeploy(
        deployWithPaymentAmount(CLValue.newCLInt64(-5000))
      );
      expect(tx.pricingMode.paymentLimited!.paymentAmount).to.equal(0);
    });

    it('rejects an amount that a JS number would round', () => {
      const deploy = deployWithPaymentAmount(
        CLValue.newCLUInt512('9007199254740993')
      );
      expect(() => Deploy.newTransactionFromDeploy(deploy)).to.throw();
    });
  });

  it('getDeploySizeInBytes matches the serialized deploy', () => {
    const key = PrivateKey.generate(KeyAlgorithm.ED25519);
    const header = new DeployHeader('test-network');
    header.account = key.publicKey;
    const session = new ExecutableDeployItem();
    session.transfer = TransferDeployItem.newTransfer(
      '2500000000',
      PrivateKey.generate(KeyAlgorithm.ED25519).publicKey,
      null,
      1
    );
    const deploy = Deploy.makeDeploy(
      header,
      ExecutableDeployItem.standardPayment('100000000'),
      session
    );
    deploy.sign(key);

    // u32 approval count, then per ed25519 approval: 33-byte signer + 65-byte signature.
    const expected =
      deploy.header.toBytes().length +
      32 +
      deploy.payment.bytes().length +
      deploy.session.bytes().length +
      4 +
      (33 + 65);

    expect(Deploy.getDeploySizeInBytes(deploy)).to.equal(expected);
  });
});
