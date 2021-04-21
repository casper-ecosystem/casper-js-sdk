import { expect } from 'chai';
import { CLBool, CLBoolType, CLResult, CLU8, CLU8Type } from './index';
import { Ok, Err } from "ts-results";

const myTypes = { ok: new CLBoolType(), err: new CLU8Type() };
const myOkRes = new CLResult(Ok(new CLBool(true)), myTypes);
const myErrRes = new CLResult(Err(new CLU8(1)), myTypes);

describe('CLResult', () => {
  it('Should be valid by construction', () => {
    expect(myOkRes).to.be.an.instanceof(CLResult);
    expect(myErrRes).to.be.an.instanceof(CLResult);
  });

  it('clType() should return proper type', () => {
    expect(myOkRes.clType().toString()).to.be.eq('Result');
  });

  it('toBytes() should return proper byte array', () => {
    expect(myOkRes.toBytes().unwrap()).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(myErrRes.toBytes().unwrap()).to.be.deep.eq(Uint8Array.from([0, 1]));
  });

  // TODO: Add from bytes

  // it('toJSON() / fromJSON()', () => {
  //   const myOkJson = myOkRes.toJSON().result.unwrap();
  //   const myOkFromJson = CLResult.fromJSON(myOkJson).result.unwrap();
  //   expect(myOkFromJson).to.be.deep.eq(myOkRes);
  // });

});
