import { expect } from 'chai';
import { wordlist as chiWordlist } from '@scure/bip39/wordlists/simplified-chinese';
import { wordlist as engWordlist } from '@scure/bip39/wordlists/english';

import { CasperHDKey } from './CasperHDKey';

describe('CasperHDKey', () => {
  it('should generate mnemonic', () => {
    const mn = CasperHDKey.newMnemonic();

    expect(CasperHDKey.validateMnemonic(mn));
  });

  it('should set user specific wordlist', () => {
    CasperHDKey.setWordlist(chiWordlist);
    expect(CasperHDKey.getWordlist()).eq(chiWordlist);
    CasperHDKey.setWordlist(engWordlist);
  });

  it('should generate 24 length mnemonic', () => {
    const mn = CasperHDKey.newMnemonic(24);

    expect(mn.split(' ').length === 24);
  });

  it('should generate 12 length mnemonic', () => {
    const mn = CasperHDKey.newMnemonic(12);

    expect(mn.split(' ').length === 12);
  });

  it('should throw error if invalid mnemonic length is provided', () => {
    expect(() => CasperHDKey.newMnemonic(10)).to.throw('Invalid word length');
  });
});
