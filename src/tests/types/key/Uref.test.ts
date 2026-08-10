import { expect } from 'vitest';

import {
  URef,
  UrefAccess,
  Conversions,
  CLValue,
  CLValueParser
} from '../../../types';

const urefAddr =
  '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
const RWExampleURef = new URef(
  Conversions.decodeBase16(urefAddr),
  UrefAccess.ReadAddWrite
);

const formattedStr =
  'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007';

describe('CLUref', () => {
  it('Should be valid by construction', () => {
    const badFn1 = () =>
      new URef(Conversions.decodeBase16('3a3a3a'), UrefAccess.ReadAddWrite);
    // Deliberately out of range: the point of the case is the runtime guard.
    // TypeScript 6 rejects the bare literal, so the cast is what keeps the
    // negative test compilable.
    const badFn2 = () =>
      new URef(Conversions.decodeBase16(urefAddr), 10 as UrefAccess);

    expect(RWExampleURef).to.be.an.instanceof(URef);
    expect(badFn1).to.throw('Invalid URef data length; expected 32');
    expect(badFn2).to.throw('Unsupported AccessRights');
  });

  it('fromFormattedString() / toFormattedString() proper value', () => {
    const myURef = URef.fromString(formattedStr);
    const badFn1 = () => URef.fromString('xxxx-ttttttttttttttt-000');
    const badFn2 = () => URef.fromString('uref-ttttttttttttttt');

    expect(myURef).to.be.an.instanceof(URef);
    expect(myURef.toPrefixedString()).to.be.eq(formattedStr);
    expect(badFn1).to.throw("Prefix is not 'uref-");
    expect(badFn2).to.throw('incorrect uref format');
  });

  it('toBytes() / fromBytes() proper values', () => {
    const expectedBytes = Uint8Array.from([...Array(32).fill(42), 7]);
    const urefValue = CLValue.newCLUref(RWExampleURef);
    const toBytes = urefValue.bytes();
    const fromBytes = CLValueParser.fromBytesByType(
      expectedBytes,
      urefValue.type
    );

    expect(toBytes).to.be.deep.eq(expectedBytes);
    expect(fromBytes?.result?.uref).to.be.deep.eq(RWExampleURef);
  });

  it('fromJSON() / toJSON()', () => {
    const urefValue = CLValue.newCLUref(RWExampleURef);
    const json = CLValueParser.toJSON(urefValue);
    const expectedJson = JSON.parse(
      '{"bytes":"2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07","cl_type":"URef"}'
    );

    expect(CLValueParser.fromJSON(expectedJson).uref).to.be.deep.eq(
      RWExampleURef
    );
    expect(json).to.be.deep.eq(expectedJson);
  });
});
