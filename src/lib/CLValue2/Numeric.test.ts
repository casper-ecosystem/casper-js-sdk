import { expect } from 'chai';
import { I32, U128 } from './Numeric';

describe('Numeric implementation tests', () => {
  it('Numeric value() should return proper value', () => {
    const num = new I32(-10);
    expect(num.value().toNumber()).to.be.eq(-10);
  });

  it('Numeric clType() should return proper type', () => {
    const num = new U128(20000);
    expect(num.clType().toString()).to.be.eq("U128");
  });
});
