import { expect } from 'chai';
import { CLString } from './String';

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
    const bytes = str.toBytes().unwrap();
    const result = CLString.fromBytes(bytes).unwrap();
    expect(result).to.be.deep.eq(str);
  });

  it('toJSON() / fromJSON()', () => {
    const str = new CLString("ABC-DEF");
    const json = str.toJSON().unwrap();
    const expectedJson = JSON.parse('{"bytes":"070000004142432d444546","cl_type":"String"}');

    expect(json).to.be.deep.eq(expectedJson)
    expect(CLString.fromJSON(expectedJson).unwrap()).to.be.deep.eq(str)
  });

});
