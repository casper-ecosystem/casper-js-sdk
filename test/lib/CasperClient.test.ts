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
    casperClient = new CasperClient(
      'http://192.168.2.166:40101/rpc'
    );
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
    const json = {
      deploy: {
        approvals: [
          {
            signature: '130 chars',
            signer:
              '012d9dded24145247421eb8b904dda5cce8a7c77ae18de819a25628c4a01adbf76'
          }
        ],
        hash:
          'ceaaa76e7fb850a09d5c9d16ac995cb52eff2944066cfd8cac27f3595f11b652',
        header: {
          account:
            '012d9dded24145247421eb8b904dda5cce8a7c77ae18de819a25628c4a01adbf76',
          body_hash:
            '0e68d66a9dfab19bb1898d5f4d11a4f55dd06a0cae3917afc1eae4a5b56352e7',
          chain_name: 'casper-test',
          dependencies: [],
          gas_price: 1,
          timestamp: '2021-05-06T07:49:32.583Z',
          ttl: '30m'
        },
        payment: {
          ModuleBytes: {
            args: [
              [
                'amount',
                {
                  bytes: '0500e40b5402',
                  cl_type: 'U512',
                  parsed: '10000000000'
                }
              ]
            ],
            module_bytes: ''
          }
        },
        session: {
          Transfer: {
            args: [
              [
                'amount',
                {
                  bytes: '0500743ba40b',
                  cl_type: 'U512',
                  parsed: '50000000000'
                }
              ],
              [
                'target',
                {
                  bytes:
                    '1541566bdad3a3cfa9eb4cba3dcf33ee6583e0733ae4b2ccdfe92cd1bd92ee16',
                  cl_type: {
                    ByteArray: 32
                  },
                  parsed:
                    '1541566bdad3a3cfa9eb4cba3dcf33ee6583e0733ae4b2ccdfe92cd1bd92ee16'
                }
              ],
              [
                'id',
                {
                  bytes: '01a086010000000000',
                  cl_type: {
                    Option: 'U64'
                  },
                  parsed: 100000
                }
              ]
            ]
          }
        }
      }
    };
    const fromJson = casperClient.deployFromJson(json).unwrap();

    expect(fromJson).to.be.an.instanceof(Deploy);
    expect(fromJson!.header.ttl).to.be.eq(1800000);
  });
});
