import { expect } from 'vitest';

import { CLValue, CLValueAny, CLValueParser, CLTypeAny } from '../../../types';
import { expectByteRoundTrip } from '../../roundtrip';

describe('CLValueAny', () => {
  it('stores arbitrary bytes verbatim', () => {
    const data = Uint8Array.from([1, 2, 3, 4, 5]);
    const value = CLValue.newCLAny(data);

    expect(value.any).to.be.an.instanceof(CLValueAny);
    expect(value.bytes()).to.deep.equal(data);
    expect(value.type).to.equal(CLTypeAny);
  });

  it('round-trips through bytes when the caller already knows the length', () => {
    // `fromBytesByType` takes every remaining byte as the payload, so this is
    // lossless only because the caller sliced to the right length first.
    expectByteRoundTrip(CLValue.newCLAny(Uint8Array.from([9, 9, 9, 9])));
  });

  it('round-trips through the CLType-prefixed byte encoding', () => {
    // The length prefix these add is what lets an Any sit inside a larger byte
    // stream without swallowing whatever follows it.
    const value = CLValue.newCLAny(Uint8Array.from([7, 8, 9]));
    const wrapped = CLValueParser.toBytesWithType(value);
    const { result, bytes: remainder } =
      CLValueParser.fromBytesWithType(wrapped);

    expect(result).to.deep.equal(value);
    expect(remainder).to.deep.equal(new Uint8Array());
  });

  it('toJSON() / fromJSON()', () => {
    const value = CLValue.newCLAny(Uint8Array.from([0xde, 0xad, 0xbe, 0xef]));
    const json = CLValueParser.toJSON(value);
    const expectedJson = JSON.parse('{"bytes":"deadbeef","cl_type":"Any"}');

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(value);
  });

  it('toString() decodes the bytes as UTF-8', () => {
    const value = CLValue.newCLAny(new TextEncoder().encode('hello'));

    expect(value.toString()).to.equal('hello');
  });
});
