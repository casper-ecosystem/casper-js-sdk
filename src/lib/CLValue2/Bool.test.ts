import { expect } from 'chai';
import { Bool } from './Bool';

describe('CLValue Bool implementation', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const myBool = new Bool(false);

    expect(myBool.value()).to.be.eq(false);
  });
});
