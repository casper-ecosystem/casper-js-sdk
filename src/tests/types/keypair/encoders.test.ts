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

  // Both of these are structurally valid EC keys that are simply not
  // secp256k1. Neither asn1.js nor the codec that replaced it looked at the
  // curve, the version or the key length, so a P-256 or P-384 file was
  // silently accepted and then used as a secp256k1 key. Fixtures generated
  // with Node's own crypto.
  describe('rejects keys that are structurally valid but not secp256k1', () => {
    const P256_SEC1 =
      '3077020101042007d2e51bbc238b40a3f4faf1b62a8031626764acce697d7160bb9c7ab2aeba97a00a06082a8648ce3d030107a1440342000470bd656de49cc2ab79dadbcb65d30305cd493592a7b3d50587117ea80970ae296881b8987aef7ef028f575ee126a28e6d8d64e83186e437073c2caa721f88a66';
    const P256_SPKI =
      '3059301306072a8648ce3d020106082a8648ce3d0301070342000470bd656de49cc2ab79dadbcb65d30305cd493592a7b3d50587117ea80970ae296881b8987aef7ef028f575ee126a28e6d8d64e83186e437073c2caa721f88a66';
    const P384_SEC1 =
      '3081a40201010430d5e4ecfbad4a3704517b7f5e5b9498fed56894398a68cda0c41c880afd2a46a2069ef5827dbd12cf772535b2b971e3b3a00706052b81040022a16403620004055fc146d9b93cafb10310d1dac20a8d54fb0f720965955523f34533950e273068c35328b7c9d1f20ab273d9b84f6ff6de050f25042feabfb6b6be84915b6d2d56486632215770363eff2b36b2ccd6f5677471e8c53c43c5fec275a605ef532a';
    const P384_SPKI =
      '3076301006072a8648ce3d020106052b8104002203620004055fc146d9b93cafb10310d1dac20a8d54fb0f720965955523f34533950e273068c35328b7c9d1f20ab273d9b84f6ff6de050f25042feabfb6b6be84915b6d2d56486632215770363eff2b36b2ccd6f5677471e8c53c43c5fec275a605ef532a';

    it('rejects a P-256 private key', () => {
      expect(() => encodePrivate(P256_SEC1, 'der', 'raw')).to.throw(
        'Unsupported curve'
      );
    });

    it('rejects a P-384 private key', () => {
      expect(() => encodePrivate(P384_SEC1, 'der', 'raw')).to.throw(
        'Unsupported curve'
      );
    });

    it('rejects a P-256 public key', () => {
      expect(() => encodePublic(P256_SPKI, 'der', 'raw')).to.throw(
        'Unsupported curve'
      );
    });

    it('rejects a P-384 public key', () => {
      expect(() => encodePublic(P384_SPKI, 'der', 'raw')).to.throw(
        'Unsupported curve'
      );
    });

    it('rejects a private key of the wrong length', () => {
      // The 32-byte OCTET STRING truncated to 31, lengths adjusted to match.
      const short = secp256k1DerVectors[0].privateDer
        .replace('0420', '041f')
        .replace(/^3074/, '3073')
        .replace(
          secp256k1DerVectors[0].privateKeyHex,
          secp256k1DerVectors[0].privateKeyHex.slice(0, 62)
        );

      expect(() => encodePrivate(short, 'der', 'raw')).to.throw(
        'Invalid private key length'
      );
    });

    it('rejects a raw public key of the wrong length', () => {
      expect(() => encodePublic('abcd', 'raw', 'der')).to.throw(
        'Invalid public key length'
      );
    });
  });

  // The decoder sees whatever a user hands to `PrivateKey.fromPem`. It has to
  // fail cleanly on every shape of garbage — never hang, never return
  // something that looks like a key.
  describe('malformed input', () => {
    const bases = secp256k1DerVectors.flatMap(v => [
      v.privateDer,
      v.publicFromCompressedDer,
      v.publicFromUncompressedDer
    ]);

    // Deterministic LCG: the same 3000 mutations run on every machine and in
    // CI, so a failure is always reproducible.
    let seed = 123456789;
    const rand = () =>
      (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

    it('always fails with a real Error or returns valid hex, and never hangs', () => {
      const started = Date.now();
      let decoded = 0;

      for (let i = 0; i < 3000; i++) {
        let buf: Buffer;

        if (i % 3 === 0) {
          buf = Buffer.from(
            Array.from({ length: Math.floor(rand() * 80) }, () =>
              Math.floor(rand() * 256)
            )
          );
        } else {
          buf = Buffer.from(bases[i % bases.length], 'hex');
          const mutations = 1 + Math.floor(rand() * 4);
          for (let k = 0; k < mutations; k++) {
            const op = rand();
            const pos = Math.floor(rand() * buf.length);
            if (op < 0.5) buf[pos] = Math.floor(rand() * 256);
            else if (op < 0.8) buf = buf.subarray(0, pos);
            else
              buf = Buffer.concat([
                buf.subarray(0, pos),
                Buffer.from([Math.floor(rand() * 256)]),
                buf.subarray(pos)
              ]);
          }
        }

        const encode = i % 2 === 0 ? encodePrivate : encodePublic;
        try {
          const out = encode(buf, 'der', 'raw');
          expect(out, `input ${buf.toString('hex')}`).to.match(/^[0-9a-f]*$/);
          decoded++;
        } catch (error) {
          expect(error, `input ${buf.toString('hex')}`).to.be.instanceOf(Error);
          expect((error as Error).message, `input ${buf.toString('hex')}`).to
            .not.be.empty;
        }
      }

      // Mutations often still form parseable DER; the point is that the ones
      // that do not fail cleanly rather than crashing or looping.
      expect(decoded).to.be.greaterThan(0);
      expect(Date.now() - started).to.be.lessThan(10000);
    });

    it('rejects a PEM without the expected label', () => {
      expect(() =>
        encodePrivate(
          '-----BEGIN NOPE-----\nAAAA\n-----END NOPE-----',
          'pem',
          'raw'
        )
      ).to.throw('Malformed PEM');
    });

    it('rejects empty input', () => {
      expect(() => encodePrivate('', 'der', 'raw')).to.throw();
      expect(() => encodePublic('', 'der', 'raw')).to.throw();
    });
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
