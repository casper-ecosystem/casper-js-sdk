import { expect } from 'chai';
import { CLValueUnit } from './Unit';
import { CLValueParser } from './Parser';
import { CLValue } from './CLValue';

describe('Unit implementation tests', () => {
  it('Unit value() should return proper value', () => {
    const unit = new CLValueUnit();
    expect(unit.getValue()).to.be.deep.eq(null);
  });

  it('fromJSON() / toJSON()', () => {
    const unit = CLValue.newCLUnit();
    const json = CLValueParser.toJSON(unit);
    const expectedJson = JSON.parse('{"bytes":"","cl_type":"Unit"}');

    expect(json).to.be.deep.eq(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.be.deep.eq(unit);
  });
});
