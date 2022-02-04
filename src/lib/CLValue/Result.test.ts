import { expect } from 'chai';
import {
  CLValueParsers,
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

const myOkComplexRes = new CLResult(
  Ok(new CLList([new CLList([new CLU8(5), new CLU8(10), new CLU8(15)])])),
  myTypesComplex
);

const myErrComplexRes = new CLResult(
  Err(
    new CLOption(
      Some(new CLList([new CLList([new CLU8(5), new CLU8(10), new CLU8(15)])]))
    )
  ),
  myTypesComplex
);

describe('CLResult', () => {
  it('Should be valid by construction', () => {
    expect(myOkRes).to.be.an.instanceof(CLResult);
    expect(myErrRes).to.be.an.instanceof(CLResult);
  });

  it('clType() should return proper type', () => {
    expect(myOkRes.clType().toString()).to.be.eq(
      'Result (OK: Bool, ERR: Bool)'
    );
  });

  it('toBytes() / fromBytes()', () => {
    const okBytes = CLValueParsers.toBytes(myOkRes).unwrap();
    const errBytes = CLValueParsers.toBytes(myErrRes).unwrap();
    expect(okBytes).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(errBytes).to.be.deep.eq(Uint8Array.from([0, 1]));

    const okFromBytes = CLValueParsers.fromBytes(
      okBytes,
      new CLResultType(myTypes)
    ).unwrap();
    const errFromBytes = CLValueParsers.fromBytes(
      errBytes,
      new CLResultType(myTypes)
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkRes);
    expect(errFromBytes).to.be.deep.eq(myErrRes);
  });

  it('toJSON() / fromJSON() on Ok', () => {
    const myOkJson = CLValueParsers.toJSON(myOkRes).unwrap();
    const expectedOkJson = JSON.parse(
      '{"bytes":"0101","cl_type":{"Result":{"ok":"Bool","err":"U8"}}}'
    );

    const myOkFromJson = CLValueParsers.fromJSON(expectedOkJson).unwrap();

    expect(myOkJson).to.be.deep.eq(expectedOkJson);
    expect(myOkFromJson).to.be.deep.eq(myOkRes);
  });

  it('toJSON() / fromJSON() on Err', () => {
    const myErrJson = CLValueParsers.toJSON(myErrRes).unwrap();
    const expectedErrJson = JSON.parse(
      '{"bytes":"0001","cl_type":{"Result":{"ok":"Bool","err":"U8"}}}'
    );

    const myErrFromJson = CLValueParsers.fromJSON(expectedErrJson).unwrap();

    expect(myErrJson).to.be.deep.eq(expectedErrJson);
    expect(myErrFromJson).to.be.deep.eq(myErrRes);
  });

  it('toBytesWithType() / fromBytesWithType()', () => {
    const okResBytesWithCLType = CLValueParsers.toBytesWithType(
      myOkRes
    ).unwrap();
    const okFromBytes = CLValueParsers.fromBytesWithType(
      okResBytesWithCLType
    ).unwrap();

    const errResBytesWithCLType = CLValueParsers.toBytesWithType(
      myErrRes
    ).unwrap();
    const errFromBytes = CLValueParsers.fromBytesWithType(
      errResBytesWithCLType
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkRes);
    expect(errFromBytes).to.be.deep.eq(myErrRes);
  });

  it('Complex examples toBytesWithCLType() / fromBytesWithCLType()', () => {
    const okResBytesWithCLType = CLValueParsers.toBytesWithType(
      myOkComplexRes
    ).unwrap();
    const okFromBytes = CLValueParsers.fromBytesWithType(
      okResBytesWithCLType
    ).unwrap();

    const errResBytesWithCLType = CLValueParsers.toBytesWithType(
      myErrComplexRes
    ).unwrap();
    const errFromBytes = CLValueParsers.fromBytesWithType(
      errResBytesWithCLType
    ).unwrap();

    expect(okFromBytes).to.be.deep.eq(myOkComplexRes);
    expect(errFromBytes).to.be.deep.eq(myErrComplexRes);
  });
});
