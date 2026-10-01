import { expect } from 'vitest';

import { ContractPackageHash, PrefixName } from '../../../types';

const hashHex = 'ab'.repeat(32);

describe('ContractPackageHash', () => {
  it.each([
    [PrefixName.Hash, `${PrefixName.Hash}${hashHex}`],
    [
      PrefixName.ContractPackageWasm,
      `${PrefixName.ContractPackageWasm}${hashHex}`
    ],
    [PrefixName.ContractPackage, `${PrefixName.ContractPackage}${hashHex}`]
  ])(
    'newContractPackage() preserves the %s origin prefix through toJSON()',
    (_, str) => {
      const contractPackageHash = ContractPackageHash.newContractPackage(str);

      expect(contractPackageHash.hash.toHex()).to.equal(hashHex);
      expect(contractPackageHash.toJSON()).to.equal(str);
    }
  );

  it('toJSON() / fromJSON() round-trips', () => {
    const str = `${PrefixName.ContractPackage}${hashHex}`;
    const contractPackageHash = ContractPackageHash.fromJSON(str);

    expect(
      ContractPackageHash.fromJSON(contractPackageHash.toJSON()).toJSON()
    ).to.equal(str);
  });

  it('always emits the ContractPackage prefixed form regardless of origin', () => {
    const contractPackageHash = ContractPackageHash.newContractPackage(hashHex);

    expect(contractPackageHash.toPrefixedString()).to.equal(
      `${PrefixName.ContractPackage}${hashHex}`
    );
  });
});
