import { expect } from 'chai';

import { decodeBase16, decodeBase64 } from './Conversions';
import { Ed25519, Secp256K1 } from './Keys';
import { byteHash } from './ByteConverters';

describe('Ed25519', () => {
  it('calculates the account hash', () => {
    const signKeyPair = Ed25519.new();
    // use lower case for node-rs
    const name = Buffer.from('ED25519'.toLowerCase());
    const sep = decodeBase16('00');
    const bytes = Buffer.concat([name, sep, signKeyPair.publicKey.value()]);
    const hash = byteHash(bytes);

    expect(Ed25519.accountHash(signKeyPair.publicKey.value())).deep.equal(hash);
  });

  it('should deal with different line-endings', () => {
    const keyWithoutPem =
      'MCowBQYDK2VwAyEA4PFXL2NuakBv3l7yrDg65HaYQtxKR+SCRTDI+lXBoM8=';
    const key1 = decodeBase64(keyWithoutPem);
    const keyWithLF =
      '-----BEGIN PUBLIC KEY-----\n' +
      'MCowBQYDK2VwAyEA4PFXL2NuakBv3l7yrDg65HaYQtxKR+SCRTDI+lXBoM8=\n' +
      '-----END PUBLIC KEY-----\n';
    const key2 = Ed25519.readBase64WithPEM(keyWithLF);
    expect(key2).to.deep.eq(key1);
    const keyWithCRLF =
      '-----BEGIN PUBLIC KEY-----\r\n' +
      'MCowBQYDK2VwAyEA4PFXL2NuakBv3l7yrDg65HaYQtxKR+SCRTDI+lXBoM8=\r\n' +
      '-----END PUBLIC KEY-----\r\n';
    const key3 = Ed25519.readBase64WithPEM(keyWithCRLF);
    expect(key3).to.deep.eq(key1);
  });

  it('should generate r+s signature', () => {
    const signKeyPair = Ed25519.new();
    const message = Uint8Array.from(Buffer.from('Hello Ed25519'));

    const signature = signKeyPair.sign(message);

    expect(signature.length).to.equal(64);
  });

  it('should sign and verify message', () => {
    const signKeyPair = Ed25519.new();
    const message = Uint8Array.from(Buffer.from('Hello Ed25519'));

    const signature = signKeyPair.sign(message);

    expect(signKeyPair.verify(signature, message)).to.equal(true);
  });
});

describe('Secp256K1', () => {
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
    const signKeyPair = Secp256K1.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    const signature = signKeyPair.sign(message);

    expect(signature.length).to.equal(64);
  });

  it('should sign and verify message', () => {
    const signKeyPair = Secp256K1.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    const signature = signKeyPair.sign(message);

    expect(signKeyPair.verify(signature, message)).to.equal(true);
  });
});
