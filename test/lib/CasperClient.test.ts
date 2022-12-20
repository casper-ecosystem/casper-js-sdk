import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { expect } from 'chai';

import { Secp256K1, SignatureAlgorithm } from '../../src/lib/Keys';
import { decodeBase16, Keys, DeployUtil, CasperClient } from '../../src';

const { Deploy } = DeployUtil;

let casperClient: CasperClient;
describe('CasperClient', () => {
  before(() => {
    casperClient = new CasperClient('https://rpc.testnet.casperlabs.io/rpc');
  });

  it('should generate new Ed25519 key pair, and compute public key from private key', () => {
    const edKeyPair = casperClient.newKeyPair(SignatureAlgorithm.Ed25519);
    const publicKey = edKeyPair.publicKey.value();
    const privateKey = edKeyPair.privateKey;
    const convertFromPrivateKey = casperClient.privateToPublicKey(
      privateKey,
      SignatureAlgorithm.Ed25519
    );
    expect(convertFromPrivateKey).to.deep.equal(publicKey);
  });

  it('should generate PEM file for Ed25519 correctly', () => {
    const edKeyPair = casperClient.newKeyPair(SignatureAlgorithm.Ed25519);
    const publicKeyInPem = edKeyPair.exportPublicKeyInPem();
    const privateKeyInPem = edKeyPair.exportPrivateKeyInPem();

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    fs.writeFileSync(tempDir + '/public.pem', publicKeyInPem);
    fs.writeFileSync(tempDir + '/private.pem', privateKeyInPem);
    const publicKeyFromFIle = casperClient.loadPublicKeyFromFile(
      tempDir + '/public.pem',
      SignatureAlgorithm.Ed25519
    );
    const privateKeyFromFile = casperClient.loadPrivateKeyFromFile(
      tempDir + '/private.pem',
      SignatureAlgorithm.Ed25519
    );

    const keyPairFromFile = Keys.Ed25519.parseKeyPair(
      publicKeyFromFIle,
      privateKeyFromFile
    );

    expect(keyPairFromFile.publicKey.value()).to.deep.equal(
      edKeyPair.publicKey.value()
    );
    expect(keyPairFromFile.privateKey).to.deep.equal(edKeyPair.privateKey);

    // load the keypair from pem file of private key
    const loadedKeyPair = casperClient.loadKeyPairFromPrivateFile(
      tempDir + '/private.pem',
      SignatureAlgorithm.Ed25519
    );
    expect(loadedKeyPair.publicKey.value()).to.deep.equal(
      edKeyPair.publicKey.value()
    );
    expect(loadedKeyPair.privateKey).to.deep.equal(edKeyPair.privateKey);
  });

  it('should generate new Secp256K1 key pair, and compute public key from private key', () => {
    const edKeyPair = casperClient.newKeyPair(SignatureAlgorithm.Secp256K1);
    const publicKey = edKeyPair.publicKey.value();
    const privateKey = edKeyPair.privateKey;
    const convertFromPrivateKey = casperClient.privateToPublicKey(
      privateKey,
      SignatureAlgorithm.Secp256K1
    );
    expect(convertFromPrivateKey).to.deep.equal(publicKey);
  });

  it('should generate PEM file for Secp256K1 and restore the key pair from PEM file correctly', () => {
    const edKeyPair: Secp256K1 = casperClient.newKeyPair(
      SignatureAlgorithm.Secp256K1
    );
    const publicKeyInPem = edKeyPair.exportPublicKeyInPem();
    const privateKeyInPem = edKeyPair.exportPrivateKeyInPem();

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    fs.writeFileSync(tempDir + '/public.pem', publicKeyInPem);
    fs.writeFileSync(tempDir + '/private.pem', privateKeyInPem);
    const publicKeyFromFIle = casperClient.loadPublicKeyFromFile(
      tempDir + '/public.pem',
      SignatureAlgorithm.Secp256K1
    );
    const privateKeyFromFile = casperClient.loadPrivateKeyFromFile(
      tempDir + '/private.pem',
      SignatureAlgorithm.Secp256K1
    );

    const keyPairFromFile = Keys.Secp256K1.parseKeyPair(
      publicKeyFromFIle,
      privateKeyFromFile,
      'raw'
    );

    expect(keyPairFromFile.publicKey.value()).to.deep.equal(
      edKeyPair.publicKey.value()
    );
    expect(keyPairFromFile.privateKey).to.deep.equal(edKeyPair.privateKey);

    // load the keypair from pem file of private key
    const loadedKeyPair = casperClient.loadKeyPairFromPrivateFile(
      tempDir + '/private.pem',
      SignatureAlgorithm.Secp256K1
    );
    expect(loadedKeyPair.publicKey.value()).to.deep.equal(
      edKeyPair.publicKey.value()
    );
    expect(loadedKeyPair.privateKey).to.deep.equal(edKeyPair.privateKey);
  });

  it('should create a HK wallet and derive child account correctly', function() {
    const seed =
      'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
    const hdKey = casperClient.newHdWallet(decodeBase16(seed));
    const secpKey1 = hdKey.deriveIndex(1);
    const msg = Buffer.from('hello world');
    const signature = secpKey1.sign(msg);
    expect(secpKey1.verify(signature, msg)).to.be.equal(true);

    const secpKey2 = hdKey.deriveIndex(2);
    const signature2 = secpKey2.sign(msg);
    expect(secpKey2.verify(signature2, msg)).to.be.equal(true);
  });

  it('Signatures in deploy signed using Ed25519 / Secp256K1 key', function() {
    const json = JSON.parse(
      '{"deploy":{"hash":"510d968d880a89cb92b985578312a535ea1412aaa6cb4a514456135d415b32f5","header":{"account":"0109791772400ea911e2adcb7569d805da75654fc1360c06f93832f020e13aa0cf","timestamp":"2022-04-03T19:18:42.176Z","ttl":"30m","gas_price":1,"body_hash":"ea0a6bc12489f4ccf0b7564bcacd2918b744b9e4b8cad71d52afd9159f33b108","dependencies":[],"chain_name":"casper-test"},"payment":{"ModuleBytes":{"module_bytes":"","args":[["amount",{"bytes":"0500e40b5402","cl_type":"U512"}]]}},"session":{"Transfer":{"args":[["amount",{"bytes":"0500ba1dd205","cl_type":"U512"}],["target",{"bytes":"01861759c3e71b1953f2be3a92c406a3423fd36ea6a8ff6fd0e71bb39685d68893","cl_type":"PublicKey"}],["id",{"bytes":"01addd020000000000","cl_type":{"Option":"U64"}}]]}},"approvals":[]}}'
    );
    const validSignatures = [
      JSON.parse(
        '[{"signer":"02032ecf3a29fda8bf82af344c586f277867ad870e7d7b56510e52b425bfb6318264","signature":"0288734bc562139b989991cdb2ceb8840b12d42a7e7ada9c1247737eaa2268543c02cae5c00da8316821ac978c2d423a270464f79337f5b54f077b1773a3748e70"}]'
      ),
      JSON.parse(
        '[{"signer":"0109791772400ea911e2adcb7569d805da75654fc1360c06f93832f020e13aa0cf","signature":"019b58c52752df47a42590d08de3f994e6e85877469abb5ace25adc53adf1f4dd6e071fcdc9db575451afe41f3d47ebdae8434467ab2c70e10c3eebd70bc4e3204"}]'
      )
    ];

    validSignatures.forEach(approvals => {
      const validDeploy = casperClient
        .deployFromJson({ ...json, deploy: { ...json.deploy, approvals } })
        .unwrap();
      expect(validDeploy).to.be.an.instanceof(Deploy);
    });

    expect(casperClient.deployFromJson(json).unwrap().header.ttl).to.be.eq(
      1800000
    );
  });
});
