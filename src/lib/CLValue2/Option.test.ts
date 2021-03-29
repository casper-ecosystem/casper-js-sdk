import { expect } from 'chai';
import { CLBool, CLOption } from './index';
import { Some, None } from "ts-results";

const mySomeOpt = new CLOption(Some(new CLBool(true)));
const myNoneOpt = new CLOption(None);

describe('CLOption', () => {
  it('Should be valid by construction', () => {
    expect(mySomeOpt).to.be.an.instanceof(CLOption);
    expect(myNoneOpt).to.be.an.instanceof(CLOption);
  });

  it('clType() should return proper type', () => {
    expect(mySomeOpt.clType().toString()).to.be.eq('Option');
  });

  it('toBytes() should return proper byte array', () => {
    expect(mySomeOpt.toBytes()).to.be.deep.eq(Uint8Array.from([1, 1]));
    expect(myNoneOpt.toBytes()).to.be.deep.eq(Uint8Array.from([0]));
  });
});

