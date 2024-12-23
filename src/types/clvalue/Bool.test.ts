import { expect } from 'chai';
import { CLValueBool } from './Bool';
import { CLValueParser } from './Parser';
import { CLTypeBool } from './cltype';

describe('CLBool', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const myBool = new CLValueBool(false);
    const myBool2 = new CLValueBool(true);

    expect(myBool.getValue()).to.be.eq(false);
    expect(myBool2.getValue()).to.be.eq(true);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const myBool = new CLValueBool(false);
    const myBool2 = new CLValueBool(true);
    const myBoolBytes = myBool.bytes();
    const myBool2Bytes = myBool2.bytes();

    const fromBytes1 = CLValueParser.fromBytesByType(myBoolBytes, CLTypeBool)
      .result;
    const fromBytes2 = CLValueParser.fromBytesByType(myBool2Bytes, CLTypeBool)
      .result;

    expect(myBoolBytes).to.be.deep.eq(Uint8Array.from([0]));
    expect(myBool2Bytes).to.be.deep.eq(Uint8Array.from([1]));

    expect(fromBytes1.bool).to.be.deep.eq(myBool);
    expect(fromBytes2.bool).to.be.deep.eq(myBool2);
  });

  it('toJSON() / fromJSON() do proper bytes serialization', () => {
    const myBool = CLValueBool.newCLValueBool(false);
    const json = CLValueParser.toJSON(myBool);
    const expectedJson = JSON.parse('{"bytes":"00","cl_type":"Bool"}');

    expect(json).to.be.deep.eq(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.be.deep.eq(myBool);
  });
});
