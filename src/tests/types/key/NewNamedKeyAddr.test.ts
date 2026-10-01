import { expect } from 'vitest';

import { EntityAddr, NamedKeyAddr, PrefixName } from '../../../types';

const hashHex = 'ab'.repeat(32);
const entityAddr = EntityAddr.fromPrefixedString(`entity-account-${hashHex}`);
const nameBytes = Uint8Array.from(Array(32).fill(0xcd));

describe('NamedKeyAddr', () => {
  it('fromString() / toPrefixedString() round-trips', () => {
    const addr = new NamedKeyAddr(entityAddr, nameBytes);
    const prefixedStr = addr.toPrefixedString();

    expect(prefixedStr).to.equal(
      `${PrefixName.NamedKey}${entityAddr.toPrefixedString()}-${'cd'.repeat(
        32
      )}`
    );
    expect(
      NamedKeyAddr.fromString(
        prefixedStr.replace(PrefixName.NamedKey, '')
      ).toPrefixedString()
    ).to.equal(prefixedStr);
  });

  it('fromString() rejects nameBytes that are not 32 bytes', () => {
    expect(() =>
      NamedKeyAddr.fromString(`${entityAddr.toPrefixedString()}-cdcd`)
    ).to.throw('Invalid NameBytes length, expected 32 bytes.');
  });

  it('toJSON() / fromJSON() round-trips', () => {
    const addr = new NamedKeyAddr(entityAddr, nameBytes);
    const json = addr.toJSON();

    expect(
      NamedKeyAddr.fromString(json.replace(PrefixName.NamedKey, '')).toJSON()
    ).to.equal(json);
  });

  it('round-trips through toBytes()/fromBytes()', () => {
    const addr = new NamedKeyAddr(entityAddr, nameBytes);
    const { result } = NamedKeyAddr.fromBytes(addr.toBytes());

    expect(Array.from(result.nameBytes)).to.deep.equal(Array.from(nameBytes));
    expect(result.baseAddr.toPrefixedString()).to.equal(
      entityAddr.toPrefixedString()
    );
  });
});
