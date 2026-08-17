import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { Args, CLValue } from '../../types';
import { expectJsonRoundTrip } from '../roundtrip';

describe('Args', () => {
  const buildArgs = (): Args =>
    Args.fromMap({
      amount: CLValue.newCLUInt512(2500000000),
      name: CLValue.newCLString('casper'),
      active: CLValue.newCLValueBool(true)
    });

  it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
    const serializer = new TypedJSON(Args);
    const original = buildArgs();

    const json = JSON.parse(serializer.stringify(original));
    const parsed = expectJsonRoundTrip(serializer, json);

    expect(parsed.getByName('amount')?.ui512?.toString()).to.equal(
      '2500000000'
    );
    expect(parsed.getByName('name')?.toString()).to.equal('casper');
    expect(parsed.getByName('active')?.bool?.getValue()).to.equal(true);
  });

  it('round-trips through bytes: fromBytes(toBytes(v)) deep-equals v and re-serializes byte-identical', () => {
    const original = buildArgs();

    const bytes = original.toBytes();
    const parsed = Args.fromBytes(bytes);

    expect(parsed.getByName('amount')?.ui512?.toString()).to.equal(
      original.getByName('amount')?.ui512?.toString()
    );
    expect(parsed.getByName('name')?.toString()).to.equal(
      original.getByName('name')?.toString()
    );
    expect(parsed.getByName('active')?.bool?.getValue()).to.equal(
      original.getByName('active')?.bool?.getValue()
    );
    expect(parsed.toBytes()).to.deep.equal(bytes);
  });

  it('insert() adds a new argument that survives a byte round-trip', () => {
    const original = buildArgs();
    original.insert('note', CLValue.newCLString('hello'));

    const parsed = Args.fromBytes(original.toBytes());
    expect(parsed.getByName('note')?.toString()).to.equal('hello');
  });

  it('rejects a duplicate key when parsing from JSON', () => {
    const serializer = new TypedJSON(Args);
    const original = buildArgs();
    const json = JSON.parse(serializer.stringify(original));

    // Args serialize as [key, value] pairs, so this duplicates a key. `desRA`
    // throws on it, but typedjson swallows custom-deserializer errors and
    // yields `undefined` rather than rethrowing.
    json.args.push(json.args[0]);

    expect(serializer.parse(json)).to.be.undefined;
  });
});
