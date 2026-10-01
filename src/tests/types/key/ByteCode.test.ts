import { expect } from 'vitest';

import { ByteCode, Key, KeyTypeID } from '../../../types';

const hashHex = 'ab'.repeat(32);
const emptyHashHex = '00'.repeat(32);

describe('ByteCode', () => {
  it('V1 Wasm: fromJSON() / toPrefixedString() round-trips', () => {
    // fromJSON() expects the byte-code- outer prefix already stripped, same
    // as every caller in Key.createByType().
    const byteCode = ByteCode.fromJSON(`v1-wasm-${hashHex}`);

    expect(byteCode.isEmptyCode()).to.be.false;
    expect(byteCode.toPrefixedString()).to.equal(
      `byte-code-v1-wasm-${hashHex}`
    );
  });

  it('empty: fromJSON() / toPrefixedString() round-trips', () => {
    const byteCode = ByteCode.fromJSON(`empty-${emptyHashHex}`);

    expect(byteCode.isEmptyCode()).to.be.true;
    expect(byteCode.toPrefixedString()).to.equal(
      `byte-code-empty-${emptyHashHex}`
    );
  });

  it('fromJSON() rejects an unrecognized prefix', () => {
    expect(() => ByteCode.fromJSON(`bogus-${hashHex}`)).to.throw(
      'Invalid ByteCode format'
    );
  });

  it('V1 Wasm: toBytes() / fromBytes() round-trips', () => {
    const byteCode = ByteCode.fromJSON(`v1-wasm-${hashHex}`);
    const { result } = ByteCode.fromBytes(byteCode.toBytes());

    expect(result.isEmptyCode()).to.be.false;
    expect(result.toPrefixedString()).to.equal(byteCode.toPrefixedString());
  });

  it('empty: toBytes() / fromBytes() round-trips', () => {
    const byteCode = ByteCode.fromJSON(`empty-${emptyHashHex}`);
    const bytes = byteCode.toBytes();

    expect(bytes).to.deep.equal(Uint8Array.from([0]));
    expect(ByteCode.fromBytes(bytes).result.isEmptyCode()).to.be.true;
  });

  it('round-trips through Key.newKey() / toPrefixedString() / bytes()', () => {
    const prefixedStr = `byte-code-v1-wasm-${hashHex}`;
    const key = Key.newKey(prefixedStr);

    expect(key.type).to.equal(KeyTypeID.ByteCode);
    expect(key.toPrefixedString()).to.equal(prefixedStr);

    const { result: parsedKey } = Key.fromBytes(key.bytes());
    expect(parsedKey.toPrefixedString()).to.equal(prefixedStr);
  });

  it('newByteCodeKindFromByte() rejects an unrecognized tag', () => {
    expect(() => ByteCode.newByteCodeKindFromByte(9)).to.throw(
      'Invalid ByteCodeKind'
    );
  });
});
