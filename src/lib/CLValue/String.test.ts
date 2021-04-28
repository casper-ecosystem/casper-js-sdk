import { expect } from 'chai';
import { CLValueParsers, CLString, CLStringType } from './index';

describe('CLString', () => {
  it('CLString value() should return proper value', () => {
    const str = new CLString('ABC');
    expect(str.value()).to.be.eq('ABC');
  });

  it('CLString clType() should return proper type', () => {
    const str = new CLString('ABC');
    expect(str.clType().toString()).to.be.eq('String');
  });

  it('CLString size() should return proper string length', () => {
    const str = new CLString('ABC');
    expect(str.size()).to.be.eq(3);
  });

  it('CLString should throw an error on invalid data provided to constructor', () => {
    // @ts-ignore
    const badFn = () => new CLString(123);

    expect(badFn).to.throw(
      'Wrong data type, you should provide string, but you provided number'
    );
  });

  it('toBytes() / fromBytes()', () => {
    const str = new CLString('ABC');
    const bytes = CLValueParsers.toBytes(str).unwrap();
    const result = CLValueParsers.fromBytes(bytes, new CLStringType()).unwrap();
    expect(result).to.be.deep.eq(str);
  });

  it('toJSON() / fromJSON()', () => {
    const str = new CLString('ABC-DEF');
    const json = CLValueParsers.toJSON(str).unwrap();
    const fromJSON = CLValueParsers.fromJSON(json).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"070000004142432d444546","cl_type":"String"}'
    );

    expect(json).to.be.deep.eq(expectedJson);
    expect(fromJSON).to.be.deep.eq(str);
  });
});
