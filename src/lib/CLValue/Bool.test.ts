import { expect } from 'chai';
import { CLValueBuilder, CLValueParsers, CLBool, CLBoolType, CLErrorCodes } from './index';

describe('CLBool', () => {
  it('Bool should return proper clType', () => {
    const myBool = new CLBool(false);
    const clType = myBool.clType();
    expect(clType.toString()).to.be.eq("Bool");
  });

  it('Should be able to return proper value by calling .value()', () => {
    const myBool = new CLBool(false);
    const myBool2 = new CLBool(true);

    expect(myBool.value()).to.be.eq(false);
    expect(myBool2.value()).to.be.eq(true);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const myBool = CLValueBuilder.bool(false);
    const myBool2 = new CLBool(true);
    const myBoolBytes = CLValueParsers.toBytes(myBool).unwrap();
    const myBool2Bytes = CLValueParsers.toBytes(myBool2).unwrap();

    const fromBytes1 = CLValueParsers.fromBytes(myBoolBytes, new CLBoolType()).unwrap();
    const fromBytes2 = CLValueParsers.fromBytes(myBool2Bytes, new CLBoolType()).unwrap();

    expect(myBoolBytes).to.be.deep.eq(Uint8Array.from([0]));
    expect(myBool2Bytes).to.be.deep.eq(Uint8Array.from([1]));

    expect(fromBytes1).to.be.deep.eq(myBool);
    expect(fromBytes2).to.be.deep.eq(myBool2);
    expect(CLValueParsers.fromBytes(Uint8Array.from([9, 1]), new CLBoolType()).ok).to.be.eq(false);
    expect(CLValueParsers.fromBytes(Uint8Array.from([9, 1]), new CLBoolType()).val).to.be.eq(CLErrorCodes.Formatting);
    expect(CLValueParsers.fromBytes(Uint8Array.from([]), new CLBoolType()).ok).to.be.eq(false);
    expect(CLValueParsers.fromBytes(Uint8Array.from([]), new CLBoolType()).val).to.be.eq(CLErrorCodes.EarlyEndOfStream);
  });


  it('toJSON() / fromJSON() do proper bytes serialization', () => {
    const myBool = new CLBool(false);
    const json = CLValueParsers.toJSON(myBool).unwrap();
    const expectedJson = JSON.parse('{"bytes":"00","cl_type":"Bool"}');

    expect(json).to.be.deep.eq(expectedJson);
    expect(CLValueParsers.fromJSON(expectedJson).unwrap()).to.be.deep.eq(myBool);
  });
});
