import { expect } from 'chai';
import {
  CLValueParsers,
  CLKey,
  CLKeyType,
  CLURef,
  AccessRights,
  CLAccountHash,
  CLByteArray
} from './index'; // CLURef, CLAccountHash } from './index';
import { decodeBase16 } from '../../index';

describe('CLKey', () => {
  const urefAddr =
    '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';

  it('Create with (CLByteArray) and test .value() / isHash()', () => {
    const byteArr = new CLByteArray(new Uint8Array([21, 31]));
    const myKey = new CLKey(byteArr);

    expect(myKey.value()).to.be.deep.eq(byteArr);
    expect(myKey.isHash()).to.be.eq(true);
  });

  it('Create with (CLUref) and test .value() / isURef()', () => {
    const uref = new CLURef(
      decodeBase16(urefAddr),
      AccessRights.READ_ADD_WRITE
    );
    const myKey = new CLKey(uref);
    expect(myKey.value()).to.deep.eq(uref);
    expect(myKey.isURef()).to.be.eq(true);
  });

  it('Create with (CLAccountHash) and test .value() isAccount()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myHash = new CLAccountHash(arr8);
    const myKey = new CLKey(myHash);
    expect(myKey.value()).to.deep.eq(myHash);
    expect(myKey.isAccount()).to.be.eq(true);
  });

  it('toBytes() / fromBytes() with CLByteArray', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
    const byteArr = new CLByteArray(arr8);
    const expectedBytes = Uint8Array.from([
      1,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42,
      42
    ]);
    const myKey = new CLKey(byteArr);
    const bytes = CLValueParsers.toBytes(myKey).unwrap();
    const fromExpectedBytes = CLValueParsers.fromBytes(
      bytes,
      new CLKeyType()
    ).unwrap();
    expect(bytes).to.be.deep.eq(expectedBytes);
    expect(fromExpectedBytes).to.be.deep.eq(myKey);
  });

  it('toBytes() / fromBytes() with CLAccountHash', () => {
    const hash = new CLAccountHash(Uint8Array.from(Array(32).fill(42)));
    const expectedBytes = Uint8Array.from([0, ...Array(32).fill(42)]);
    const myKey = new CLKey(hash);
    const bytes = CLValueParsers.toBytes(myKey).unwrap();
    const fromExpectedBytes = CLValueParsers.fromBytes(
      bytes,
      new CLKeyType()
    ).unwrap();
    expect(bytes).to.be.deep.eq(expectedBytes);
    expect(fromExpectedBytes).to.be.deep.eq(myKey);
  });

  it('toJSON() / fromJSON() with CLByteArray', () => {
    const byteArr = new CLByteArray(new Uint8Array([21, 31]));
    const myKey = new CLKey(byteArr);
    const json = CLValueParsers.toJSON(myKey).unwrap();
    const expectedJson = JSON.parse('{"bytes":"01151f","cl_type":"Key"}');

    const fromJson = CLValueParsers.fromJSON(expectedJson).unwrap();

    expect(json).to.be.deep.eq(expectedJson);
    expect(fromJson).to.be.deep.eq(myKey);
  });

  it('toJSON() / fromJSON() with CLAccountHash', () => {
    const hash = new CLAccountHash(Uint8Array.from(Array(32).fill(42)));
    const myKey = new CLKey(hash);
    const json = CLValueParsers.toJSON(myKey).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"002a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a","cl_type":"Key"}'
    );

    const fromJson = CLValueParsers.fromJSON(expectedJson).unwrap();

    expect(json).to.be.deep.eq(expectedJson);
    expect(fromJson).to.be.deep.eq(myKey);
  });

  it('toBytes() / fromBytes() with CLURef', () => {
    const urefAddr =
      '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
    const truth = decodeBase16(
      '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
    );
    const uref = new CLURef(
      decodeBase16(urefAddr),
      AccessRights.READ_ADD_WRITE
    );
    const myKey = new CLKey(uref);
    const bytes = CLValueParsers.toBytes(myKey).unwrap();
    const fromExpectedBytes = CLValueParsers.fromBytes(
      bytes,
      new CLKeyType()
    ).unwrap();
    expect(bytes).to.deep.eq(truth);
    expect(fromExpectedBytes).deep.eq(myKey);
  });

  it('toJSON() / fromJSON() with CLUref', () => {
    const urefAddr =
      '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
    const uref = new CLURef(
      decodeBase16(urefAddr),
      AccessRights.READ_ADD_WRITE
    );
    const myKey = new CLKey(uref);
    const json = CLValueParsers.toJSON(myKey).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07","cl_type":"Key"}'
    );

    const fromJson = CLValueParsers.fromJSON(expectedJson).unwrap();

    expect(fromJson).to.be.deep.eq(myKey);
    expect(json).to.be.deep.eq(expectedJson);
  });

  it('toBytes() with invalid data', () => {
    // @ts-ignore
    const badFn = () => CLValueParsers.toBytes(new CLKey([1, 2, 3]));
    expect(badFn).to.throw('Unknown byte types');
  });

  it('Should be able to return proper value by calling .clType()', () => {
    const arr8 = new CLByteArray(new Uint8Array([21, 31]));
    const myKey = new CLKey(arr8);

    expect(myKey.clType().toString()).to.be.eq('Key');
  });
});
