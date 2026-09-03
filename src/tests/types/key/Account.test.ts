import { expect } from 'vitest';

import { AccountHash, Hash, Key, KeyTypeID } from '../../../types';

const hashHex = 'ab'.repeat(32);
const prefixedStr = `account-hash-${hashHex}`;

describe('AccountHash', () => {
  it('fromString() / toPrefixedString() round-trips the account-hash- form', () => {
    const accountHash = AccountHash.fromString(prefixedStr);

    expect(accountHash.toHex()).to.equal(hashHex);
    expect(accountHash.toPrefixedString()).to.equal(prefixedStr);
  });

  it('fromString() also accepts the bare "00"-prefixed form', () => {
    const source = `00${hashHex}`;
    const accountHash = AccountHash.fromString(source);

    expect(accountHash.toHex()).to.equal(hashHex);
    // toJSON preserves whichever origin prefix the source used.
    expect(accountHash.toJSON()).to.equal(source);
  });

  it('toJSON() / fromJSON() round-trips preserving the prefix', () => {
    const accountHash = AccountHash.fromString(prefixedStr);
    const json = accountHash.toJSON();

    expect(json).to.equal(prefixedStr);
    expect(AccountHash.fromJSON(json).toHex()).to.equal(hashHex);
  });

  it('toBytes() / fromBytes() round-trips through the inherited Hash encoding', () => {
    const accountHash = AccountHash.fromString(prefixedStr);
    const { result } = Hash.fromBytes(accountHash.toBytes());

    expect(result.toHex()).to.equal(hashHex);
  });

  it('round-trips through Key.newKey() / toPrefixedString() / bytes()', () => {
    const key = Key.newKey(prefixedStr);

    expect(key.type).to.equal(KeyTypeID.Account);
    expect(key.toPrefixedString()).to.equal(prefixedStr);
    expect(key.account?.toHex()).to.equal(hashHex);

    const { result: parsedKey } = Key.fromBytes(key.bytes());
    expect(parsedKey.toPrefixedString()).to.equal(prefixedStr);
  });
});
