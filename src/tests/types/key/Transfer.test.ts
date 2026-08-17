import { expect } from 'vitest';

import { TransferHash, Key } from '../../../types';

const hashHex = 'ab'.repeat(32);
const prefixedStr = `transfer-${hashHex}`;

describe('TransferHash', () => {
  it('parses a prefixed string and preserves the prefix on toPrefixedString()', () => {
    const transferHash = new TransferHash(prefixedStr);

    expect(transferHash.toHex()).to.equal(hashHex);
    expect(transferHash.toPrefixedString()).to.equal(prefixedStr);
  });

  it('parses a bare hex string with no prefix', () => {
    const transferHash = new TransferHash(hashHex);

    expect(transferHash.toHex()).to.equal(hashHex);
    expect(transferHash.toPrefixedString()).to.equal(hashHex);
  });

  it('toJSON() / fromJSON() round-trips', () => {
    const transferHash = new TransferHash(prefixedStr);
    const json = transferHash.toJSON();

    expect(json).to.equal(prefixedStr);
    expect(TransferHash.fromJSON(json).toPrefixedString()).to.equal(
      prefixedStr
    );
  });

  it('keeps the transfer- prefix through Key.fromBytes(key.bytes())', () => {
    const key = Key.newKey(prefixedStr);
    const { result: parsedKey } = Key.fromBytes(key.bytes());

    expect(parsedKey.transfer?.toHex()).to.equal(hashHex);
    expect(parsedKey.toPrefixedString()).to.equal(prefixedStr);
  });
});
