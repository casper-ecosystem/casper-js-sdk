import { expect } from 'vitest';

import { EntityAddr, Key, KeyTypeID } from '../../../types';

const hashHex = 'ab'.repeat(32);

describe('EntityAddr', () => {
  it.each([
    ['system', `entity-system-${hashHex}`],
    ['account', `entity-account-${hashHex}`],
    ['contract', `entity-contract-${hashHex}`]
  ])('%s: fromPrefixedString() / toPrefixedString() round-trips', (_, str) => {
    const entityAddr = EntityAddr.fromPrefixedString(str);

    expect(entityAddr.toPrefixedString()).to.equal(str);
  });

  it.each([
    ['system', `entity-system-${hashHex}`],
    ['account', `entity-account-${hashHex}`],
    ['contract', `entity-contract-${hashHex}`]
  ])('%s: toBytes() / fromBytes() round-trips', (_, str) => {
    const entityAddr = EntityAddr.fromPrefixedString(str);
    const bytes = entityAddr.toBytes();
    const { result, bytes: remainder } = EntityAddr.fromBytes(bytes);

    expect(result.toPrefixedString()).to.equal(str);
    expect(remainder.length).to.equal(0);
  });

  it('rejects an unrecognized prefix', () => {
    expect(() =>
      EntityAddr.fromPrefixedString(`entity-bogus-${hashHex}`)
    ).to.throw('invalid EntityAddr format');
  });

  it.each([
    ['system', `entity-system-${hashHex}`],
    ['account', `entity-account-${hashHex}`],
    ['contract', `entity-contract-${hashHex}`]
  ])('%s: round-trips through Key.newKey() / bytes()', (_, str) => {
    const key = Key.newKey(str);

    expect(key.type).to.equal(KeyTypeID.AddressableEntity);
    expect(key.toPrefixedString()).to.equal(str);

    const { result: parsedKey } = Key.fromBytes(key.bytes());
    expect(parsedKey.toPrefixedString()).to.equal(str);
  });

  it('toJSON() / fromJSON() round-trips', () => {
    const str = `entity-account-${hashHex}`;
    const entityAddr = EntityAddr.fromJSON(str);

    expect(entityAddr.toJSON()).to.equal(str);
    expect(
      EntityAddr.fromJSON(entityAddr.toJSON()).toPrefixedString()
    ).to.equal(str);
  });
});
