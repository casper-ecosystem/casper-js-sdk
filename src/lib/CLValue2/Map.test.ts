import { expect } from 'chai';
import { MapValue } from './Map';
import { Bool } from './Bool';
import { CLString, CLStringType } from './String';
import { I32 } from './Numeric';

describe('CLValue MapValue implementation', () => {
  it('Mapshould return proper clType', () => {
    const myMap = new MapValue<Bool, Bool>([[new Bool(true), new Bool(false)]]);

    expect(myMap.clType().toString()).to.be.eq('Map (Bool: Bool)');
  });

  it('Should be able to create Map with proper values - correct by construction', () => {
    const myMap = new MapValue([[new CLString('ABC'), new I32(123)]]);

    expect(myMap).to.be.an.instanceof(MapValue);
  });

  it('Should throw an error when MapValue is not correct by construction', () => {
    const badFn = () =>
      new MapValue([
        [new CLString('ABC'), new I32(123)],
        [new CLString('DEF'), new Bool(false)]
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
    const myVal = new I32(10);
    const myMap = new MapValue([[myKey, myVal ]]);

    expect(myMap.get(myKey).value()).to.be.deep.eq(myVal.value());
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
    const myVal = new I32(10);
    const myMap = new MapValue([[myKey, myVal ]]);
    const newVal = new I32(11);

    // expect(myMap.get(myKey).value()).to.be.deep.eq(myVal.value());

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey).value()).to.deep.eq(newVal.value());
  });

  it('Set should be able to set values at already declared keys', () => {
    const myKey = new CLString('ABC');
    const myVal = new I32(10);
    const myMap = new MapValue([[myKey, myVal ]]);
    const newVal = new I32(11);

    myMap.set(myKey, newVal);

    expect(myMap.get(myKey).value()).to.deep.eq(newVal.value());
  });
});
