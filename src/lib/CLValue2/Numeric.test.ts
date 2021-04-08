import { expect } from 'chai';
import { CLI32, CLU128 } from './Numeric';

describe('Numeric implementation tests', () => {
  it('Numeric value() should return proper value', () => {
    const num = new CLI32(10);
    expect(num.value().toNumber()).to.be.eq(10);
  });

  it('Numeric clType() should return proper type', () => {
    const num = new CLU128(20000);
    expect(num.clType().toString()).to.be.eq("U128");
  });

  it('Unsigned Numeric cant accept negative numbers in constructor', () => {
    const badFn = () => new CLU128("-100");

    expect(badFn).to.throw("Can't provide negative numbers with isSigned=false");
  });

  it('Should do proper toBytes()/fromBytes()', () => {
    const num1 = new CLI32(-10);
    const num1bytes = num1.toBytes();

    expect(CLI32.fromBytes(num1bytes).result.ok).to.be.eq(true);
    expect(CLI32.fromBytes(num1bytes).result.val).to.be.deep.eq(num1);
  });
});
