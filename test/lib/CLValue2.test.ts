import { expect } from 'chai';
import { CLValue, CLValueTypes, List } from '../../src/lib/CLValue2';

describe('New Implementation of CLValue.list', () => {
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
    const myList = CLValue.list(CLValueTypes.Bool);
    expect(myList.size()).to.equal(0);
  });

  it('Should throw an error when pushed element is different than type declared when empty list was created', () => {
    const myList = CLValue.list(CLValueTypes.Bool);
    const badFn = () => myList.push(CLValue.list([CLValue.bool(true)]));
    expect(badFn).to.throw();
  });

  it('Get should return proper value', () => {
    const myList = CLValue.list([CLValue.bool(true)]);
    const newItem = CLValue.bool(false);
    myList.push(newItem);
    expect(myList.get(1)).to.deep.eq(newItem);
  });

  it('Set should be able to push at current index + 1', () => {
    const myList = CLValue.list([CLValue.bool(true)]);
    const newItem = CLValue.bool(false);
    myList.set(1, newItem);
    expect(myList.get(1)).to.deep.eq(newItem);

  });

  it('Push should be consistent with types', () => {
    const myList = CLValue.list([CLValue.bool(true)]);
    myList.push(CLValue.bool(false));
    expect(myList.size()).to.equal(2);
  });

  it('Pop should remove last item from array', () => {
    const myList = CLValue.list([CLValue.bool(true), CLValue.bool(false)]);
    myList.pop();
    expect(myList.size()).to.equal(1);
  });
});
