import { expect } from 'vitest';

import { KeyAlgorithm, PrivateKey } from '../../../types';

// Fixed vectors, so PHASE-3.5 Task 6's noble import-specifier move and
// slice/subarray sweep fail loudly if either changes a signed byte, rather
// than silently producing a valid signature over different bytes.
describe('signing vectors (characterization)', () => {
  const message = new Uint8Array([1, 2, 3, 4, 5]);

  const ED25519_FIXTURE_HEX =
    '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
  const SECP_FIXTURE_HEX =
    '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

  it('ed25519 produces a stable signature for a fixed key', () => {
    const pk = PrivateKey.fromHex(ED25519_FIXTURE_HEX, KeyAlgorithm.ED25519);
    const sig = pk.sign(message);
    expect(Buffer.from(sig).toString('hex')).toBe(
      '4d17a60521ef9f8c3eb368ceb0215676a79ed54cd9ec90d34fb1fb9f0a92537cfddb2e7c871cbcf2b3c1962362eb963c70ccdb47f044c38ad7914c62fec1e30d'
    );
  });

  // secp256k1's `signSync` here defaults `extraEntropy` to `undefined`
  // (`@noble/secp256k1` initSigArgs), which takes the deterministic RFC6979
  // path — no randomness is mixed in — so a fixed byte string is a valid
  // assertion here too, not just a verification check.
  it('secp256k1 produces a stable signature for a fixed key', () => {
    const pk = PrivateKey.fromHex(SECP_FIXTURE_HEX, KeyAlgorithm.SECP256K1);
    const sig = pk.sign(message);
    expect(Buffer.from(sig).toString('hex')).toBe(
      '4de40375ee1fe509f63d8662a80d51f0e39e7affb58aabaf0dedd8c427e390084b365d8fddaca8d32f13486753b4ac88fab9b1e59ed731fcf94fbc7138e6a2ee'
    );
  });
});
