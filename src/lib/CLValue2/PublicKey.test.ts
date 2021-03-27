import { expect } from 'chai';
import { CLPublicKey } from './index';
import { Keys } from '../index';

describe('CLPublicKey', () => {
  it('Create CLPublicKey from hex', () => {
    const ed25519Account = Keys.Ed25519.new();
    const ed25519AccountHex = ed25519Account.accountHex();

    expect(CLPublicKey.fromHex(ed25519AccountHex).value()).to.deep.equal(
      ed25519Account.publicKey.rawPublicKey
    );

    const secp256K1Account = Keys.Secp256K1.new();
    const secp256K1AccountHex = secp256K1Account.accountHex();

    expect(CLPublicKey.fromHex(secp256K1AccountHex).value()).to.deep.equal(
      secp256K1Account.publicKey.rawPublicKey
    );
  });

  it('toAccountHash valid result', () => {
    const accountKey =
      '01f9235ff9c46c990e1e2eee0d531e488101fab48c05b75b8ea9983658e228f06b';
    const rawPublicKey = new TextEncoder().encode(accountKey);

    const tag = parseInt(accountKey.charAt(1));
    const publicKey = new CLPublicKey(rawPublicKey, tag);
    const accountHash = publicKey.toAccountHash();
    // prettier-ignore
    const validResult = Uint8Array.from(
  [185, 165, 197, 234, 124, 153, 163, 
   67, 187,  34,  52, 219, 142,  78,
   167,  87, 229, 253, 142,  41,  14,
    19,  21, 207, 123, 167, 197, 194,
    103, 237, 110, 248
  ]);

    expect(accountHash).to.be.deep.eq(validResult);
  });
});
