import { expect } from 'vitest';

import { Hash } from '../../../types';

const hashHex = 'ab'.repeat(32);
const otherHashHex = 'cd'.repeat(32);

describe('Hash', () => {
  it('fromHex() / toHex() round-trips the hex string', () => {
    const hash = Hash.fromHex(hashHex);

    expect(hash.toHex()).to.equal(hashHex);
    expect(hash.toJSON()).to.equal(hashHex);
  });

  it('fromJSON() / toJSON() round-trips', () => {
    const hash = Hash.fromJSON(hashHex);

    expect(Hash.fromJSON(hash.toJSON()).toHex()).to.equal(hashHex);
  });

  it('toBytes() / fromBytes() round-trips', () => {
    const hash = Hash.fromHex(hashHex);
    const bytes = hash.toBytes();
    const { result, bytes: remainder } = Hash.fromBytes(bytes);

    expect(result.toHex()).to.equal(hashHex);
    expect(remainder.length).to.equal(0);
  });

  it('fromBytes() leaves trailing bytes untouched', () => {
    const hash = Hash.fromHex(hashHex);
    const withTrailer = new Uint8Array([
      ...Array.from(hash.toBytes()),
      1,
      2,
      3
    ]);
    const { result, bytes: remainder } = Hash.fromBytes(withTrailer);

    expect(result.toHex()).to.equal(hashHex);
    expect(remainder).to.deep.equal(Uint8Array.from([1, 2, 3]));
  });

  it('rejects a byte array of the wrong length', () => {
    expect(() => new Hash(Uint8Array.from([1, 2, 3]))).to.throw(
      'Invalid hash length, expected 32 bytes.'
    );
  });

  it('rejects a hex string of the wrong length', () => {
    expect(() => Hash.fromHex('abcd')).to.throw(
      'Invalid string length, expected 64 characters.'
    );
  });

  it('equals() compares by byte content, not identity', () => {
    const a = Hash.fromHex(hashHex);
    const b = Hash.fromHex(hashHex);
    const different = Hash.fromHex(otherHashHex);

    expect(a.equals(b)).to.be.true;
    expect(a.equals(different)).to.be.false;
  });

  it('createHashArray() splits a concatenated byte array into Hash instances', () => {
    const a = Hash.fromHex(hashHex);
    const b = Hash.fromHex(otherHashHex);
    const concatenated = new Uint8Array([
      ...Array.from(a.toBytes()),
      ...Array.from(b.toBytes())
    ]);

    const hashes = Hash.createHashArray(concatenated);

    expect(hashes).to.have.length(2);
    expect(hashes[0].equals(a)).to.be.true;
    expect(hashes[1].equals(b)).to.be.true;
  });
});
