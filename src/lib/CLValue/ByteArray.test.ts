import { expect } from 'chai';
import { CLByteArray, CLByteArrayType, CLValueParsers } from './index';

describe('CLByteArray', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myHash = new CLByteArray(arr8);

    expect(myHash.value()).to.be.deep.eq(arr8);
  });

  it('Should be able to return proper value by calling .clType()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myHash = new CLByteArray(arr8);

    expect(myHash.clType().toString()).to.be.eq('ByteArray');
  });

  it('Should be able to return proper byte array by calling toBytes() / fromBytes()', () => {
    const expectedBytes = Uint8Array.from(Array(32).fill(42));
    const hash = new CLByteArray(expectedBytes);
    const bytes = CLValueParsers.toBytes(hash).unwrap();

    expect(bytes).to.deep.eq(expectedBytes);
    expect(
      CLValueParsers.fromBytes(bytes, new CLByteArrayType(32)).unwrap()
    ).to.deep.eq(hash);
  });

  it('toJson() / fromJson()', () => {
    const bytes = Uint8Array.from(Array(32).fill(42));
    const hash = new CLByteArray(bytes);
    const json = CLValueParsers.toJSON(hash).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a","cl_type":{"ByteArray":32}}'
    );

    expect(json).to.deep.eq(expectedJson);
    expect(CLValueParsers.fromJSON(expectedJson).unwrap()).to.deep.eq(hash);
  });

  it('fromJSON() with length more than 32 bytes', () => {
    const json = {
      bytes:
        '7f8d377b97dc7fbf3a777f5ae75eb6edbe79739df9d747f86bbf3b7f7efcd37d7a7b475c7fcefb6f8d3cd7dedcf1a6bd',
      cl_type: { ByteArray: 48 }
    };

    const parsed = CLValueParsers.fromJSON(json).unwrap();

    expect(CLValueParsers.toJSON(parsed).unwrap()).to.deep.eq(json);
  });
});
