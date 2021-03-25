import { expect } from 'chai';
import { CLPublicKey } from './index';
import { Keys } from "../index";

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
});

