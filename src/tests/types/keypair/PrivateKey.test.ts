import * as Crypto from 'crypto';
import { expect } from 'chai';

import {
  Conversions,
  KeyAlgorithm,
  PrivateKey,
  PublicKey
} from '../../../types';

describe('PrivateKey', () => {
  it('should generate PEM file for Secp256K1 correctly', () => {
    const signKeyPair = PrivateKey.generate(KeyAlgorithm.SECP256K1);

    const publicKeyInPem = signKeyPair.publicKey.toPem();
    const privateKeyInPem = signKeyPair.toPem();

    expect(
      PublicKey.fromPem(publicKeyInPem, KeyAlgorithm.SECP256K1).toHex()
    ).to.deep.eq(signKeyPair.publicKey.toHex());
    expect(
      PublicKey.fromPem(publicKeyInPem, KeyAlgorithm.SECP256K1).bytes()
    ).to.deep.eq(signKeyPair.publicKey.bytes());
    expect(
      PrivateKey.fromPem(privateKeyInPem, KeyAlgorithm.SECP256K1).toBytes()
    ).to.deep.eq(signKeyPair.toBytes());
    expect(
      PrivateKey.fromPem(
        privateKeyInPem,
        KeyAlgorithm.SECP256K1
      ).publicKey.toHex()
    ).to.deep.eq(signKeyPair.publicKey.toHex());
  });

  it('should generate correct account from Secp256K1 PEM file', () => {
    const privateKeyInPem = PrivateKey.fromPem(
      `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBxq/oiMjAURmCRMhOP/5g7WF33rIKaORGkRoc9wQgRGoAcGBSuBBAAK
oUQDQgAEe8qaKb3KxL2VXpkwrUlNBAHPQwQeU3unZLV8CdMLp2aGaoLUfprph8Yt
cs0BmUY0rz+KBwlNMWYL9fR/hoFl8Q==
-----END EC PRIVATE KEY-----`,
      KeyAlgorithm.SECP256K1
    );

    expect(privateKeyInPem.publicKey.toHex()).to.equal('02037bca9a29bdcac4bd955e9930ad494d0401cf43041e537ba764b57c09d30ba766');
  });

  it('should generate PEM file for Ed25519 correctly', () => {
    const naclKeyPair = PrivateKey.generate(KeyAlgorithm.ED25519);
    const publicKeyInPem = naclKeyPair.publicKey.toPem();
    const privateKeyInPem = naclKeyPair.toPem();

    const signPrivateKeyPair2 = PrivateKey.fromPem(
      privateKeyInPem,
      KeyAlgorithm.ED25519
    );
    const signPublicKeyPair2 = PublicKey.fromPem(
      publicKeyInPem,
      KeyAlgorithm.ED25519
    );

    expect(Conversions.encodeBase64(naclKeyPair.publicKey.bytes())).to.equal(
      Conversions.encodeBase64(signPublicKeyPair2.bytes())
    );
    expect(Conversions.encodeBase64(signPrivateKeyPair2.toBytes())).to.equal(
      Conversions.encodeBase64(signPrivateKeyPair2.toBytes())
    );

    // import pem file to nodejs std library
    const pubKeyImported = Crypto.createPublicKey(publicKeyInPem);
    const priKeyImported = Crypto.createPrivateKey(privateKeyInPem);
    expect(pubKeyImported.asymmetricKeyType).to.equal('ed25519');

    // expect nodejs std lib export the same pem.
    const publicKeyInPemFromNode = pubKeyImported.export({
      type: 'spki',
      format: 'pem'
    });
    const privateKeyInPemFromNode = priKeyImported.export({
      type: 'pkcs8',
      format: 'pem'
    });
    expect(publicKeyInPemFromNode).to.equal(publicKeyInPem);
    expect(privateKeyInPemFromNode).to.equal(privateKeyInPem);

    // expect both of they generate the same signature
    const message = Buffer.from('hello world');
    const signatureByNode = Crypto.sign(null, message, priKeyImported);
    const signatureByNacl = naclKeyPair.sign(message);
    expect(Conversions.encodeBase64(signatureByNode)).to.eq(
      Conversions.encodeBase64(signatureByNacl)
    );

    expect(Crypto.verify(null, message, pubKeyImported, signatureByNode)).to
      .true;
  });
});
