import { expect } from 'chai';
import { CLValue, CLValueTypesCode, List } from '../../src/lib/CLValue2';

describe('New Implementation of CLValue.List', () => {
  it('Should be able to create List with proper values - correct by construction', () => {
    const myList = CLValue.list([CLValue.bool(true), CLValue.bool(false)]);

    expect(myList).to.be.an.instanceof(List);
  });

  it('Should throw an error when construction array contains different type objects', () => {
    const badFn = () =>
      CLValue.list([CLValue.bool(true), CLValue.list([CLValue.bool(true)])]);
    expect(badFn).to.throw();
  });

  it('Should able to create empty List by providing type', () => {
    const myList = CLValue.list(CLValueTypesCode.Bool);
    expect(myList.size()).to.equal(0);
  });

  it('Should throw an error when pushed element is different than type declared when empty list was created', () => {
    const myList = CLValue.list(CLValueTypesCode.Bool);
    const badFn = () => myList.push(CLValue.list([CLValue.bool(true)]));
    expect(badFn).to.throw();
  });

  it('Get should return proper value', () => {
    const myList = CLValue.list([CLValue.bool(true)]);
    const item = CLValue.bool(false);
    myList.push(item);
    expect(myList.get(1)).to.deep.eq(item);
  });

  it('Set should be consistent with types', () => {

  });

  it('Push should be consistent with types', () => {
    const myList = CLValue.list([CLValue.bool(true)]);
    myList.push(CLValue.bool(false));
    expect(myList.size()).to.equal(2);
  });
});
