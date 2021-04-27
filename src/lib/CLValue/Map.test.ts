import { expect } from 'chai';
import { CLMap, CLMapType, CLBool, CLString, CLStringType, CLI32, CLI32Type } from './index';

describe('CLValue CLMap implementation', () => {
  it('Maps should return proper clType', () => {
    const myMap = new CLMap([[new CLBool(true), new CLBool(false)]]);

    expect(myMap.clType().toString()).to.be.eq('Map (Bool: Bool)');
  });

  it('Should be able to create Map with proper values - correct by construction', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(123);
    const myMap = new CLMap([[myKey, myVal]]);

    expect(myMap).to.be.an.instanceof(CLMap);
    expect(myMap.value()).to.be.deep.eq(new Map([[myKey, myVal]]));
  });

  it('Should throw an error when CLMap is not correct by construction', () => {
    const badFn = () =>
      new CLMap([
        [new CLString('ABC'), new CLI32(123)],
        // @ts-ignore
        [new CLString('DEF'), new CLBool(false)]
      ]);

    expect(badFn).to.throw('Invalid data provided.');
  });

  it('Should throw an error when CLMap is not correct by construction', () => {
    const badFn = () =>
      // @ts-ignore
      new CLMap([[new CLString('ABC'), 2]]);

    expect(badFn).to.throw('Invalid data type(s) provided.');
  });

  it('Should be able to return proper values by calling .get() on Map', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);

    expect(myMap.get(myKey)).to.be.deep.eq(myVal);
  });

  it('Get() should return undefined on non-existing key', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);

    expect(myMap.get(new CLString('DEF'))).to.be.deep.eq(undefined);
  });

  it('Should able to create empty Map by providing type', () => {
    const myMap = new CLMap([new CLStringType(), new CLStringType()]);
    const len = myMap.size();

    expect(len).to.equal(0);
  });

  it('Set should be able to set values at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);
    const newVal = new CLI32(11);

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey)).to.deep.eq(newVal);
  });

  it('Set should be able to set values at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);
    const newVal = new CLI32(11);

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey)).to.deep.eq(newVal);
    expect(myMap.size()).to.eq(1);
  });

  it('Set should be able to set values at empty keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);
    const newKey = new CLString('DEF');
    const newVal = new CLI32(11);

    myMap.set(newKey, newVal);

    expect(myMap.get(newKey)).to.deep.eq(newVal);
    expect(myMap.size()).to.eq(2);
  });

  it('Remove should remove key/value pair at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);

    myMap.delete(myKey);

    expect(myMap.size()).to.eq(0);
  });

  it('fromBytes() / toBytes()', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);

    const bytes = myMap.toBytes();
    const mapType = new CLMapType([new CLStringType(), new CLI32Type()]);

    expect(CLMap.fromBytes(bytes.unwrap(), mapType).unwrap()).to.be.deep.eq(myMap);
  });

  it('fromJSON() / toJSON()', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new CLMap([[myKey, myVal]]);

    const json = myMap.toJSON().unwrap();
    const expectedJson = JSON.parse('{"bytes":"01000000030000004142430a000000","cl_type":{"Map":{"key":"String","value":"I32"}}}');

    expect(CLMap.fromJSON(expectedJson).unwrap()).to.be.deep.eq(myMap);
    expect(json).to.be.deep.eq(expectedJson);
  });
});
