import { expect } from 'chai';
import {
  CLValue,
  CLBool,
  CLBoolType,
  CLResult,
  CLResultType,
  CLU8,
  CLU8Type,
  CLListType,
  CLList,
  CLOptionType,
  CLOption
} from './index';
import { Ok, Err, Some } from 'ts-results';

const myTypes = { ok: new CLBoolType(), err: new CLU8Type() };
const myOkRes = new CLResult(Ok(new CLBool(true)), myTypes);
const myErrRes = new CLResult(Err(new CLU8(1)), myTypes);

const myTypesComplex = {
  ok: new CLListType(new CLListType(new CLU8Type())),
  err: new CLOptionType(new CLListType(new CLListType(new CLU8Type())))
};

const myOkComplexRes = new CLResult(Ok(
  new CLList([
    new CLList([ new CLU8(5), new CLU8(10), new CLU8(15) ])
  ])
), myTypesComplex);

const myErrComplexRes = new CLResult(Err(
  new CLOption(
    Some(
      new CLList([
        new CLList([ new CLU8(5), new CLU8(10), new CLU8(15) ])
      ])
    )
  )
), myTypesComplex);

describe('CLResult', () => {
  it('Should be valid by construction', () => {
    expect(myOkRes).to.be.an.instanceof(CLResult);
    expect(myErrRes).to.be.an.instanceof(CLResult);
  });

  it('clType() should return proper type', () => {
    expect(myOkRes.clType().toString()).to.be.eq('Result');
  });

  it('toBytes() / fromBytes()', () => {
    const okBytes = myOkRes.toBytes().unwrap();
    const errBytes = myErrRes.toBytes().unwrap();
    expect(okBytes).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(errBytes).to.be.deep.eq(Uint8Array.from([0, 1]));

    const okFromBytes = CLResult.fromBytes(
      okBytes,
      new CLResultType(myTypes)
    ).unwrap();
    const errFromBytes = CLResult.fromBytes(
      errBytes,
      new CLResultType(myTypes)
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkRes);
    expect(errFromBytes).to.be.deep.eq(myErrRes);
  });

  it('toJSON() / fromJSON()', () => {
    const myOkJson = myOkRes.toJSON().unwrap();
    const expectedOkJson = JSON.parse(
      '{"bytes":"0101","cl_type":{"Result":{"ok":"Bool","err":"U8"}}}'
    );

    const myOkFromJson = CLResult.fromJSON(expectedOkJson).unwrap();

    expect(myOkJson).to.be.deep.eq(expectedOkJson);
    expect(myOkFromJson).to.be.deep.eq(myOkRes);
  });

  it('toJSON() / fromJSON()', () => {
    const myOkJson = myOkRes.toJSON().unwrap();
    const expectedOkJson = JSON.parse(
      '{"bytes":"0101","cl_type":{"Result":{"ok":"Bool","err":"U8"}}}'
    );

    const myOkFromJson = CLResult.fromJSON(expectedOkJson).unwrap();

    expect(myOkJson).to.be.deep.eq(expectedOkJson);
    expect(myOkFromJson).to.be.deep.eq(myOkRes);
  });

  it('toBytesWithCLType() / fromBytesWithCLType()', () => {
    const okResBytesWithCLType = myOkRes.toBytesWithCLType().unwrap();
    const okFromBytes = CLValue.fromBytesWithCLType(
      okResBytesWithCLType
    ).unwrap();

    const errResBytesWithCLType = myErrRes.toBytesWithCLType().unwrap();
    const errFromBytes = CLValue.fromBytesWithCLType(
      errResBytesWithCLType
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkRes);
    expect(errFromBytes).to.be.deep.eq(myErrRes);
  });

  // TODO: Maybe have another file with more "integration" tests of CLValue
  it('Complex examples toBytesWithCLType() / fromBytesWithCLType()', () => {
    const okResBytesWithCLType = myOkComplexRes.toBytesWithCLType().unwrap();
    const okFromBytes = CLValue.fromBytesWithCLType(
      okResBytesWithCLType
    ).unwrap();

    const errResBytesWithCLType = myOkComplexRes.toBytesWithCLType().unwrap();
    const errFromBytes = CLValue.fromBytesWithCLType(
      errResBytesWithCLType
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkComplexRes);
    expect(errFromBytes).to.be.deep.eq(myErrComplexRes);
  });
});
