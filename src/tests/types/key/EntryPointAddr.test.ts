import { expect } from 'vitest';

import { EntityAddr, EntryPointAddr, EntryPointError } from '../../../types';

const hashHex = 'ab'.repeat(32);
const entityAddr = EntityAddr.fromPrefixedString(`entity-account-${hashHex}`);

describe('EntryPointAddr', () => {
  it('V1: fromString() / toPrefixedString() round-trips', () => {
    const nameHex = 'deadbeef';
    const str = `v1-${entityAddr.toPrefixedString()}-${nameHex}`;

    const addr = EntryPointAddr.fromString(str);

    expect(addr.vmCasperV1?.nameBytes).to.deep.equal(
      Uint8Array.from([0xde, 0xad, 0xbe, 0xef])
    );
    expect(addr.toPrefixedString()).to.equal(str);
  });

  it('V2: fromString() / toPrefixedString() round-trips', () => {
    // selector is written little-endian, so 42 (0x2a) round-trips as 2a000000.
    const str = `v2-${entityAddr.toPrefixedString()}-2a000000`;

    const addr = EntryPointAddr.fromString(str);

    expect(addr.vmCasperV2?.selector).to.equal(42);
    expect(addr.toPrefixedString()).to.equal(str);
  });

  it('fromString() rejects a string with an unrecognized version prefix', () => {
    expect(() =>
      EntryPointAddr.fromString(`v3-${entityAddr.toPrefixedString()}-00`)
    ).to.throw(EntryPointError, 'Invalid EntryPoint format');
  });

  // `toBytes` lays V1 out as tag(1) + entityBytes(33) + nameBytes(32), and the
  // entity's 33 bytes are its own kind tag plus the hash. Reading the name at a
  // hand-computed `1 + ByteHashLen` misses that kind tag and shifts by one.
  it('V1: round-trips the name bytes through toBytes()/fromBytes()', () => {
    const addr = EntryPointAddr.fromString(
      `v1-${entityAddr.toPrefixedString()}-${'cd'.repeat(32)}`
    );
    const { result, bytes } = EntryPointAddr.fromBytes(addr.toBytes());

    expect(result.vmCasperV1?.nameBytes).to.deep.equal(
      addr.vmCasperV1?.nameBytes
    );
    expect(result.vmCasperV1?.entityAddr.toPrefixedString()).to.equal(
      entityAddr.toPrefixedString()
    );
    // Nothing left over: a reader that returns already-consumed bytes here
    // corrupts whatever `Key.fromBytes` decodes next.
    expect(bytes).to.have.lengthOf(0);
  });

  it('V2: round-trips the selector through toBytes()/fromBytes()', () => {
    const addr = EntryPointAddr.fromString(
      `v2-${entityAddr.toPrefixedString()}-2a000000`
    );
    const { result } = EntryPointAddr.fromBytes(addr.toBytes());

    expect(result.vmCasperV2?.selector).to.equal(addr.vmCasperV2?.selector);
  });
});
