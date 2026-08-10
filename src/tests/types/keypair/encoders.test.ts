import { expect } from 'vitest';
import * as secp256k1 from '@noble/secp256k1';
import { encodePrivate, encodePublic } from '../../../types/keypair/secp256k1/encoders';

describe('secp256k1 encoders (noble)', () => {
  it('should encode and decode private key to PEM and back correctly', () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const privateKeyHex = secp256k1.utils.bytesToHex(privateKey);

    const pem = encodePrivate(privateKeyHex, 'raw', 'pem');
    const rawHex = encodePrivate(pem, 'pem', 'raw');

    expect(rawHex).to.equal(privateKeyHex);
  });

  it('should encode and decode private key to DER and back correctly', () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const privateKeyHex = secp256k1.utils.bytesToHex(privateKey);

    const der = encodePrivate(privateKeyHex, 'raw', 'der');
    const rawHex = encodePrivate(der, 'der', 'raw');

    expect(rawHex).to.equal(privateKeyHex);
  });

  it('should encode and decode public key to PEM and back correctly', () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey, true);
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);

    const pem = encodePublic(publicKeyHex, 'raw', 'pem');
    const rawHex = encodePublic(pem, 'pem', 'raw');

    expect(rawHex).to.equal(publicKeyHex);
  });

  it('should encode and decode public key to DER and back correctly', () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey, true);
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);

    const der = encodePublic(publicKeyHex, 'raw', 'der');
    const rawHex = encodePublic(der, 'der', 'raw');

    expect(rawHex).to.equal(publicKeyHex);
  });

  it('should throw on invalid key format', () => {
    expect(() => encodePrivate('abcd', 'invalid' as any, 'pem')).to.throw();
    expect(() => encodePublic('abcd', 'raw', 'invalid' as any)).to.throw();
  });
});