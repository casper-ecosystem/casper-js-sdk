import { byteHash, decodeBase16 } from '@casper-js-sdk/types';
import { expect } from 'chai';

import { Secp256K1 } from './Secp256k1';

describe('Secp256K1', () => {
  const isNodeJS = typeof window === 'undefined';

  // prettier-ignore
  const privateKey = new Uint8Array([
    108, 148, 73, 178, 211, 154, 233, 127,
    124,  50, 23,  54,  44, 247,  31,  46,
     90,   8, 77,  13,  88, 129,  14, 189,
    189,  99,  2, 157,  25, 146,   5, 120
  ]);
  // prettier-ignore
  const publicKey = new Uint8Array([
    3, 231, 123,  91,  22,  29,  95, 162,
   26, 235,  11, 209, 241,  74, 179, 221,
  219, 215, 151, 171, 235, 200, 175,  61,
  106, 173, 182,  66, 200, 253,  10,   0,
  175
]);

  it('calculates the account hash', () => {
    const signKeyPair = Secp256K1.new();
    // use lower case for node-rs
    const name = Buffer.from('secp256k1'.toLowerCase());
    const sep = decodeBase16('00');
    const bytes = Buffer.concat([name, sep, signKeyPair.publicKey.value()]);
    const hash = byteHash(bytes);

    expect(Secp256K1.accountHash(signKeyPair.publicKey.value())).deep.equal(
      hash
    );
  });

  it('should generate r+s signature', () => {
    const signKeyPair = new Secp256K1(publicKey, privateKey);
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    // prettier-ignore
    const expected = new Uint8Array([
      238, 226, 180, 161, 189,  57,  73, 144, 224, 218,
      151, 119,  18,   7, 121, 117, 241,  17, 216, 181,
        3, 100, 215, 221, 211,  29, 134, 136, 211, 236,
       94, 239,   4, 177, 130, 117, 243, 220, 138,  59,
      213, 250,  11, 170, 199, 243, 148, 159, 163, 249,
      170, 123, 145,  31,  83, 100,  45,  24, 206, 249,
      126, 160, 228, 241
    ]);

    const signature = signKeyPair.sign(message);

    expect(signature.length).to.equal(64);
    expect(signature).to.deep.eq(expected);
  });

  it('should sign and verify message', () => {
    const signKeyPair = new Secp256K1(publicKey, privateKey);
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    const signature = signKeyPair.sign(message);

    expect(signKeyPair.verify(signature, message)).to.equal(true);
  });

  it('should return public key in hex string', () => {
    const publicKeyHex = Secp256K1.accountHex(publicKey);

    expect(publicKeyHex).to.eq(
      '0203e77b5b161d5fa21aeb0bd1f14ab3dddbd797abebc8af3d6aadb642c8fd0a00af'
    );
  });

  it('should export key files to PEM', () => {
    const keyPair = new Secp256K1(publicKey, privateKey);

    const pubickKeyPEM =
      '-----BEGIN PUBLIC KEY-----\n' +
      'MDYwEAYHKoZIzj0CAQYFK4EEAAoDIgAD53tbFh1fohrrC9HxSrPd29eXq+vIrz1q\n' +
      'rbZCyP0KAK8=\n' +
      '-----END PUBLIC KEY-----';

    const privateKyePEM =
      '-----BEGIN EC PRIVATE KEY-----\n' +
      'MHQCAQEEIGyUSbLTmul/fDIXNiz3Hy5aCE0NWIEOvb1jAp0ZkgV4oAcGBSuBBAAK\n' +
      'oUQDQgAE53tbFh1fohrrC9HxSrPd29eXq+vIrz1qrbZCyP0KAK9w+or+aH2iWGyo\n' +
      'NaJB0nusjRnDse0/raryCm2OrlZuUQ==\n' +
      '-----END EC PRIVATE KEY-----';

    expect(keyPair.exportPrivateKeyInPem()).to.eq(privateKyePEM);
    expect(keyPair.exportPublicKeyInPem()).to.eq(pubickKeyPEM);
  });

  if (isNodeJS) {
    it('should import keys from saved file', () => {
      const publicKeyPath = __dirname + '/../assets/secp256k1/public_key.pem';
      const privateKeyPath = __dirname + '/../assets/secp256k1/private_key.pem';

      const publicKeyFromFile = Secp256K1.parsePublicKeyFile(publicKeyPath);
      expect(publicKeyFromFile).to.deep.eq(publicKey);

      const privateKeyFromFile = Secp256K1.parsePrivateKeyFile(privateKeyPath);
      expect(privateKeyFromFile).to.deep.eq(privateKey);

      const keyPair1 = Secp256K1.parseKeyFiles(publicKeyPath, privateKeyPath);
      expect(keyPair1.publicKey.value()).to.deep.eq(publicKey);
      expect(keyPair1.privateKey).to.deep.eq(privateKey);

      const keyPair2 = Secp256K1.loadKeyPairFromPrivateFile(privateKeyPath);

      expect(keyPair2.publicKey.value()).to.deep.eq(publicKey);
      expect(keyPair2.privateKey).to.deep.eq(privateKey);
    });
  }
});
