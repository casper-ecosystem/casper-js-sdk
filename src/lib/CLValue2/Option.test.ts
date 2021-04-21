import { expect } from 'chai';
import { CLBool, CLOption, CLBoolType, CLOptionType } from './index';
import { Some, None } from 'ts-results';

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
    const optionFromBytes = CLOption.fromBytes(
      Uint8Array.from([1, 1]),
      new CLOptionType(new CLBoolType())
    );
    expect(mySomeOpt.toBytes().unwrap()).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(optionFromBytes.unwrap()).to.be.deep.eq(mySomeOpt);
    expect(myNoneOpt.toBytes().unwrap()).to.be.deep.eq(Uint8Array.from([0]));
  });

  it('toBytes() should return proper byte array', () => {
    const jsonSome = mySomeOpt.toJSON().unwrap();
    const jsonNone = myNoneOpt.toJSON().unwrap();

    const expectedJsonSome = JSON.parse(
      '{"bytes":"0101","cl_type":{"Option":"Bool"}}'
    );
    const expectedJsonNone = JSON.parse(
      '{"bytes":"00","cl_type":{"Option":"Bool"}}'
    );

    expect(jsonSome).to.be.deep.eq(expectedJsonSome);
    expect(jsonNone).to.be.deep.eq(expectedJsonNone);

    expect(CLOption.fromJSON(expectedJsonSome).unwrap()).to.be.deep.eq(mySomeOpt);
    expect(CLOption.fromJSON(expectedJsonNone).unwrap()).to.be.deep.eq(myNoneOpt);
  });
});
