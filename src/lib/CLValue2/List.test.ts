import { expect } from 'chai';
import { List } from './List';
import { Bool, BoolType } from './Bool';

describe('CLValue List implementation', () => {
  it('Bool should return proper clType', () => {
    const myBool = new Bool(false);
    const clType = myBool.clType();
    expect(clType.toString()).to.be.eq("Bool");
  });

  it('List should return proper clType', () => {
    const myBool = new Bool(false);
    const myList = new List<Bool>([myBool]);

    expect(myList.clType().toString()).to.be.eq("List (Bool)");
  });

  it('Should be able to create List with proper values - correct by construction', () => {
    const myList = new List([new Bool(true), new Bool(false)]);

    expect(myList).to.be.an.instanceof(List);
  });

  it('Should throw an error when list is not correct by construction', () => {
    const badFn = () => new List([new Bool(true), new List([new Bool(false)])]);

    expect(badFn).to.throw("Invalid data provided.");
  });

  it('Should throw an error when list is not correct by construction', () => {
    const badFn = () => new List([1, 2, 3]);

    expect(badFn).to.throw("Invalid data type(s) provided.");
  });

  it('Should be able to return proper values by calling .value() on List', () => {
    const myBool = new Bool(false);
    const myList = new List<Bool>([myBool]);

    expect(myList.value()).to.be.deep.eq([myBool]);
  });

  it('Should able to create empty List by providing type', () => {
    const mList = new List(new BoolType());
    const len = mList.size();

    expect(len).to.equal(0);
  });

  it('Get should return proper value', () => {
    const myList = new List([new Bool(true)]);
    const newItem = new Bool(false);

    myList.push(newItem);

    expect(myList.get(1)).to.deep.eq(newItem);
  });

  it('Set should be able to set values at already declared indexes', () => {
    const myList = new List([new Bool(true)]);
    const newItem = new Bool(false);

    myList.set(0, newItem);

    expect(myList.get(0)).to.deep.eq(newItem);
  });

  it('Set should throw error on wrong indexes', () => {
    const myList = new List([new Bool(true)]);

    const badFn = () => myList.set(1, new Bool(false));

    expect(badFn).to.throw("Array index out of bounds.");
  });

  it('Push should be consistent with types', () => {
    const myList = new List([new Bool(true)]);

    myList.push(new Bool(false));
    
    // @ts-ignore
    const badFn = () => myList.push(new List([new Bool(false)]));

    expect(myList.size()).to.equal(2);
    expect(badFn).to.throw("Incosnsistent data type, use Bool.");
  });

  it('Pop should remove last item from array and return it', () => {
    const myList = new List([new Bool(true), new Bool(false)]);

    const popped = myList.pop();

    expect(myList.size()).to.equal(1);
    expect(popped).to.deep.equal(new Bool(false));
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

  it('Serializes to proper byte array', () => {
    const myList = new List([new Bool(false)]);
    const expected = Uint8Array.from([ 1, 0, 0, 0, 0 ]);
    expect(myList.toBytes()).to.deep.eq(expected);
  });
});

