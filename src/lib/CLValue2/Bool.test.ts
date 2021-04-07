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

    const {result: fromBytesRes1} = CLBool.fromBytes(myBoolBytes);
    const {result: fromBytesRes2} = CLBool.fromBytes(myBool2Bytes);

    expect(myBoolBytes).to.be.deep.eq(Uint8Array.from([0]));
    expect(myBool2Bytes).to.be.deep.eq(Uint8Array.from([1]));

    expect(fromBytesRes1.val).to.be.deep.eq(myBool);
    expect(fromBytesRes1.ok).to.be.eq(true);
    expect(fromBytesRes2.val).to.be.deep.eq(myBool2);
    expect(fromBytesRes2.ok).to.be.eq(true);
    expect(CLBool.fromBytes(Uint8Array.from([9, 1])).result.ok).to.be.eq(false);
    expect(CLBool.fromBytes(Uint8Array.from([9, 1])).result.val).to.be.eq(CLErrorCodes.Formatting);
    expect(CLBool.fromBytes(Uint8Array.from([])).result.ok).to.be.eq(false);
    expect(CLBool.fromBytes(Uint8Array.from([])).result.val).to.be.eq(CLErrorCodes.EarlyEndOfStream);
  });
});
