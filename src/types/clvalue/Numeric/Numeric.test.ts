import { expect } from 'chai';
import { CLValueUInt32 } from './Uint32';
import { CLValueParser } from '../Parser';
import {
  CLTypeInt64,
  CLTypeUInt32,
  CLTypeUInt64,
  CLTypeUInt8
} from '../cltype';
import { CLValue } from '../CLValue';

const MAX_I64 = '9223372036854775807';
const MAX_U8 = 255;
const MAX_U32 = 4294967295;
const MAX_U64 = '18446744073709551615';

describe('Numeric implementation tests', () => {
  it('Numeric value() should return proper value', () => {
    const num = new CLValueUInt32(10);
    expect(num.toNumber()).to.be.eq(10);
  });

  it('Numeric clType() should return proper type', () => {
    const num = CLValue.newCLUInt128(20000);
    expect(num.getType().toString()).to.be.eq('U128');
  });

  it('CLI32 do proper toBytes()/fromBytes()', () => {
    const num1 = CLValue.newCLUInt32(10);
    const num1bytes = num1.bytes();

    const num2 = CLValue.newCLUInt32(1);
    const num2bytes = num2.bytes();

    expect(
      CLValueParser.fromBytesByType(num1bytes, CLTypeUInt32).result
    ).to.be.deep.eq(num1);
    expect(
      CLValueParser.fromBytesByType(num2bytes, CLTypeUInt32).result
    ).to.be.deep.eq(num2);
  });

  it('CLI64 do proper toBytes()/fromBytes()', () => {
    const num1 = CLValue.newCLInt64(10);
    const num1bytes = num1.bytes();

    const num2 = CLValue.newCLInt64(MAX_I64);
    const num2bytes = num2.bytes();

    expect(
      CLValueParser.fromBytesByType(num1bytes, CLTypeInt64).result
    ).to.be.deep.eq(num1);
    expect(
      CLValueParser.fromBytesByType(num2bytes, CLTypeInt64).result
    ).to.be.deep.eq(num2);
  });

  it('CLU8 do proper toBytes()/fromBytes()', () => {
    const num1 = CLValue.newCLUint8(MAX_U8);
    const num1bytes = num1.bytes();

    expect(
      CLValueParser.fromBytesByType(num1bytes, CLTypeUInt8).result
    ).to.be.deep.eq(num1);
  });

  it('CLU32 do proper toBytes()/fromBytes()', () => {
    const num1 = CLValue.newCLUInt32(MAX_U32);
    const num1bytes = num1.bytes();

    expect(
      CLValueParser.fromBytesByType(num1bytes, CLTypeUInt32).result
    ).to.be.deep.eq(num1);
  });

  it('CLU64 do proper toBytes()/fromBytes()', () => {
    const num1 = CLValue.newCLUint64(MAX_U64);
    const num1bytes = num1.bytes();

    expect(
      CLValueParser.fromBytesByType(num1bytes, CLTypeUInt64).result
    ).to.be.deep.eq(num1);
  });

  it('CLU64 toJSON() / fromJSON()', () => {
    const num1 = CLValue.newCLUint64(MAX_U64);
    const num1JSON = CLValueParser.toJSON(num1);
    const expectedJson = JSON.parse(
      '{"bytes":"ffffffffffffffff","cl_type":"U64"}'
    );

    expect(num1JSON).to.be.deep.eq(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.be.deep.eq(num1);
  });
});
