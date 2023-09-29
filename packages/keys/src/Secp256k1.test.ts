import { byteHash, decodeBase16 } from '@casper-js-sdk/types';
import { expect } from 'chai';

import { Secp256K1 } from './Secp256k1';

describe('Secp256K1', () => {
  it('calculates the account hash', () => {
    const signKeyPair = Secp256K1.new();
    // use lower case for node-rs
    const name = Buffer.from('secp256k1'.toLowerCase());
    const sep = decodeBase16('00');
    const bytes = Buffer.concat([name, sep, signKeyPair.publicKey.value()]);
    const hash = byteHash(bytes);

    expect(Secp256K1.accountHash(signKeyPair.publicKey.value())).deep.equal(
      hash
    );
  });

  it('should generate r+s signature', () => {
    const signKeyPair = Secp256K1.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    const signature = signKeyPair.sign(message);

    expect(signature.length).to.equal(64);
  });

  it('should sign and verify message', () => {
    const signKeyPair = Secp256K1.new();
    const message = Uint8Array.from(Buffer.from('Hello Secp256K1'));

    const signature = signKeyPair.sign(message);

    expect(signKeyPair.verify(signature, message)).to.equal(true);
  });
});
