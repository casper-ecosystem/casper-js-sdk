import { expect } from 'chai';

import { CasperHDKey } from './CasperHDKey';

describe('CasperHDKey', () => {
  it('should generate mnemonic', () => {
    const mn = CasperHDKey.newMenmonic();

    expect(CasperHDKey.validateMnemonic(mn));
  });
});
