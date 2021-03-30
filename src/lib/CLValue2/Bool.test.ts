import { expect } from 'chai';
import { CLBool, CLErrorCodes } from './index';

describe('CLBool', () => {
  it('Bool should return proper clType', () => {
    const myBool = new CLBool(false);
    const clType = myBool.clType();
    expect(clType.toString()).to.be.eq("Bool");
  });

  it('Should be able to return proper value by calling .value()', () => {
    const myBool = new CLBool(false);
    const myBool2 = new CLBool(true);

    expect(myBool.value()).to.be.eq(false);
    expect(myBool2.value()).to.be.eq(true);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const myBool = new CLBool(false);
    const myBool2 = new CLBool(true);
    const myBoolBytes = myBool.toBytes();
    const myBool2Bytes = myBool2.toBytes();

    expect(myBoolBytes).to.be.deep.eq(Uint8Array.from([0]));
    expect(myBool2Bytes).to.be.deep.eq(Uint8Array.from([1]));

    expect(CLBool.fromBytes(myBoolBytes).value().val).to.be.deep.eq(myBool);
    expect(CLBool.fromBytes(myBoolBytes).isOk()).to.be.eq(true);
    expect(CLBool.fromBytes(myBool2Bytes).value().val).to.be.deep.eq(myBool2);
    expect(CLBool.fromBytes(myBool2Bytes).isOk()).to.be.eq(true);
    expect(CLBool.fromBytes(Uint8Array.from([9, 1])).isError()).to.be.eq(true);
    expect(CLBool.fromBytes(Uint8Array.from([9, 1])).value().val).to.be.eq(CLErrorCodes.Formatting);
    expect(CLBool.fromBytes(Uint8Array.from([])).isError()).to.be.eq(true);
    expect(CLBool.fromBytes(Uint8Array.from([])).value().val).to.be.eq(CLErrorCodes.EarlyEndOfStream);
  });
});
