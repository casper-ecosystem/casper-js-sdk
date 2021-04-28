import { expect } from 'chai';
import { CLBool, CLBoolType, CLResult, CLResultType, CLU8, CLU8Type } from './index';
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

  it('toBytes() / fromBytes()', () => {
    const okBytes = myOkRes.toBytes().unwrap()
    const errBytes = myErrRes.toBytes().unwrap();
    expect(okBytes).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(errBytes).to.be.deep.eq(Uint8Array.from([0, 1]));

    const okFromBytes = CLResult.fromBytes(okBytes, new CLResultType(myTypes)).unwrap();
    const errFromBytes = CLResult.fromBytes(errBytes, new CLResultType(myTypes)).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkRes);
    expect(errFromBytes).to.be.deep.eq(myErrRes);
  });

  it('toJSON() / fromJSON()', () => {
    const myOkJson = myOkRes.toJSON().unwrap();
    const expectedOkJson = JSON.parse('{"bytes":"0101","cl_type":{"Result":{"ok":"Bool","err":"U8"}}}');

    const myOkFromJson = CLResult.fromJSON(expectedOkJson).unwrap();

    expect(myOkJson).to.be.deep.eq(expectedOkJson);
    expect(myOkFromJson).to.be.deep.eq(myOkRes);
  });
});
