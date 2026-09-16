import { expect } from 'vitest';

import { AddressableEntityHash } from '../../../types';

const hashHex = 'ab'.repeat(32);
const prefixedStr = `addressable-entity-${hashHex}`;

describe('AddressableEntityHash', () => {
  it('fromHex() / toPrefixedString() round-trips the prefixed form', () => {
    const hash = AddressableEntityHash.fromHex(prefixedStr);

    expect(hash.toHex()).to.equal(hashHex);
    expect(hash.toPrefixedString()).to.equal(prefixedStr);
  });

  it('fromHex() also accepts a bare hex string with no prefix', () => {
    const hash = AddressableEntityHash.fromHex(hashHex);

    expect(hash.toHex()).to.equal(hashHex);
    // toJSON reflects the (absent) origin prefix, toPrefixedString always adds one.
    expect(hash.toJSON()).to.equal(hashHex);
    expect(hash.toPrefixedString()).to.equal(prefixedStr);
  });

  it('toJSON() / fromJSON() round-trips preserving the origin prefix', () => {
    const hash = AddressableEntityHash.fromHex(prefixedStr);
    const json = hash.toJSON();

    expect(json).to.equal(prefixedStr);
    expect(AddressableEntityHash.fromJSON(json).toHex()).to.equal(hashHex);
  });

  it('toBytes() round-trips through the inherited Hash byte encoding', () => {
    const hash = AddressableEntityHash.fromHex(prefixedStr);

    expect(hash.toBytes()).to.deep.equal(
      Uint8Array.from(Buffer.from(hashHex, 'hex'))
    );
  });
});
