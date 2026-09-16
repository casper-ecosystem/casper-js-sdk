import { describe, it, expect } from 'vitest';

import {
  CalltableSerialization,
  Field
} from '../../types/CalltableSerialization';

describe('CalltableSerialization', () => {
  it('exposes fields via getField after being built in order', () => {
    const table = new CalltableSerialization();
    table.addField(0, Uint8Array.from([1, 2, 3]));
    table.addField(1, Uint8Array.from([4, 5]));
    table.addField(2, Uint8Array.from([6]));

    expect(table.getField(0)).to.deep.equal(Uint8Array.from([1, 2, 3]));
    expect(table.getField(1)).to.deep.equal(Uint8Array.from([4, 5]));
    expect(table.getField(2)).to.deep.equal(Uint8Array.from([6]));
    expect(table.getField(3)).to.be.undefined;
  });

  it('throws when fields are added out of index order', () => {
    const table = new CalltableSerialization();
    table.addField(0, Uint8Array.from([1]));

    expect(() => table.addField(2, Uint8Array.from([2]))).to.throw(
      'Add fields in correct index order.'
    );
  });

  it('serializes to the documented layout: count, (index,offset) pairs, payload size, payload', () => {
    const table = new CalltableSerialization();
    table.addField(0, Uint8Array.from([0xaa, 0xbb, 0xcc])); // offset 0, len 3
    table.addField(1, Uint8Array.from([0xdd, 0xdd])); // offset 3, len 2
    table.addField(2, Uint8Array.from([0xee])); // offset 5, len 1

    const bytes = table.toBytes();

    const expected = Uint8Array.from([
      // field count (u32 LE) = 3
      3, 0, 0, 0,
      // field 0: index (u16 LE) = 0, offset (u32 LE) = 0
      0, 0, 0, 0, 0, 0,
      // field 1: index (u16 LE) = 1, offset (u32 LE) = 3
      1, 0, 3, 0, 0, 0,
      // field 2: index (u16 LE) = 2, offset (u32 LE) = 5
      2, 0, 5, 0, 0, 0,
      // total payload size (u32 LE) = 6
      6, 0, 0, 0,
      // payload, fields concatenated in index order
      0xaa, 0xbb, 0xcc, 0xdd, 0xdd, 0xee
    ]);

    expect(bytes).to.deep.equal(expected);
  });

  it('round-trips bytes -> CalltableSerialization -> byte-identical output', () => {
    const original = new CalltableSerialization();
    original.addField(0, Uint8Array.from([9, 9]));
    original.addField(1, Uint8Array.from([]));
    original.addField(2, Uint8Array.from([1, 2, 3, 4, 5]));

    const bytes = original.toBytes();
    const parsed = CalltableSerialization.fromBytes(bytes);

    expect(parsed.getField(0)).to.deep.equal(Uint8Array.from([9, 9]));
    expect(parsed.getField(1)).to.deep.equal(Uint8Array.from([]));
    expect(parsed.getField(2)).to.deep.equal(Uint8Array.from([1, 2, 3, 4, 5]));
    expect(parsed.toBytes()).to.deep.equal(bytes);
  });

  it('round-trips a table with no fields', () => {
    const original = new CalltableSerialization();
    const bytes = original.toBytes();

    expect(bytes).to.deep.equal(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]));

    const parsed = CalltableSerialization.fromBytes(bytes);
    expect(parsed.toBytes()).to.deep.equal(bytes);
  });

  it('Field.serializedVecSize reports the fixed per-field overhead', () => {
    expect(Field.serializedVecSize()).to.equal(12);
  });
});
