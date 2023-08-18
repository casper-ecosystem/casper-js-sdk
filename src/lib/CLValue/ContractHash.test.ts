import { expect } from 'chai';

import { CLValueParsers } from './Abstract';
import { CLContractHash, CLContractHashType } from './ContractHash';

describe('CLAccountHash', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
    const myHash = new CLContractHash(arr8);

    expect(myHash.value()).to.be.deep.eq(arr8);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const expectedBytes = Uint8Array.from(Array(32).fill(42));
    const expectedHash = new CLContractHash(expectedBytes);

    const bytes = CLValueParsers.toBytes(expectedHash).unwrap();
    const hash = CLValueParsers.fromBytes(
      bytes,
      new CLContractHashType()
    ).unwrap();

    expect(bytes).to.deep.eq(expectedBytes);
    expect(hash).to.deep.eq(expectedHash);
  });

  it('should throw error when invalid bytearray is provided', () => {
    const arr8 = Uint8Array.from(Array(31).fill(42));
    const badFn = () => new CLContractHash(arr8);

    expect(badFn).throw('Invalid length');
  });

  it('fromFormattedString / toFormattedString', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
    const myHash = new CLContractHash(arr8);
    const formattedContractHash = myHash.toFormattedString();
    expect(formattedContractHash).to.eq(
      'contract-2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
    );

    const myHashFromString = CLContractHash.fromFormattedString(
      formattedContractHash
    );
    expect(myHash.data).deep.eq(myHashFromString.data);
  });

  it('should throw error when invalid formatted string is provided', () => {
    const badFn = () =>
      CLContractHash.fromFormattedString(
        'contrac-2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
      );
    expect(badFn).throw('Invalid Format');
  });
});
