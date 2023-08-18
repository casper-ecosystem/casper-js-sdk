import { expect } from 'chai';

import { CLValueParsers } from './Abstract';
import {
  CLContractPackageHash,
  CLContractPackageHashType
} from './ContractPackageHash';

describe('CLAccountHash', () => {
  it('Should be able to return proper value by calling .value()', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
    const myHash = new CLContractPackageHash(arr8);

    expect(myHash.value()).to.be.deep.eq(arr8);
  });

  it('toBytes() / fromBytes() do proper bytes serialization', () => {
    const expectedBytes = Uint8Array.from(Array(32).fill(42));
    const expectedHash = new CLContractPackageHash(expectedBytes);

    const bytes = CLValueParsers.toBytes(expectedHash).unwrap();
    const hash = CLValueParsers.fromBytes(
      bytes,
      new CLContractPackageHashType()
    ).unwrap();

    expect(bytes).to.deep.eq(expectedBytes);
    expect(hash).to.deep.eq(expectedHash);
  });

  it('should throw error when invalid bytearray is provided', () => {
    const arr8 = Uint8Array.from(Array(31).fill(42));
    const badFn = () => new CLContractPackageHash(arr8);

    expect(badFn).throw('Invalid length');
  });

  it('fromFormattedString / toFormattedString', () => {
    const arr8 = Uint8Array.from(Array(32).fill(42));
    const myHash = new CLContractPackageHash(arr8);
    const formattedContractHash = myHash.toFormattedString();
    expect(formattedContractHash).to.eq(
      'contract-package-2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
    );

    const myHashFromString = CLContractPackageHash.fromFormattedString(
      formattedContractHash
    );
    expect(myHash.data).deep.eq(myHashFromString.data);

    // Should support legacy string
    const myHashFromLegacyString = CLContractPackageHash.fromFormattedString(
      'contract-package-wasm2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
    );
    expect(myHash.data).deep.eq(myHashFromLegacyString.data);
  });

  it('should throw error when invalid formatted string is provided', () => {
    const badFn = () =>
      CLContractPackageHash.fromFormattedString(
        'contrac-2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a'
      );
    expect(badFn).throw('Invalid Format');
  });
});
