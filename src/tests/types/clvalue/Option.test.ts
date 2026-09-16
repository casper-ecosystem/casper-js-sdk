import { expect } from 'vitest';

import {
  CLValue,
  CLValueOption,
  CLValueParser,
  CLTypeOption,
  CLTypeUInt32
} from '../../../types';
import { expectByteRoundTrip } from '../../roundtrip';

describe('CLValueOption', () => {
  it('Some(U32) holds its inner value and is not empty', () => {
    const inner = CLValue.newCLUInt32(42);
    const option = CLValue.newCLOption(inner);

    expect(option.option).to.be.an.instanceof(CLValueOption);
    expect(option.option?.isEmpty()).to.be.false;
    expect(option.option?.value()).to.deep.equal(inner);
    expect(option.type).to.be.an.instanceof(CLTypeOption);
  });

  it('None(U32) is empty and carries no value', () => {
    const option = CLValue.newCLOption(null, CLTypeUInt32);

    expect(option.option?.isEmpty()).to.be.true;
    expect(option.option?.value()).to.be.null;
  });

  it('Some(U32) round-trips through bytes', () => {
    expectByteRoundTrip(CLValue.newCLOption(CLValue.newCLUInt32(7)));
  });

  it('None(U32) round-trips through bytes as a single zero byte', () => {
    const option = CLValue.newCLOption(null, CLTypeUInt32);

    expect(option.bytes()).to.deep.equal(Uint8Array.from([0]));
    expectByteRoundTrip(option);
  });

  it('nested Option<Option<U32>> Some(Some(x)) round-trips through bytes', () => {
    const nested = CLValue.newCLOption(
      CLValue.newCLOption(CLValue.newCLUInt32(99))
    );

    expectByteRoundTrip(nested);
  });

  it('nested Option<Option<U32>> Some(None) round-trips through bytes', () => {
    const innerNone = CLValue.newCLOption(null, CLTypeUInt32);
    const nested = CLValue.newCLOption(innerNone);

    expect(nested.bytes()).to.deep.equal(Uint8Array.from([1, 0]));
    expectByteRoundTrip(nested);
  });

  it('Some(U32) toJSON() / fromJSON()', () => {
    const option = CLValue.newCLOption(CLValue.newCLUInt32(42));
    const json = CLValueParser.toJSON(option);
    const expectedJson = JSON.parse(
      '{"bytes":"012a000000","cl_type":{"Option":"U32"}}'
    );

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(option);
  });

  it('None(U32) toJSON() / fromJSON()', () => {
    const option = CLValue.newCLOption(null, CLTypeUInt32);
    const json = CLValueParser.toJSON(option);
    const expectedJson = JSON.parse(
      '{"bytes":"00","cl_type":{"Option":"U32"}}'
    );

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(option);
  });

  it('nested Option<Option<U32>> toJSON() / fromJSON()', () => {
    const nested = CLValue.newCLOption(
      CLValue.newCLOption(CLValue.newCLUInt32(5))
    );
    const json = CLValueParser.toJSON(nested);
    const expectedJson = JSON.parse(
      '{"bytes":"010105000000","cl_type":{"Option":{"Option":"U32"}}}'
    );

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(nested);
  });
});
