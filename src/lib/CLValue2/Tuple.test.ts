import { expect } from 'chai';
import { CLTuple1, CLTuple2 } from './Tuple';
import { CLBool } from './Bool';
import { CLString } from './String';

describe('CLTuple', () => {
  it('Tuple2 should return proper clType', () => {
    const myBool = new CLBool(false);
    const myStr = new CLString("ABC");
    const myTup = new CLTuple2([myBool, myStr]);

    expect(myTup.clType().toString()).to.be.eq("Tuple2 (Bool, String)");
  });

  it('Should be able to create tuple with proper values - correct by construction', () => {
    const myTup2 = new CLTuple2([new CLBool(true), new CLBool(false)]);

    expect(myTup2).to.be.an.instanceof(CLTuple2);
  });

  it('Should throw an error when tuple is not correct by construction', () => {
    const badFn = () => new CLTuple1([new CLBool(true), new CLBool(false)]);

    expect(badFn).to.throw("Too many elements!");
  });

  it('Should throw an error when list is not correct by construction', () => {
    const badFn = () => new CLTuple2(["a", 2]);

    expect(badFn).to.throw("Invalid data type(s) provided.");
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

    expect(badFn).to.throw("Tuple index out of bounds.");
  });
});

