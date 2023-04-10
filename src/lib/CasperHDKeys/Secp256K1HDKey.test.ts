import { expect } from 'chai';
import { Secp256K1HDKey } from './Secp256K1HDKey';

describe('Secp256K1HDKey', () => {
  it('should generate key from mnemonic', () => {
    const key = Secp256K1HDKey.new();

    const key0 = key.deriveChild(1);

    const mn = key.mnemonic;
    console.log(mn);
    console.log(key.deriveChild(0).accountHex());
    console.log(key.deriveChild(1).accountHex());
    console.log(key.deriveChild(2).accountHex());

    const recoveredKey = Secp256K1HDKey.fromMnemonic(mn);

    const recoveredKey0 = recoveredKey.deriveChild(1);

    expect(key0.accountHex()).eq(recoveredKey0.accountHex());
  });
});
