import * as secp256k1 from '@noble/secp256k1';
import { expect } from 'vitest';

import {
  encodePrivate,
  encodePublic
} from '../../../types/keypair/secp256k1/encoders';
import { secp256k1DerVectors } from '../../data';

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

  // Byte-level characterization. The vectors were produced by the asn1.js-based
  // implementation, so any drift in the emitted DER/PEM — a different integer
  // encoding, a missing optional field, a changed PEM line width or trailer —
  // fails here rather than in a user's key file.
  describe('byte-for-byte compatibility with the asn1.js output', () => {
    secp256k1DerVectors.forEach(vector => {
      describe(`private key ${vector.privateKeyHex.slice(0, 8)}…`, () => {
        it('emits the recorded SEC1 DER', () => {
          expect(encodePrivate(vector.privateKeyHex, 'raw', 'der')).to.equal(
            vector.privateDer
          );
        });

        it('emits the recorded SEC1 PEM', () => {
          expect(
            encodePrivate(vector.privateKeyHex, 'raw', 'pem').toString()
          ).to.equal(vector.privatePem);
        });

        it('emits the recorded SPKI DER for the compressed public key', () => {
          expect(
            encodePublic(vector.compressedPublicKeyHex, 'raw', 'der')
          ).to.equal(vector.publicFromCompressedDer);
        });

        it('emits the recorded SPKI PEM for the compressed public key', () => {
          expect(
            encodePublic(vector.compressedPublicKeyHex, 'raw', 'pem').toString()
          ).to.equal(vector.publicFromCompressedPem);
        });

        it('emits the recorded SPKI DER for the uncompressed public key', () => {
          expect(
            encodePublic(vector.uncompressedPublicKeyHex, 'raw', 'der')
          ).to.equal(vector.publicFromUncompressedDer);
        });

        it('emits the recorded SPKI PEM for the uncompressed public key', () => {
          expect(
            encodePublic(
              vector.uncompressedPublicKeyHex,
              'raw',
              'pem'
            ).toString()
          ).to.equal(vector.publicFromUncompressedPem);
        });

        it('reads the recorded DER back to the raw private key', () => {
          expect(encodePrivate(vector.privateDer, 'der', 'raw')).to.equal(
            vector.privateKeyHex
          );
        });

        it('reads the recorded PEM back to the raw private key', () => {
          expect(encodePrivate(vector.privatePem, 'pem', 'raw')).to.equal(
            vector.privateKeyHex
          );
        });

        it('reads the recorded public DER and PEM back to the raw key', () => {
          expect(
            encodePublic(vector.publicFromCompressedDer, 'der', 'raw')
          ).to.equal(vector.compressedPublicKeyHex);
          expect(
            encodePublic(vector.publicFromCompressedPem, 'pem', 'raw')
          ).to.equal(vector.compressedPublicKeyHex);
          expect(
            encodePublic(vector.publicFromUncompressedDer, 'der', 'raw')
          ).to.equal(vector.uncompressedPublicKeyHex);
        });
      });
    });
  });
});
