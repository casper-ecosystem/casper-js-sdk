import { expect } from 'chai';
import { CLBool, CLOption, CLBoolType, CLOptionType } from './index';
import { Some, None } from "ts-results";

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

  it('toBytes() should return proper byte array', () => {
    const x = CLOption.fromBytes(Uint8Array.from([1, 1]), new CLOptionType(new CLBoolType()));
    expect(mySomeOpt.toBytes()).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(x.result.val).to.be.deep.eq(mySomeOpt);
    expect(myNoneOpt.toBytes()).to.be.deep.eq(Uint8Array.from([0]));
  });

  it('toBytes() should return proper byte array', () => {
    const jsonSome = mySomeOpt.toJSON();
    const jsonNone = myNoneOpt.toJSON();

    // @ts-ignore
    expect(CLOption.fromJSON(jsonSome.result.val).result.val).to.be.deep.eq(mySomeOpt);
    // @ts-ignore
    expect(CLOption.fromJSON(jsonNone.result.val).result.val).to.be.deep.eq(myNoneOpt);
  });
});

