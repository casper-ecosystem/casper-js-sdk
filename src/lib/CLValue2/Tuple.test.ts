import { expect } from 'chai';
import {
  CLTuple1,
  CLTuple2,
  CLTuple3,
  CLTuple1Type,
  CLTuple2Type,
  CLTuple3Type,
  CLI32,
  CLI32Type,
  CLBool,
  CLBoolType,
  CLString,
  CLStringType
} from './index';

describe('CLTuple', () => {
  it('Tuple2 should return proper clType', () => {
    const myBool = new CLBool(false);
    const myStr = new CLString('ABC');
    const myTup = new CLTuple2([myBool, myStr]);

    expect(myTup.clType().toString()).to.be.eq('Tuple2 (Bool, String)');
  });

  it('Should be able to create tuple with proper values - correct by construction', () => {
    const myTup2 = new CLTuple2([new CLBool(true), new CLBool(false)]);

    expect(myTup2).to.be.an.instanceof(CLTuple2);
  });

  it('Should throw an error when tuple is not correct by construction', () => {
    const badFn = () => new CLTuple1([new CLBool(true), new CLBool(false)]);

    expect(badFn).to.throw('Too many elements!');
  });

  it('Should throw an error when list is not correct by construction', () => {
    const badFn = () => new CLTuple2(['a', 2]);

    expect(badFn).to.throw('Invalid data type(s) provided.');
  });

  it('Should be able to return proper values by calling .value() on Tuple', () => {
    const myBool = new CLBool(false);
    const myTuple = new CLTuple1([myBool]);

    expect(myTuple.value()).to.be.deep.eq([myBool]);
  });

  it('Get should return proper value', () => {
    const myTup = new CLTuple2([new CLBool(true)]);
    const newItem = new CLBool(false);

    myTup.push(newItem);

    expect(myTup.get(1)).to.deep.eq(newItem);
  });

  it('Set should be able to set values at already declared indexes', () => {
    const myTup = new CLTuple1([new CLBool(true)]);
    const newItem = new CLBool(false);

    myTup.set(0, newItem);

    expect(myTup.get(0)).to.deep.eq(newItem);
  });

  it('Set should throw error on wrong indexes', () => {
    const myTup = new CLTuple1([new CLBool(true)]);

    const badFn = () => myTup.set(1, new CLBool(false));

    expect(badFn).to.throw('Tuple index out of bounds.');
  });

  it('Should run toBytes() / fromBytes()', () => {
    const myTup1 = new CLTuple1([new CLBool(true)]);
    const myTup2 = new CLTuple2([new CLBool(false), new CLI32(-555)]);
    const myTup3 = new CLTuple3([
      new CLI32(-555),
      new CLString('ABC'),
      new CLString('XYZ')
    ]);

    const myTup1Bytes = myTup1.toBytes();
    const myTup2Bytes = myTup2.toBytes();
    const myTup3Bytes = myTup3.toBytes();

    expect(
      CLTuple1.fromBytes(myTup1Bytes, new CLTuple1Type([new CLBoolType()]))
        .result.val
    ).to.be.deep.eq(myTup1);

    expect(
      CLTuple2.fromBytes(
        myTup2Bytes,
        new CLTuple2Type([new CLBoolType(), new CLI32Type()])
      ).result.val
    ).to.be.deep.eq(myTup2);

    expect(
      CLTuple3.fromBytes(
        myTup3Bytes,
        new CLTuple3Type([
          new CLI32Type(),
          new CLStringType(),
          new CLStringType()
        ])
      ).result.val.value()
    ).to.be.deep.eq(myTup3.value());
  });

  it('fromJSON() / toJSON()', () => {
    const myTup1 = new CLTuple1([new CLBool(true)]);
    const myTup2 = new CLTuple2([new CLBool(false), new CLI32(-555)]);
    const myTup3 = new CLTuple3([
      new CLI32(-555),
      new CLString('ABC'),
      new CLString('XYZ')
    ]);

    const myTup1JSON = myTup1.toJSON();
    const myTup2JSON = myTup2.toJSON();
    const myTup3JSON = myTup3.toJSON();

    expect(
      CLTuple1.fromJSON(myTup1JSON.result.val)
        .result.val
    ).to.be.deep.eq(myTup1);

    expect(
      CLTuple2.fromJSON(myTup2JSON.result.val)
        .result.val
    ).to.be.deep.eq(myTup2);

    expect(
      CLTuple3.fromJSON(myTup3JSON.result.val)
        .result.val
    ).to.be.deep.eq(myTup3);

  });
});
