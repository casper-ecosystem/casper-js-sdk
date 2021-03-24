import { expect } from 'chai';
import { CLString } from './String';

describe('CLString', () => {
  it('CLString value() should return proper value', () => {
    const str = new CLString('ABC');
    expect(str.value()).to.be.eq('ABC');
  });

  it('CLString clType() should return proper type', () => {
    const str = new CLString('ABC');
    expect(str.clType().toString()).to.be.eq('String');
  });

  it('CLString size() should return proper string length', () => {
    const str = new CLString('ABC');
    expect(str.size()).to.be.eq(3);
  });

  it('CLString should throw an error on invalid data provided to constructor', () => {
    // @ts-ignore
    const badFn = () => new CLString(123);

    expect(badFn).to.throw("Wrong data type, you should provide string, but you provided number");
  });
});
