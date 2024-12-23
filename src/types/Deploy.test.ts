import { expect, assert } from 'chai';
import { TypedJSON } from 'typedjson';

import {
  ExecutableDeployItem,
  TransferDeployItem
} from './ExecutableDeployItem';
import { Deploy, DeployHeader } from './Deploy';
import { KeyAlgorithm, PrivateKey } from './keypair';
import { Duration, Timestamp } from './Time';
import { Hash } from './key';
import { dehumanizerTTL, humanizerTTL } from './SerializationUtils';

describe('Deploy', () => {
  it('should stringify/parse DeployHeader correctly', async function() {
    const key = await PrivateKey.generate(KeyAlgorithm.ED25519);

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

  it('should allow to extract data from Transfer', async function() {
    const senderKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
    const recipientKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
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

  it('Should convert ms to humanized string', function() {
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

  it('Should convert humanized string to ms', function() {
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
    const senderKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
    const recipientKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
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
});
