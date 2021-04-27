import { expect } from 'chai';
import {
  CLValueParsers,
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
    // @ts-ignore
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

    const myTup1Bytes = CLValueParsers.toBytes(myTup1).unwrap();
    const myTup2Bytes = CLValueParsers.toBytes(myTup2).unwrap();
    const myTup3Bytes = CLValueParsers.toBytes(myTup3).unwrap();

    expect(
      CLValueParsers.fromBytes(
        myTup1Bytes,
        new CLTuple1Type([new CLBoolType()])
      ).unwrap()
    ).to.be.deep.eq(myTup1);

    expect(
      CLValueParsers.fromBytes(
        myTup2Bytes,
        new CLTuple2Type([new CLBoolType(), new CLI32Type()])
      ).unwrap()
    ).to.be.deep.eq(myTup2);

    expect(
      CLValueParsers.fromBytes(
        myTup3Bytes,
        new CLTuple3Type([
          new CLI32Type(),
          new CLStringType(),
          new CLStringType()
        ])
      ).unwrap()
    ).to.be.deep.eq(myTup3);
  });

  it('fromJSON() / toJSON()', () => {
    const myTup1 = new CLTuple1([new CLBool(true)]);
    const myTup2 = new CLTuple2([new CLBool(false), new CLI32(-555)]);
    const myTup3 = new CLTuple3([
      new CLI32(-555),
      new CLString('ABC'),
      new CLString('XYZ')
    ]);

    const myTup1JSON = CLValueParsers.toJSON(myTup1).unwrap();
    const myTup2JSON = CLValueParsers.toJSON(myTup2).unwrap();
    const myTup3JSON = CLValueParsers.toJSON(myTup3).unwrap();

    const expectedMyTup1JSON = JSON.parse('{"bytes":"01","cl_type":{"Tuple1":["Bool"]}}');
    const expectedMyTup2JSON = JSON.parse('{"bytes":"00d5fdffff","cl_type":{"Tuple2":["Bool","I32"]}}');
    const expectedMyTup3JSON = JSON.parse('{"bytes":"d5fdffff030000004142430300000058595a","cl_type":{"Tuple3":["I32","String","String"]}}');

    expect(
      CLValueParsers.fromJSON(expectedMyTup1JSON)
      .unwrap()
    ).to.be.deep.eq(myTup1);

    expect(
      CLValueParsers.fromJSON(expectedMyTup2JSON)
      .unwrap()
    ).to.be.deep.eq(myTup2);

    expect(
      CLValueParsers.fromJSON(expectedMyTup3JSON)
      .unwrap()
    ).to.be.deep.eq(myTup3);

    expect(myTup1JSON).to.be.deep.eq(expectedMyTup1JSON);
    expect(myTup2JSON).to.be.deep.eq(expectedMyTup2JSON);
    expect(myTup3JSON).to.be.deep.eq(expectedMyTup3JSON);

  });
});
