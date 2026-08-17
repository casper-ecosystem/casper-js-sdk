import { expect } from 'vitest';

import { Era, Key, KeyTypeID } from '../../../types';

describe('Era', () => {
  it('toJSON() / fromJSON() round-trips', () => {
    const era = new Era(12345);

    expect(era.toJSON()).to.equal('12345');
    expect(Era.fromJSON(era.toJSON()).value).to.equal(12345);
  });

  it('fromJSON() rejects a non-numeric value', () => {
    expect(() => Era.fromJSON('not-a-number')).to.throw('Invalid Era value');
  });

  it('toBytes() / fromBytes() round-trips a 32-bit value', () => {
    const era = new Era(999);
    const bytes = era.toBytes();

    expect(Era.fromBytes(bytes).value).to.equal(999);
  });

  it('round-trips through Key.newKey() / toPrefixedString() / bytes()', () => {
    const prefixedStr = 'era-42';
    const key = Key.newKey(prefixedStr);

    expect(key.type).to.equal(KeyTypeID.EraId);
    expect(key.toPrefixedString()).to.equal(prefixedStr);
    expect(key.era?.value).to.equal(42);

    const { result: parsedKey } = Key.fromBytes(key.bytes());
    expect(parsedKey.toPrefixedString()).to.equal(prefixedStr);
  });
});
