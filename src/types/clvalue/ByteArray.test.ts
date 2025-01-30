import { expect } from 'chai';
import { CLValueByteArray } from './ByteArray';
import { CLValueParser } from './Parser';
import { CLTypeByteArray } from './cltype';
import { CLValue } from './CLValue';

describe('CLByteArray', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myHash = new CLValueByteArray(arr8);

    expect(myHash.bytes()).to.be.deep.eq(arr8);
  });

  it('Should be able to return proper byte array by calling toBytes() / fromBytes()', () => {
    const expectedBytes = Uint8Array.from(Array(32).fill(42));
    const hash = CLValue.newCLByteArray(expectedBytes);
    const bytes = hash.bytes();

    expect(bytes).to.deep.eq(expectedBytes);
    expect(
      CLValueParser.fromBytesByType(bytes, new CLTypeByteArray(32)).result
    ).to.deep.eq(hash);
  });

  it('toJson() / fromJson()', () => {
    const bytes = Uint8Array.from(Array(32).fill(42));
    const hash = CLValue.newCLByteArray(bytes);
    const json = CLValueParser.toJSON(hash);
    const expectedJson = JSON.parse(
      '{"bytes":"2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a","cl_type":{"ByteArray":32}}'
    );

    expect(json).to.deep.eq(expectedJson);
    expect(CLValueParser.fromJSON(expectedJson)).to.deep.eq(hash);
  });

  it('fromJSON() with length more than 32 bytes', () => {
    const json = {
      bytes:
        '7f8d377b97dc7fbf3a777f5ae75eb6edbe79739df9d747f86bbf3b7f7efcd37d7a7b475c7fcefb6f8d3cd7dedcf1a6bd',
      cl_type: { ByteArray: 48 }
    };

    const parsed = CLValueParser.fromJSON(json);

    expect(CLValueParser.toJSON(parsed)).to.deep.eq(json);
  });
});
