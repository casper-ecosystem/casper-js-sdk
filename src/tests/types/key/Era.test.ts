import { expect } from 'vitest';

import {
  CLTypeKey,
  CLValue,
  CLValueParser,
  Era,
  Key,
  KeyTypeID
} from '../../../types';

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

  it('fromBytes() reads a view that starts past offset 0 of its buffer', () => {
    const padded = new Uint8Array(16);
    padded.set(new Era(42).toBytes(), 8);

    expect(Era.fromBytes(padded.subarray(8)).value).to.equal(42);
  });

  it('fromBytes() reads the full u64 that toBytes() writes', () => {
    const era = new Era(2 ** 32 + 5);

    expect(Era.fromBytes(era.toBytes()).value).to.equal(2 ** 32 + 5);
  });

  it('Key.fromBytes() consumes all 8 era bytes', () => {
    const bytes = new Uint8Array([
      KeyTypeID.EraId,
      ...new Era(42).toBytes(),
      0xff
    ]);

    const { result, bytes: remainder } = Key.fromBytes(bytes);
    expect(result.era?.value).to.equal(42);
    expect(Array.from(remainder)).to.deep.equal([0xff]);
  });

  it('round-trips a List<Key> of era keys through bytes', () => {
    const list = CLValue.newCLList(CLTypeKey, [
      CLValue.newCLKey(Key.newKey('era-42')),
      CLValue.newCLKey(Key.newKey('era-43'))
    ]);

    const parsed = CLValueParser.fromBytesWithType(
      CLValueParser.toBytesWithType(list)
    ).result;
    expect(
      parsed.list?.elements.map(e => e.key?.toPrefixedString())
    ).to.deep.equal(['era-42', 'era-43']);
  });
});
