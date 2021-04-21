import { expect } from 'chai';
import {
  CLList,
  CLListType,
  CLBool,
  CLBoolType,
  CLU8,
  CLI32,
  CLI32Type
} from './index';
// import { buildCLValueFromJson} from './utils';

describe('CLValue List implementation', () => {
  it('List should return proper clType', () => {
    const myBool = new CLBool(false);
    const myList = new CLList([myBool]);

    expect(myList.clType().toString()).to.be.eq('List (Bool)');
  });

  it('Should be able to create List with proper values - correct by construction', () => {
    const myList = new CLList([new CLBool(true), new CLBool(false)]);

    expect(myList).to.be.an.instanceof(CLList);
  });

  it('Should throw an error when list is not correct by construction', () => {
    const badFn = () =>
      new CLList([new CLBool(true), new CLList([new CLBool(false)])]);

    expect(badFn).to.throw('Invalid data provided.');
  });

  it('Should throw an error when list is not correct by construction', () => {
    // @ts-ignore
    const badFn = () => new CLList([1, 2, 3]);

    expect(badFn).to.throw('Invalid data type(s) provided.');
  });

  it('Should be able to return proper values by calling .value() on List', () => {
    const myBool = new CLBool(false);
    const myList = new CLList([myBool]);

    expect(myList.value()).to.be.deep.eq([myBool]);
  });

  it('Get on non existing index should throw an error', () => {
    const mList = new CLList(new CLBoolType());
    const badFn = () => mList.get(100);

    expect(badFn).to.throw('List index out of bounds.');
  });

  it('Should able to create empty List by providing type', () => {
    const mList = new CLList(new CLBoolType());
    const len = mList.size();

    const badFn = () => mList.push(new CLU8(10));

    expect(len).to.equal(0);
    expect(badFn).to.throw('Incosnsistent data type, use Bool.');
  });

  it('Get should return proper value', () => {
    const myList = new CLList([new CLBool(true)]);
    const newItem = new CLBool(false);

    myList.push(newItem);

    expect(myList.get(1)).to.deep.eq(newItem);
  });

  it('Set should be able to set values at already declared indexes', () => {
    const myList = new CLList([new CLBool(true)]);
    const newItem = new CLBool(false);

    myList.set(0, newItem);

    expect(myList.get(0)).to.deep.eq(newItem);
  });

  it('Set should throw error on wrong indexes', () => {
    const myList = new CLList([new CLBool(true)]);

    const badFn = () => myList.set(1, new CLBool(false));

    expect(badFn).to.throw('List index out of bounds.');
  });

  it('Push should be consistent with types', () => {
    const myList = new CLList([new CLBool(true)]);

    myList.push(new CLBool(false));

    // @ts-ignore
    const badFn = () => myList.push(new CLList([new CLBool(false)]));

    expect(myList.size()).to.equal(2);
    expect(badFn).to.throw('Incosnsistent data type, use Bool.');
  });

  it('Pop should remove last item from array and return it', () => {
    const myList = new CLList([new CLBool(true), new CLBool(false)]);

    const popped = myList.pop();

    expect(myList.size()).to.equal(1);
    expect(popped).to.deep.equal(new CLBool(false));
  });

  it('Pop on empty list returns undefined', () => {
    const mList = new CLList(new CLBoolType());

    expect(mList.pop()).to.equal(undefined);
  });

  it('Should set nested value by chaining methods', () => {
    const myList = new CLList([
      new CLList([new CLBool(true), new CLBool(false)])
    ]);

    myList.get(0).set(1, new CLBool(true));

    expect(myList.get(0).get(1)).to.deep.eq(new CLBool(true));
  });

  it('Remove should remove item at certein index', () => {
    const myList = new CLList([new CLBool(true), new CLBool(false)]);

    myList.remove(0);

    expect(myList.get(0)).to.deep.eq(new CLBool(false));
  });

  it('Serializes to proper byte array', () => {
    const myList = new CLList([new CLBool(false)]);
    const expected = Uint8Array.from([1, 0, 0, 0, 0]);
    expect(myList.toBytes().unwrap()).to.deep.eq(expected);
  });

  it('Runs fromBytes properly', () => {
    const myList = new CLList([new CLBool(false), new CLBool(true)]);

    const bytes = myList.toBytes();

    const listType = new CLListType(new CLBoolType());

    const reconstructedList = CLList.fromBytes(bytes.unwrap(), listType);

    expect(reconstructedList.unwrap()).to.be.deep.eq(myList);
  });

  it('Runs fromBytes properly', () => {
    const myList = new CLList([new CLI32(100000), new CLI32(-999)]);

    const bytes = myList.toBytes();

    const listType = new CLListType(new CLI32Type());

    const reconstructedList = CLList.fromBytes(bytes.unwrap(), listType);

    expect(reconstructedList.unwrap()).to.be.deep.eq(myList);
  });

  // it('Runs toJSON() / fromJSON() properly', () => {
  //   const myList = new CLList([
  //     new CLList([new CLBool(true), new CLBool(false)]),
  //     new CLList([new CLBool(false)])
  //   ]);

  //   const bytes = myList.toBytes();

  //   const listType = new CLListType(new CLListType(new CLBoolType()));

  //   const reconstructedList = CLList.fromBytes(bytes, listType);

  //   expect(reconstructedList.result.val).to.be.deep.eq(myList);

  //   const json = myList.toJSON();
  //   // @ts-ignore
  //   const newList = CLList.fromJSON(json.result.val);

  //   const newList2 = buildCLValueFromJson(json.result.val);

  //   expect(newList.result.val).to.be.deep.eq(myList);
  //   // @ts-ignore
  //   expect(newList2.result.val).to.be.deep.eq(myList);
  // });
});
