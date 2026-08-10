import { expect } from 'vitest';
import { CLValueString, CLValueParser, CLValue } from '../../../types';

describe('CLString', () => {
  it('CLString value() should return proper value', () => {
    const str = new CLValueString('ABC');
    expect(str.toString()).to.be.eq('ABC');
  });

  it('toBytes() / fromBytes()', () => {
    const str = CLValue.newCLString('ABC');
    const bytes = str.bytes();
    const parsed = CLValueParser.fromBytesByType(bytes, str.type);
    expect(parsed.result).to.be.deep.eq(str);
  });

  it('toJSON() / fromJSON()', () => {
    const str = CLValue.newCLString('ABC-DEF');
    const json = CLValueParser.toJSON(str);
    const fromJSON = CLValueParser.fromJSON(json);
    const expectedJson = JSON.parse(
      '{"bytes":"070000004142432d444546","cl_type":"String"}'
    );

    expect(json).to.be.deep.eq(expectedJson);
    expect(fromJSON).to.be.deep.eq(str);
  });
});
