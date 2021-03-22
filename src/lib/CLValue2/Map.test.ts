import { expect } from 'chai';
import { CLValue } from './Abstract';
import { MapValue } from './Map';
import { CLBool } from './Bool';
import { CLString, CLStringType } from './String';
import { CLI32 } from './Numeric';

describe('CLValue MapValue implementation', () => {
  it('Maps hould return proper clType', () => {
    const myMap = new MapValue([[new CLBool(true), new CLBool(false)]]);

    expect(myMap.clType().toString()).to.be.eq('Map (Bool: Bool)');
  });

  it('Should be able to create Map with proper values - correct by construction', () => {
    const inside: [CLValue, CLValue] = [new CLString('ABC'), new CLI32(123)]
    const myMap = new MapValue([inside]);

    expect(myMap).to.be.an.instanceof(MapValue);
    expect(myMap.value()).to.be.deep.eq([inside]);
  });

  it('Should throw an error when MapValue is not correct by construction', () => {
    const badFn = () =>
      new MapValue([
        [new CLString('ABC'), new CLI32(123)],
        [new CLString('DEF'), new CLBool(false)]
      ]);

    expect(badFn).to.throw('Invalid data provided.');
  });

  it('Should throw an error when MapValue is not correct by construction', () => {
    const badFn = () =>
      // @ts-ignore
      new MapValue([
        [new CLString('ABC'), 2]
      ]);

    expect(badFn).to.throw('Invalid data type(s) provided.');
  });

  it('Should be able to return proper values by calling .get() on Map', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);

    expect(myMap.get(myKey).value()).to.be.deep.eq(myVal.value());
  });

  it('Get() should return indefined on non-existing key', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);

    expect(myMap.get(new CLString("DEF"))).to.be.deep.eq(undefined);
  });

  it('Should able to create empty Map by providing type', () => {
    const myMap = new MapValue([
      new CLStringType(),
      new CLStringType()
    ]);
    const len = myMap.size();

    expect(len).to.equal(0);
  });

  it('Set should be able to set values at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);
    const newVal = new CLI32(11);

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey).value()).to.deep.eq(newVal.value());
  });

  it('Set should be able to set values at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);
    const newVal = new CLI32(11);

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey).value()).to.deep.eq(newVal.value());
    expect(myMap.size()).to.eq(1);
  });

  it('Set should be able to set values at empty keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);
    const newKey = new CLString("DEF");
    const newVal = new CLI32(11);

    myMap.set(newKey, newVal);

    expect(myMap.get(newKey).value()).to.deep.eq(newVal.value());
    expect(myMap.size()).to.eq(2);
  });

  it('Remove should remove key/value pair at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new CLI32(10);
    const myMap = new MapValue([[myKey, myVal ]]);

    myMap.delete(myKey);

    expect(myMap.size()).to.eq(0);
  });
});
