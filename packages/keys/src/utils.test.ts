import { SignatureAlgorithm } from '@casper-js-sdk/types';
import { expect } from 'chai';

import { accountHashHelper } from './utils';

describe('utils', () => {
  it('should return empty array when public key is empty', () => {
    const publicKey = new Uint8Array();
    const accountHash = accountHashHelper(
      SignatureAlgorithm.Ed25519,
      publicKey
    );

    expect(accountHash).to.deep.eq(new Uint8Array());
  });
});
