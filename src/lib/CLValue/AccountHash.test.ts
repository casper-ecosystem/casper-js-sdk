import { expect } from 'chai';
import { CLAccountHash } from './AccountHash';

describe('CLAccountHash', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = new Uint8Array([21, 31]);
    const myHash = new CLAccountHash(arr8);

    expect(myHash.value()).to.be.deep.eq(arr8);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const expectedBytes = Uint8Array.from(Array(32).fill(42));
    const hash = new CLAccountHash(expectedBytes);
    const fromBytes = CLAccountHash.fromBytesWithRemainder(
      expectedBytes
    ).result.unwrap();

    expect(hash.toBytes().unwrap()).to.deep.eq(expectedBytes);
    expect(fromBytes).to.deep.eq(hash);
  });
});
