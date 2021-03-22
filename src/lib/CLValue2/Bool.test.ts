import { expect } from 'chai';
import { CLBool } from './Bool';

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
});
