import { expect, assert } from 'chai';
import { Keys, DeployUtil, CLValue } from '../../src/lib';
import { TypedJSON } from 'typedjson';

describe('DeployUtil', () => {
  it('should stringify/parse DeployHeader correctly', function () {
    const ed25519Key = Keys.Ed25519.new();
    const deployHeader = new DeployUtil.DeployHeader(
      ed25519Key.publicKey,
      123456,
      654321,
      10,
      Uint8Array.from(Array(32).fill(42)),
      [Uint8Array.from(Array(32).fill(2))],
      'test-network'
    );
    const serializer = new TypedJSON(DeployUtil.DeployHeader);
    const json = serializer.stringify(deployHeader);
    const deployHeader1 = serializer.parse(json);
    expect(deployHeader1).to.deep.equal(deployHeader);
  });

  it('should allow to extract data from Transfer', function () {
    const senderKey = Keys.Ed25519.new();
    const recipientKey = Keys.Ed25519.new();
    const networkName = 'test-network';
    const paymentAmount = 10000000000000;
    const transferAmount = 10;
    const id = 34;

    let deployParams = new DeployUtil.DeployParams(
      senderKey.publicKey,
      networkName
    );
    let session = DeployUtil.ExecutableDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
      id
    );
    let payment = DeployUtil.standardPayment(paymentAmount);
    let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    deploy = DeployUtil.signDeploy(deploy, senderKey);
    deploy = DeployUtil.signDeploy(deploy, recipientKey);

    // Serialize deploy to JSON.
    let json = DeployUtil.deployToJson(deploy);

    // Deserialize deploy from JSON.
    deploy = DeployUtil.deployFromJson(json)!;

    assert.isTrue(deploy.isTransfer());
    assert.isTrue(deploy.isStandardPayment());
    assert.deepEqual(deploy.header.account, senderKey.publicKey);
    assert.deepEqual(
      deploy.payment.getArgByName('amount')!.asBigNumber().toNumber(),
      paymentAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('amount')!.asBigNumber().toNumber(),
      transferAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('target')!.asBytesArray(),
      recipientKey.accountHash()
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('id')!
        .asOption()
        .getSome()
        .asBigNumber()
        .toNumber(),
      id
    );
    assert.deepEqual(deploy.approvals[0].signer, senderKey.accountHex());
    assert.deepEqual(deploy.approvals[1].signer, recipientKey.accountHex());
  });

  it('should allow to add arg to Deploy', function () {
    const senderKey = Keys.Ed25519.new();
    const recipientKey = Keys.Ed25519.new();
    const networkName = 'test-network';
    const paymentAmount = 10000000000000;
    const transferAmount = 10;
    const id = 34;
    const customId = 60;

    let deployParams = new DeployUtil.DeployParams(
      senderKey.publicKey,
      networkName
    );
    let session = DeployUtil.ExecutableDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
      id
    );
    let payment = DeployUtil.standardPayment(paymentAmount);
    let oldDeploy = DeployUtil.makeDeploy(deployParams, session, payment);

    // Add new argument.
    let deploy = DeployUtil.addArgToDeploy(
      oldDeploy,
      'custom_id',
      CLValue.u32(customId)
    );

    // Serialize and deserialize deploy.
    let json = DeployUtil.deployToJson(deploy);
    deploy = DeployUtil.deployFromJson(json)!;

    assert.deepEqual(
      deploy.session.getArgByName('custom_id')!.asBigNumber().toNumber(),
      customId
    );
    assert.isTrue(deploy.isTransfer());
    assert.isTrue(deploy.isStandardPayment());
    assert.deepEqual(deploy.header.account, senderKey.publicKey);
    assert.deepEqual(
      deploy.payment.getArgByName('amount')!.asBigNumber().toNumber(),
      paymentAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('amount')!.asBigNumber().toNumber(),
      transferAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('target')!.asBytesArray(),
      recipientKey.accountHash()
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('id')!
        .asOption()
        .getSome()
        .asBigNumber()
        .toNumber(),
      id
    );

    assert.notEqual(oldDeploy.hash, deploy.hash);
    assert.notEqual(oldDeploy.header.bodyHash, deploy.header.bodyHash);
  });

  it('should not allow to add arg to a signed Deploy', function () {
    const senderKey = Keys.Ed25519.new();
    const recipientKey = Keys.Ed25519.new();
    const networkName = 'test-network';
    const paymentAmount = 10000000000000;
    const transferAmount = 10;
    const id = 34;
    const customId = 60;

    let deployParams = new DeployUtil.DeployParams(
      senderKey.publicKey,
      networkName
    );
    let session = DeployUtil.ExecutableDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
      id
    );
    let payment = DeployUtil.standardPayment(paymentAmount);
    let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    deploy = DeployUtil.signDeploy(deploy, senderKey);

    expect(() => {
      // Add new argument.
      DeployUtil.addArgToDeploy(deploy, 'custom_id', CLValue.u32(customId));
    }).to.throw('Can not add argument to already signed deploy.');
  });

  it('should allow to extract additional args from Transfer.', function () {
    // const from = Keys.Ed25519.new();
    const from = Keys.Secp256K1.new();
    const to = Keys.Ed25519.new();
    const networkName = 'test-network';
    const paymentAmount = 10000000000000;
    const transferAmount = 10;
    const id = 34;

    let deployParams = new DeployUtil.DeployParams(from.publicKey, networkName);
    let session = DeployUtil.ExecutableDeployItem.newTransfer(
      transferAmount,
      to.publicKey,
      undefined,
      id
    );
    let payment = DeployUtil.standardPayment(paymentAmount);
    let deploy = DeployUtil.makeDeploy(deployParams, session, payment);

    let transferDeploy = DeployUtil.addArgToDeploy(
      deploy,
      'fromPublicKey',
      CLValue.publicKey(from.publicKey)
    );

    assert.deepEqual(
      transferDeploy.session.getArgByName('fromPublicKey')?.asPublicKey(),
      from.publicKey
    );

    let newTransferDeploy = DeployUtil.deployFromJson(
      DeployUtil.deployToJson(transferDeploy)
    );

    assert.deepEqual(
      newTransferDeploy?.session.getArgByName('fromPublicKey')?.asPublicKey(),
      from.publicKey
    );
  });
});
