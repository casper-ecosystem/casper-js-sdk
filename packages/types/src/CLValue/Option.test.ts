import { expect } from 'chai';
import { None, Some } from 'ts-results';

import {
  CLBool,
  CLBoolType,
  CLOption,
  CLOptionType,
  CLValueParsers
} from './index';

const mySomeOpt = new CLOption(Some(new CLBool(true)));
const myNoneOpt = new CLOption(None, new CLBoolType());

describe('CLOption', () => {
  it('Should be valid by construction', () => {
    expect(mySomeOpt).to.be.an.instanceof(CLOption);
    expect(myNoneOpt).to.be.an.instanceof(CLOption);
  });

  it('clType() should return proper type', () => {
    expect(mySomeOpt.clType().toString()).to.be.eq('Option (Bool)');
  });

  it('toBytes() / fromBytes()', () => {
    const myType = new CLOptionType(new CLBoolType());
    const optionFromBytes = CLValueParsers.fromBytes(
      Uint8Array.from([1, 1]),
      myType
    );
    expect(CLValueParsers.toBytes(mySomeOpt).unwrap()).to.be.deep.eq(
      Uint8Array.from([1, 1])
    );
    expect(optionFromBytes.unwrap()).to.be.deep.eq(mySomeOpt);
    expect(CLValueParsers.toBytes(myNoneOpt).unwrap()).to.be.deep.eq(
      Uint8Array.from([0])
    );
  });

  it('fromJSON() / toJSON()', () => {
    const jsonSome = CLValueParsers.toJSON(mySomeOpt).unwrap();
    const jsonNone = CLValueParsers.toJSON(myNoneOpt).unwrap();

    const expectedJsonSome = JSON.parse(
      '{"bytes":"0101","cl_type":{"Option":"Bool"}}'
    );
    const expectedJsonNone = JSON.parse(
      '{"bytes":"00","cl_type":{"Option":"Bool"}}'
    );

    expect(jsonSome).to.be.deep.eq(expectedJsonSome);
    expect(jsonNone).to.be.deep.eq(expectedJsonNone);

    expect(CLValueParsers.fromJSON(expectedJsonSome).unwrap()).to.be.deep.eq(
      mySomeOpt
    );
    expect(CLValueParsers.fromJSON(expectedJsonNone).unwrap()).to.be.deep.eq(
      myNoneOpt
    );
  });
});
