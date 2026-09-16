import { TypedJSON } from 'typedjson';
import { expect } from 'vitest';

import { CLValue, CLValueParser } from '../types';

/**
 * Parses `fixture` through `serializer`, then serializes the result back and
 * asserts it reproduces the fixture exactly — a `fromJSON`-only assertion
 * leaves the `toJSON` direction free to break silently.
 */
export function expectJsonRoundTrip<T>(
  serializer: TypedJSON<T>,
  fixture: object
): T {
  const parsed = serializer.parse(fixture);
  expect(parsed, 'fixture failed to parse').to.not.be.undefined;
  expect(serializer.toPlainJson(parsed!)).to.deep.equal(fixture);
  return parsed!;
}

/**
 * Asserts `fromBytes(toBytes(v))` deep-equals `v` and re-serializes to the same
 * bytes. The type is passed separately because `CLValue.bytes()` carries no tag.
 */
export function expectByteRoundTrip(value: CLValue): void {
  const bytes = value.bytes();
  const { result } = CLValueParser.fromBytesByType(bytes, value.getType());

  expect(result).to.deep.equal(value);
  expect(result.bytes()).to.deep.equal(bytes);
}
