import { expect } from 'chai';
import { wordlist as chiWordlist } from '@scure/bip39/wordlists/simplified-chinese';

import { CasperHDKey } from './CasperHDKey';

describe('CasperHDKey', () => {
  it('should generate mnemonic', () => {
    const mn = CasperHDKey.newMnemonic();

    expect(CasperHDKey.validateMnemonic(mn));
  });

  it('should set user specific wordlist', () => {
    CasperHDKey.setWordlist(chiWordlist);
    expect(CasperHDKey.getWordlist()).eq(chiWordlist);
  });
});
