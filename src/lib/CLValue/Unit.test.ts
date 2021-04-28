import { expect } from 'chai';
import { CLValueParsers, CLUnit } from './index';

describe('Unit implementation tests', () => {
  it('Unit value() should return proper value', () => {
    const unit = new CLUnit();
    expect(unit.value()).to.be.deep.eq(undefined);
  });

  it('Unit clType() should return proper type', () => {
    const unit = new CLUnit();
    expect(unit.clType().toString()).to.be.eq('Unit');
  });

  it('fromJSON() / toJSON()', () => {
    const unit = new CLUnit();
    const json = CLValueParsers.toJSON(unit).unwrap();
    const expectedJson = JSON.parse('{"bytes":"","cl_type":"Unit"}');

    expect(json).to.be.deep.eq(expectedJson);
    expect(CLValueParsers.fromJSON(expectedJson).unwrap()).to.be.deep.eq(unit);
  });
});
