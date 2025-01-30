import { expect } from 'chai';

import { CLValueMap } from './Map';
import { CLTypeBool, CLTypeInt32, CLTypeMap, CLTypeString } from './cltype';
import { CLValueParser } from './Parser';
import { CLValue } from './CLValue';

describe('CLValue CLMap implementation', () => {
  it('Maps should return proper clType', () => {
    const mapType = new CLTypeMap(CLTypeBool, CLTypeBool);
    const testMap = new CLValueMap(mapType);
    testMap.append(CLValue.newCLValueBool(true), CLValue.newCLValueBool(false));

    expect(testMap.toString()).to.be.eq('(true="false")');
  });

  it('Should be able to create Map with proper values - correct by construction', () => {
    const myKey = CLValue.newCLString('ABC');
    const myVal = CLValue.newCLInt32(123);
    const mapType = new CLTypeMap(CLTypeString, CLTypeInt32);
    const testMap = new CLValueMap(mapType);
    testMap.append(myKey, myVal);

    expect(testMap).to.be.an.instanceof(CLValueMap);
  });

  it('Should be able to return proper values by calling .get() on Map', () => {
    const myKey = CLValue.newCLString('ABC');
    const myVal = CLValue.newCLInt32(10);
    const mapType = new CLTypeMap(CLTypeString, CLTypeInt32);
    const testMap = new CLValueMap(mapType);
    testMap.append(myKey, myVal);

    expect(testMap.get('ABC')).to.be.deep.eq(myVal);
    expect(testMap.get('ABC')?.i32?.toNumber()).to.be.deep.eq(
      myVal.i32?.toNumber()
    );
  });

  it('Get() should return undefined on non-existing key', () => {
    const mapType = new CLTypeMap(CLTypeString, CLTypeInt32);
    const testMap = new CLValueMap(mapType);

    expect(testMap.get('DEF')).to.be.deep.eq(undefined);
  });

  it('Should able to create empty Map by providing type', () => {
    const mapType = new CLTypeMap(CLTypeString, CLTypeString);
    const testMap = new CLValueMap(mapType);
    const len = testMap.length();

    expect(len).to.equal(0);
  });

  it('fromBytes() / toBytes()', () => {
    const myKey = CLValue.newCLString('ABC');
    const myVal = CLValue.newCLInt32(10);
    const clValueMap = CLValue.newCLMap(CLTypeString, CLTypeInt32);
    clValueMap.map?.append(myKey, myVal);

    const bytes = clValueMap.bytes();
    const fromBytes = CLValueParser.fromBytesByType(bytes, clValueMap.type)
      .result;

    expect(fromBytes).to.be.deep.eq(clValueMap);
  });

  it('fromJSON() / toJSON()', () => {
    const myKey = CLValue.newCLString('ABC');
    const myVal = CLValue.newCLInt32(10);
    const clValueMap = CLValue.newCLMap(CLTypeString, CLTypeInt32);
    clValueMap.map?.append(myKey, myVal);

    const json = CLValueParser.toJSON(clValueMap);
    const expectedJson = JSON.parse(
      '{"bytes":"01000000030000004142430a000000","cl_type":{"Map":{"key":"String","value":"I32"}}}'
    );

    const fromJson = CLValueParser.fromJSON(expectedJson);

    expect(fromJson).to.be.deep.eq(clValueMap);
    expect(json).to.be.deep.eq(expectedJson);
    expect(fromJson.map?.get('ABC')?.i32?.toNumber()).to.be.deep.eq(
      myVal.i32?.toNumber()
    );
  });
});
