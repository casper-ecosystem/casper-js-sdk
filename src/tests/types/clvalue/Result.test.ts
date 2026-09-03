import { expect } from 'vitest';

import {
  CLValue,
  CLValueResult,
  CLValueParser,
  CLTypeResult,
  CLTypeString,
  CLTypeUInt32
} from '../../../types';
import { expectByteRoundTrip } from '../../roundtrip';

describe('CLValueResult', () => {
  it('Ok(U32) reports success and holds its inner value', () => {
    const inner = CLValue.newCLUInt32(42);
    const result = CLValue.newCLResult(CLTypeUInt32, CLTypeString, inner, true);

    expect(result.result).to.be.an.instanceof(CLValueResult);
    expect(result.result?.isSuccess).to.be.true;
    expect(result.result?.value()).to.deep.equal(inner);
    expect(result.type).to.be.an.instanceof(CLTypeResult);
    expect(result.toString()).to.equal('Ok(42)');
  });

  it('Err(String) reports failure and holds its inner value', () => {
    const inner = CLValue.newCLString('boom');
    const result = CLValue.newCLResult(
      CLTypeUInt32,
      CLTypeString,
      inner,
      false
    );

    expect(result.result?.isSuccess).to.be.false;
    expect(result.result?.value()).to.deep.equal(inner);
    expect(result.toString()).to.equal('Err(boom)');
  });

  it('throws when the inner value type does not match the declared Ok/Err type', () => {
    expect(() =>
      CLValue.newCLResult(
        CLTypeUInt32,
        CLTypeString,
        CLValue.newCLString('wrong type for Ok'),
        true
      )
    ).to.throw(/does not match the expected type/);
  });

  it('Ok(U32) round-trips through bytes', () => {
    expectByteRoundTrip(
      CLValue.newCLResult(
        CLTypeUInt32,
        CLTypeString,
        CLValue.newCLUInt32(7),
        true
      )
    );
  });

  it('Err(String) round-trips through bytes', () => {
    expectByteRoundTrip(
      CLValue.newCLResult(
        CLTypeUInt32,
        CLTypeString,
        CLValue.newCLString('nope'),
        false
      )
    );
  });

  it('Ok(U32) toJSON() / fromJSON()', () => {
    const result = CLValue.newCLResult(
      CLTypeUInt32,
      CLTypeString,
      CLValue.newCLUInt32(42),
      true
    );
    const json = CLValueParser.toJSON(result);
    const expectedJson = JSON.parse(
      '{"bytes":"012a000000","cl_type":{"Result":{"ok":"U32","err":"String"}}}'
    );

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(result);
  });

  it('Err(String) toJSON() / fromJSON()', () => {
    const result = CLValue.newCLResult(
      CLTypeUInt32,
      CLTypeString,
      CLValue.newCLString('bad'),
      false
    );
    const json = CLValueParser.toJSON(result);
    const expectedJson = JSON.parse(
      '{"bytes":"0003000000626164","cl_type":{"Result":{"ok":"U32","err":"String"}}}'
    );

    expect(json).to.deep.equal(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.equal(result);
  });
});
