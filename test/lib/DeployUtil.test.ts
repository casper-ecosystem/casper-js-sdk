import { expect, assert } from 'chai';
import { Keys, DeployUtil, CLValueBuilder } from '../../src/lib';
import { humanizerTTL, dehumanizerTTL } from '../../src/lib/DeployUtil';
import { TypedJSON } from 'typedjson';

const testDeploy = () => {
  const senderKey = Keys.Ed25519.new();
  const recipientKey = Keys.Ed25519.new();
  const networkName = 'test-network';
  const paymentAmount = 10000000000000;
  const transferAmount = 10;
  const transferId = 34;

  let deployParams = new DeployUtil.DeployParams(
    senderKey.publicKey,
    networkName
  );
  let session = DeployUtil.ExecutableDeployItem.newTransfer(
    transferAmount,
    recipientKey.publicKey,
    undefined,
    transferId
  );
  let payment = DeployUtil.standardPayment(paymentAmount);
  let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
  deploy = DeployUtil.signDeploy(deploy, senderKey);
  return deploy;
}

describe('DeployUtil', () => {
  it('should stringify/parse DeployHeader correctly', function() {
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

  it('should allow to extract data from Transfer', function() {
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
      deploy.payment
        .getArgByName('amount')!
        .value()
        .toNumber(),
      paymentAmount
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('amount')!
        .value()
        .toNumber(),
      transferAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('target')!.value(),
      recipientKey.accountHash()
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('id')!
        .value()
        .unwrap()
        .value()
        .toNumber(),
      id
    );
    assert.deepEqual(deploy.approvals[0].signer, senderKey.accountHex());
    assert.deepEqual(deploy.approvals[1].signer, recipientKey.accountHex());
  });

  it('should allow to add arg to Deploy', function() {
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
      CLValueBuilder.u32(customId)
    );

    // Serialize and deserialize deploy.
    let json = DeployUtil.deployToJson(deploy);
    deploy = DeployUtil.deployFromJson(json)!;

    assert.deepEqual(
      deploy.session
        .getArgByName('custom_id')!
        .value()
        .toNumber(),
      customId
    );
    assert.isTrue(deploy.isTransfer());
    assert.isTrue(deploy.isStandardPayment());
    assert.deepEqual(deploy.header.account, senderKey.publicKey);
    assert.deepEqual(
      deploy.payment
        .getArgByName('amount')!
        .value()
        .toNumber(),
      paymentAmount
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('amount')!
        .value()
        .toNumber(),
      transferAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('target')!.value(),
      recipientKey.accountHash()
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('id')!
        .value()
        .unwrap()
        .value()
        .toNumber(),
      id
    );

    assert.notEqual(oldDeploy.hash, deploy.hash);
    assert.notEqual(oldDeploy.header.bodyHash, deploy.header.bodyHash);
  });

  it('should not allow to add arg to a signed Deploy', function() {
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
      DeployUtil.addArgToDeploy(deploy, 'custom_id', CLValueBuilder.u32(customId));
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
      from.publicKey
    );

    assert.deepEqual(
      transferDeploy.session.getArgByName('fromPublicKey'),
      from.publicKey
    );

    let newTransferDeploy = DeployUtil.deployFromJson(
      DeployUtil.deployToJson(transferDeploy)
    );

    assert.deepEqual(
      newTransferDeploy?.session.getArgByName('fromPublicKey'),
      from.publicKey
    );
  });

  it('Should not allow for to deserialize a deploy from JSON with a wrong deploy hash', function () {
    let deploy = testDeploy();
    let json = DeployUtil.deployToJson(deploy);
    Object.assign(json.deploy, { hash: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" });
    assert.isUndefined(DeployUtil.deployFromJson(json));
  });

  it('Should not allow for to deserialize a deploy from JSON with a wrong body_hash', function () {
    let deploy = testDeploy();
    let json = DeployUtil.deployToJson(deploy);
    let header = Object(json.deploy)['header'];
    header['body_hash'] = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    Object.assign(json.deploy, { header });
    assert.isUndefined(DeployUtil.deployFromJson(json));
  });

  it('Should convert ms to humanized string', function () {
    const strTtl30m = humanizerTTL(1800000);
    const strTtl45m = humanizerTTL(2700000);
    const strTtl1h = humanizerTTL(3600000);
    const strTtl1h30m = humanizerTTL(5400000);
    const strTtl1day = humanizerTTL(86400000);
    const strTtlCustom = humanizerTTL(86103000);

    expect(strTtl30m).to.be.eq("30m");
    expect(strTtl45m).to.be.eq("45m");
    expect(strTtl1h).to.be.eq("1h");
    expect(strTtl1h30m).to.be.eq("1h 30m");
    expect(strTtl1day).to.be.eq("1day");
    expect(strTtlCustom).to.be.eq("23h 55m 3s");
  });

  it('Should convert humanized string to ms', function () {
    const msTtl30m = dehumanizerTTL("30m");
    const msTtl45m = dehumanizerTTL("45m");
    const msTtl1h = dehumanizerTTL("1h");
    const msTtl1h30m = dehumanizerTTL("1h 30m");
    const msTtl1day = dehumanizerTTL("1day");
    const msTtlCustom = dehumanizerTTL("23h 55m 3s");

    expect(msTtl30m).to.be.eq(1800000);
    expect(msTtl45m).to.be.eq(2700000);
    expect(msTtl1h).to.be.eq(3600000);
    expect(msTtl1h30m).to.be.eq(5400000);
    expect(msTtl1day).to.be.eq(86400000);
    expect(msTtlCustom).to.be.eq(86103000);
  });

  it('Should not allow to create new transfer without providing transfer-id', () => {
    const recipientKey = Keys.Ed25519.new();
    const transferAmount = 10;

    /* @ts-ignore */
    const badFn = () => DeployUtil.ExecutableDeployItem.newTransfer(
      transferAmount,
      recipientKey.publicKey,
      undefined,
    );

    expect(badFn).to.throw('transfer-id missing in new transfer.');
  });

  it('newTransferToUniqAddress should construct proper deploy', () => {
    const senderKey = Keys.Ed25519.new();
    const recipientKey = Keys.Ed25519.new();
    const networkName = 'test-network';
    const paymentAmount = 10000000000000;
    const transferAmount = 10;
    const transferId = 34;

    const uniqAddress = new DeployUtil.UniqAddress(recipientKey.publicKey, transferId);

    let deploy = DeployUtil.ExecutableDeployItem.newTransferToUniqAddress(
      senderKey.publicKey,
      uniqAddress,
      transferAmount,
      paymentAmount,
      networkName
    );

    deploy = DeployUtil.signDeploy(deploy, senderKey);

    assert.isTrue(deploy.isTransfer());
    assert.isTrue(deploy.isStandardPayment());
    assert.deepEqual(deploy.header.account, senderKey.publicKey);
    assert.deepEqual(
      deploy.payment.getArgByName('amount')!.value().toNumber(),
      paymentAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('amount')!.value().toNumber(),
      transferAmount
    );
    assert.deepEqual(
      deploy.session.getArgByName('target')!.value(),
      recipientKey.accountHash()
    );
    assert.deepEqual(
      deploy.session
        .getArgByName('id')!
        .value()
        .unwrap()
        .value()
        .toNumber(),
      transferId
    );
  });

  it('DeployUtil.UniqAddress should serialize and deserialize', () => {
    const recipientKey = Keys.Ed25519.new();
    const hexAddress = recipientKey.publicKey.toHex();
    const transferId = "80172309";
    const transferIdHex = "0x04c75515";

    const uniqAddress = new DeployUtil.UniqAddress(recipientKey.publicKey, transferId);

    expect(uniqAddress).to.be.instanceof(DeployUtil.UniqAddress);
    expect(uniqAddress.toString()).to.be.eq(`${hexAddress}-${transferIdHex}`);
  });

  it('DeployUtil.deployToBytes should produce correct byte representation.', () => {
    let deploy = DeployUtil.deployFromJson({
      "deploy": {
        "hash": "d7a68bbe656a883d04bba9f26aa340dbe3f8ec99b2adb63b628f2bc920431998",
        "header": {
          "account": "017f747b67bd3fe63c2a736739dfe40156d622347346e70f68f51c178a75ce5537",
          "timestamp": "2021-05-04T14:20:35.104Z",
          "ttl": "30m",
          "gas_price": 2,
          "body_hash": "f2e0782bba4a0a9663cafc7d707fd4a74421bc5bfef4e368b7e8f38dfab87db8",
          "dependencies": [
            "0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
            "1010101010101010101010101010101010101010101010101010101010101010"
          ],
          "chain_name": "mainnet"
        },
        "payment": {
          "ModuleBytes": {
            "module_bytes": "",
            "args": [
              [
                "amount",
                {
                  "cl_type": "U512",
                  "bytes": "0400ca9a3b",
                  "parsed": "1000000000"
                }
              ]
            ]
          }
        },
        "session": {
          "Transfer": {
            "args": [
              [
                "amount",
                {
                  "cl_type": "U512",
                  "bytes": "05005550b405",
                  "parsed": "24500000000"
                }
              ],
              [
                "target",
                {
                  "cl_type": {
                    "ByteArray": 32
                  },
                  "bytes": "0101010101010101010101010101010101010101010101010101010101010101",
                  "parsed": "0101010101010101010101010101010101010101010101010101010101010101"
                }
              ],
              [
                "id",
                {
                  "cl_type": {
                    "Option": "U64"
                  },
                  "bytes": "01e703000000000000",
                  "parsed": 999
                }
              ],
              [
                "additional_info",
                {
                  "cl_type": "String",
                  "bytes": "1000000074686973206973207472616e73666572",
                  "parsed": "this is transfer"
                }
              ]
            ]
          }
        },
        "approvals": [
          {
            "signer": "017f747b67bd3fe63c2a736739dfe40156d622347346e70f68f51c178a75ce5537",
            "signature": "0195a68b1a05731b7014e580b4c67a506e0339a7fffeaded9f24eb2e7f78b96bdd900b9be8ca33e4552a9a619dc4fc5e4e3a9f74a4b0537c14a5a8007d62a5dc06"
          }
        ]
      }
    });

    let expected = "017f747b67bd3fe63c2a736739dfe40156d622347346e70f68f51c178a75ce5537a087c0377901000040771b00000000000200000000000000f2e0782bba4a0a9663cafc7d707fd4a74421bc5bfef4e368b7e8f38dfab87db8020000000f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f1010101010101010101010101010101010101010101010101010101010101010070000006d61696e6e6574d7a68bbe656a883d04bba9f26aa340dbe3f8ec99b2adb63b628f2bc92043199800000000000100000006000000616d6f756e74050000000400ca9a3b08050400000006000000616d6f756e740600000005005550b40508060000007461726765742000000001010101010101010101010101010101010101010101010101010101010101010f200000000200000069640900000001e7030000000000000d050f0000006164646974696f6e616c5f696e666f140000001000000074686973206973207472616e736665720a01000000017f747b67bd3fe63c2a736739dfe40156d622347346e70f68f51c178a75ce55370195a68b1a05731b7014e580b4c67a506e0339a7fffeaded9f24eb2e7f78b96bdd900b9be8ca33e4552a9a619dc4fc5e4e3a9f74a4b0537c14a5a8007d62a5dc06";

    let result = Buffer.from(DeployUtil.deployToBytes(deploy!)).toString('hex');

    assert.equal(result, expected);
  });
});
