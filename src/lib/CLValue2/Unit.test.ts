import { expect } from 'chai';
import { Unit } from './Unit';

describe('Unit implementation tests', () => {
  it('Unit value() should return proper value', () => {
    const unit = new Unit();
    expect(unit.value()).to.be.deep.eq([]);
  });

  it('Unit clType() should return proper type', () => {
    const unit = new Unit();
    expect(unit.clType().toString()).to.be.eq("Unit");
  });
});

