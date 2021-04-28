import { expect } from 'chai';
import {
  CLValueParsers,
  CLI32,
  CLI32Type,
  CLI64,
  CLI64Type,
  CLU8,
  CLU8Type,
  CLU32,
  CLU32Type,
  CLU64,
  CLU64Type,
  CLU128
} from './index';

const MAX_I64 = '9223372036854775807';
const MAX_U8 = 255;
const MAX_U32 = 4294967295;
const MAX_U64 = '18446744073709551615';

describe('Numeric implementation tests', () => {
  it('Numeric value() should return proper value', () => {
    const num = new CLI32(10);
    expect(num.value().toNumber()).to.be.eq(10);
  });

  it('Numeric clType() should return proper type', () => {
    const num = new CLU128(20000);
    expect(num.clType().toString()).to.be.eq('U128');
  });

  it('Unsigned Numeric cant accept negative numbers in constructor', () => {
    const badFn = () => new CLU128('-100');

    expect(badFn).to.throw(
      "Can't provide negative numbers with isSigned=false"
    );
  });

  it('CLI32 do proper toBytes()/fromBytes()', () => {
    const num1 = new CLI32(-10);
    const num1bytes = CLValueParsers.toBytes(num1).unwrap();

    const num2 = new CLI32(1);
    const num2bytes = CLValueParsers.toBytes(num2).unwrap();

    expect(
      CLValueParsers.fromBytes(num1bytes, new CLI32Type()).unwrap()
    ).to.be.deep.eq(num1);
    expect(
      CLValueParsers.fromBytes(num2bytes, new CLI32Type()).unwrap()
    ).to.be.deep.eq(num2);
  });

  it('CLI64 do proper toBytes()/fromBytes()', () => {
    const num1 = new CLI64(-10);
    const num1bytes = CLValueParsers.toBytes(num1).unwrap();

    const num2 = new CLI64(MAX_I64);
    const num2bytes = CLValueParsers.toBytes(num2).unwrap();

    expect(
      CLValueParsers.fromBytes(num1bytes, new CLI64Type()).unwrap()
    ).to.be.deep.eq(num1);
    expect(
      CLValueParsers.fromBytes(num2bytes, new CLI64Type()).unwrap()
    ).to.be.deep.eq(num2);
  });

  it('CLU8 do proper toBytes()/fromBytes()', () => {
    const num1 = new CLU8(MAX_U8);
    const num1bytes = CLValueParsers.toBytes(num1).unwrap();

    expect(
      CLValueParsers.fromBytes(num1bytes, new CLU8Type()).unwrap()
    ).to.be.deep.eq(num1);
  });

  it('CLU32 do proper toBytes()/fromBytes()', () => {
    const num1 = new CLU32(MAX_U32);
    const num1bytes = CLValueParsers.toBytes(num1).unwrap();

    expect(
      CLValueParsers.fromBytes(num1bytes, new CLU32Type()).unwrap()
    ).to.be.deep.eq(num1);
  });

  it('CLU64 do proper toBytes()/fromBytes()', () => {
    const num1 = new CLU64(MAX_U64);
    const num1bytes = CLValueParsers.toBytes(num1).unwrap();

    expect(
      CLValueParsers.fromBytes(num1bytes, new CLU64Type()).unwrap()
    ).to.be.deep.eq(num1);
  });

  it('CLU64 toJSON() / fromJSON()', () => {
    const num1 = new CLU64(MAX_U64);
    const num1JSON = CLValueParsers.toJSON(num1).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"ffffffffffffffff","cl_type":"U64"}'
    );

    expect(num1JSON).to.be.deep.eq(expectedJson);
    expect(CLValueParsers.fromJSON(expectedJson).unwrap()).to.be.deep.eq(num1);
  });
});
