import { expect } from 'chai';
import { Ed25519HDKey } from './Ed25519HDKey';
import { decodeBase16, encodeBase16 } from '../Conversions';

describe('Ed25519HDKey', () => {
  // Test vectors: https://github.com/satoshilabs/slips/blob/master/slip-0010.md
  const vector1 = decodeBase16('000102030405060708090a0b0c0d0e0f');
  const vector2 = decodeBase16(
    'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'
  );

  it('should generate key from mnemonic', () => {
    const key = Ed25519HDKey.new();

    const key0 = key.deriveChild(1);

    const mn = key.mnemonic;

    const recoveredKey = Ed25519HDKey.fromMnemonic(mn);

    const recoveredKey0 = recoveredKey.deriveChild(1);

    expect(key0.accountHex()).eq(recoveredKey0.accountHex());
  });

  it('Ed25519HDKey - vector1 - m', () => {
    const key = new Ed25519HDKey(vector1);
    const mKey = key.derive('m');

    expect(encodeBase16(mKey.privateKey)).eq(
      '2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7'
    );
    expect('00' + encodeBase16(mKey.publicKey.value())).eq(
      '00a4b2856bfec510abab89753fac1ac0e1112364e7d250545963f135f2a33188ed'
    );
  });
  it('Ed25519HDKey - vector2 - m', () => {
    const key = new Ed25519HDKey(vector2);
    const mKey = key.derive('m');

    expect(encodeBase16(mKey.privateKey)).eq(
      '171cb88b1b3c1db25add599712e36245d75bc65a1a5c9e18d76f9f2b1eab4012'
    );
    expect('00' + encodeBase16(mKey.publicKey.value())).eq(
      '008fe9693f8fa62a4305a140b9764c5ee01e455963744fe18204b4fb948249308a'
    );
  });
});
