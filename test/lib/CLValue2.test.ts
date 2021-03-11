import { expect } from 'chai';
import { List, Bool } from '../../src/lib/CLValue2';

describe('New Implementation of CLValue.list', () => {
  it('Should be able to create List with proper values - correct by construction', () => {
    const myList = new List([new Bool(true), new Bool(false)]);

    expect(myList).to.be.an.instanceof(List);
  });

  // NOTE: Irrelevant in TS
  // it('Should throw an error when construction array contains different type objects', () => {
  //   const badFn = () =>
  //     new List([new List([new Bool(true)])]);
  //   expect(badFn).to.throw();
  // });

  it('Should able to create empty List by providing type', () => {
    const mList = new List<Bool>([]);
    const len = mList.size();
    expect(len).to.equal(0);
  });

  it('Get should return proper value', () => {
    const myList = new List([new Bool(true)]);
    const newItem = new Bool(false);
    myList.push(newItem);
    expect(myList.get(1)).to.deep.eq(newItem);
  });

  it('Set should be able to push at current index + 1', () => {
    const myList = new List([new Bool(true)]);
    const newItem = new Bool(false);
    myList.set(0, newItem);
    expect(myList.get(0)).to.deep.eq(newItem);
  });

  it('Push should be consistent with types', () => {
    const myList = new List([new Bool(true)]);
    myList.push(new Bool(false));
    expect(myList.size()).to.equal(2);
  });

  it('Pop should remove last item from array', () => {
    const myList = new List([new Bool(true), new Bool(false)]);
    myList.pop();
    expect(myList.size()).to.equal(1);
  });

  it('Should set nested value by chaining methods', () => {
    const myList = new List([new List([new Bool(true), new Bool(false)])]);
    myList.get(0).set(1, new Bool(true));
    expect(myList.get(0).get(1)).to.deep.eq(new Bool(true));
  });

  it('Remove should remove item at certein index', () => {
    const myList = new List([new Bool(true), new Bool(false)]);
    myList.remove(0);
    expect(myList.get(0)).to.deep.eq(new Bool(false));
  });
});
