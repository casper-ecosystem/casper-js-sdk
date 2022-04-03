import { expect } from 'chai';

import { CasperClient } from '../../src/lib/CasperClient';
import { Deploy } from '../../src/lib/DeployUtil';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Keys } from '../../src/lib';
import { Secp256K1, SignatureAlgorithm } from '../../src/lib/Keys';
import { decodeBase16 } from '../../src';

let casperClient: CasperClient;
describe('CasperClient', () => {
  before(() => {
    casperClient = new CasperClient('http://192.168.2.166:40101/rpc');
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

  it('should create deploy from Deploy JSON with ttl in minutes', function() {
    const json = JSON.parse(
      '{"deploy":{"hash":"1e4111d01748fca01c2986b2f6a576fb105fd8bc93c86e381b5c2b59dd177ef1","header":{"account":"0109791772400ea911e2adcb7569d805da75654fc1360c06f93832f020e13aa0cf","timestamp":"2022-04-03T16:22:46.995Z","ttl":"30m","gas_price":1,"body_hash":"ea0a6bc12489f4ccf0b7564bcacd2918b744b9e4b8cad71d52afd9159f33b108","dependencies":[],"chain_name":"casper-test"},"payment":{"ModuleBytes":{"module_bytes":"","args":[["amount",{"bytes":"0500e40b5402","cl_type":"U512"}]]}},"session":{"Transfer":{"args":[["amount",{"bytes":"0500ba1dd205","cl_type":"U512"}],["target",{"bytes":"01861759c3e71b1953f2be3a92c406a3423fd36ea6a8ff6fd0e71bb39685d68893","cl_type":"PublicKey"}],["id",{"bytes":"01addd020000000000","cl_type":{"Option":"U64"}}]]}},"approvals":[{"signer":"0109791772400ea911e2adcb7569d805da75654fc1360c06f93832f020e13aa0cf","signature":"01ddfc9ae220175a4a81527647b990dbceac97bb684916f5e8b6a40ba416d5174c3717629cd25d914805b7fd62fe0eaa04b943c66f6ad402b25ccca816c0911c03"}]}}'
    );
    const fromJson = casperClient.deployFromJson(json).unwrap();

    expect(fromJson).to.be.an.instanceof(Deploy);
    expect(fromJson!.header.ttl).to.be.eq(1800000);
  });

  it('Signatures in deploy signed using Secp256K1 key', function() {
    const json = JSON.parse(
      '{"deploy":{"hash":"72b6f3600eb2f7f6a6a28631e6de382d95b2772739439f2ae809386943620a26","header":{"account":"02032ecf3a29fda8bf82af344c586f277867ad870e7d7b56510e52b425bfb6318264","timestamp":"2022-04-03T16:40:40.258Z","ttl":"30m","gas_price":1,"body_hash":"ea0a6bc12489f4ccf0b7564bcacd2918b744b9e4b8cad71d52afd9159f33b108","dependencies":[],"chain_name":"casper-test"},"payment":{"ModuleBytes":{"module_bytes":"","args":[["amount",{"bytes":"0500e40b5402","cl_type":"U512"}]]}},"session":{"Transfer":{"args":[["amount",{"bytes":"0500ba1dd205","cl_type":"U512"}],["target",{"bytes":"01861759c3e71b1953f2be3a92c406a3423fd36ea6a8ff6fd0e71bb39685d68893","cl_type":"PublicKey"}],["id",{"bytes":"01addd020000000000","cl_type":{"Option":"U64"}}]]}},"approvals":[{"signer":"02032ecf3a29fda8bf82af344c586f277867ad870e7d7b56510e52b425bfb6318264","signature":"02be4710b855a25f0d979313178c82a50ebd434aa05dd9a4ce15f03d5dba83506d3e54fa05150b9e732328818c4dc74267e3e349c1213a8c58386658bf79149a69"}]}}'
    );
    const fromJson = casperClient.deployFromJson(json).unwrap();

    expect(fromJson).to.be.an.instanceof(Deploy);
    expect(fromJson!.header.ttl).to.be.eq(1800000);
  });
});
