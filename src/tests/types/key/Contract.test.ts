import { expect } from 'vitest';

import { ContractHash, PrefixName } from '../../../types';

const hashHex = 'ab'.repeat(32);

describe('ContractHash', () => {
  it.each([
    [PrefixName.Hash, `${PrefixName.Hash}${hashHex}`],
    [PrefixName.ContractWasm, `${PrefixName.ContractWasm}${hashHex}`],
    [PrefixName.Contract, `${PrefixName.Contract}${hashHex}`],
    [PrefixName.EntityContract, `${PrefixName.EntityContract}${hashHex}`]
  ])(
    'newContract() preserves the %s origin prefix through toJSON()',
    (_, str) => {
      const contractHash = ContractHash.newContract(str);

      expect(contractHash.hash.toHex()).to.equal(hashHex);
      expect(contractHash.toJSON()).to.equal(str);
    }
  );

  it('toJSON() / fromJSON() round-trips', () => {
    const str = `${PrefixName.Contract}${hashHex}`;
    const contractHash = ContractHash.fromJSON(str);

    expect(ContractHash.fromJSON(contractHash.toJSON()).toJSON()).to.equal(str);
  });

  it('always emits both the general and Wasm prefixed forms regardless of origin', () => {
    const contractHash = ContractHash.newContract(hashHex);

    expect(contractHash.toPrefixedString()).to.equal(
      `${PrefixName.Contract}${hashHex}`
    );
    expect(contractHash.toPrefixedWasmString()).to.equal(
      `${PrefixName.ContractWasm}${hashHex}`
    );
  });

  it('newContract() with no recognized prefix keeps the bare hex', () => {
    const contractHash = ContractHash.newContract(hashHex);

    expect(contractHash.hash.toHex()).to.equal(hashHex);
    expect(contractHash.toJSON()).to.equal(hashHex);
  });
});
