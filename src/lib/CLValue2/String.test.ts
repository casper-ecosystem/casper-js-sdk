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

  it('CLString clType() should return proper type', () => {
    // @ts-ignore
    const badFn = () => new CLString(123);

    expect(badFn).to.throw("Wrong data type, you should provide string, but you provided number");
  });
});
