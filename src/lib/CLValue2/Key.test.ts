import { expect } from 'chai';
import { CLKey, CLURef, AccessRights, CLAccountHash } from './index'; // CLURef, CLAccountHash } from './index';
import { decodeBase16 } from '../../index';

describe('CLKey', () => {
  const urefAddr =
    '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';

  it('Create with (Uint8Array) and test .value() / isHash()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myKey = new CLKey(arr8);

    expect(myKey.value()).to.be.deep.eq(arr8);
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

  it('toBytes() with Uint8Array', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
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
    const myKey = new CLKey(arr8);
    expect(myKey.toBytes().unwrap()).to.be.deep.eq(expectedBytes);
  });

  it('toBytes() with CLAccountHash', () => {
    const hash = new CLAccountHash(Uint8Array.from(Array(32).fill(42)));
    const expectedBytes = Uint8Array.from([
      0,
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
    const myKey = new CLKey(hash);
    const bytes = myKey.toBytes().unwrap();
    expect(bytes).to.be.deep.eq(expectedBytes);
  });


  // it('toJSON() / fromJSON() with CLAccountHash', () => {
  //   const hash = new CLAccountHash(Uint8Array.from(Array(32).fill(42)));
  //   const myKey = new CLKey(hash);
  //   const json = myKey.toJSON();
  //   // @ts-ignore
  //   const fromJson = CLKey.fromJSON(json.result.val);
    
  //   expect(fromJson.result.val).to.be.deep.eq(myKey);
  // });

  it('toBytes() with CLURef', () => {
    const urefAddr =
      '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
    const truth = decodeBase16(
      '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
    );
    const uref = new CLURef(decodeBase16(urefAddr), AccessRights.READ_ADD_WRITE);
    const myKey = new CLKey(uref);
    const bytes = myKey.toBytes().unwrap();
    expect(bytes).to.deep.eq(truth);
    expect(CLKey.fromBytes(bytes).unwrap()).deep.eq(myKey);
  });

  // it('toJSON() / fromJSON() with CLUref', () => {
  //   const urefAddr =
  //     '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
  //   const uref = new CLURef(decodeBase16(urefAddr), AccessRights.READ_ADD_WRITE);
  //   const myKey= new CLKey(uref);
  //   const json = myKey.toJSON();
  //   // @ts-ignore
  //   const fromJson = CLKey.fromJSON(json.result.val);
    
  //   expect(fromJson.result.val).to.be.deep.eq(myKey);
  // });

  it('toBytes() with invalid data', () => {
    // @ts-ignore
    const badFn = () => new CLKey([1, 2, 3]).toBytes();
    expect(badFn).to.throw('Unknown byte types');
  });

  it('Should be able to return proper value by calling .clType()', () => {
    const arr8 = new Uint8Array([21,31]);
    const myKey = new CLKey(arr8);

    expect(myKey.clType().toString()).to.be.eq("Key");
  });
});
