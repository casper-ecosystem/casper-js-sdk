import { expect } from 'chai';
import { AccountHash } from './AccountHash';

describe('AccountHash', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = new Uint8Array([21,31]);
    const myHash = new AccountHash(arr8);

    expect(myHash.value()).to.be.deep.eq(arr8);
  });
  it('Should be able to return proper value by calling .clType()', () => {
    const arr8 = new Uint8Array([21,31]);
    const myHash = new AccountHash(arr8);

    expect(myHash.clType().toString()).to.be.eq("AccountHash");
  });
});

