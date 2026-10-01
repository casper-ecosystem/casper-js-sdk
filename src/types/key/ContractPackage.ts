import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { PrefixName } from './PrefixName';

/**
 * Represents a contract package hash within the system, with support for prefixed and JSON representations.
 */
@jsonObject
export class ContractPackageHash {
  /**
   * The hash object representing the contract package.
   */
  @jsonMember({ name: 'Hash', constructor: Hash })
  hash: Hash;

  /**
   * The original prefix of the contract package hash string, if any (e.g., "hash-", "contract-package-wasm-", "contract-package-").
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string;

  /**
   * Constructs a new `ContractPackageHash` instance.
   * @param hash - The `Hash` object representing the contract package hash.
   * @param originPrefix - The original prefix of the contract package hash string, if applicable.
   */
  constructor(hash: Hash, originPrefix: string) {
    this.hash = hash;
    this.originPrefix = originPrefix;
  }

  /**
   * Converts the `ContractPackageHash` instance to its JSON representation.
   * @returns A string representation of the `ContractPackageHash`, including the original prefix.
   */
  toJSON(): string {
    return this.originPrefix + this.hash.toHex();
  }

  /**
   * Returns the contract package hash as a prefixed string.
   * @returns The contract package hash prefixed with `ContractPackage`.
   */
  toPrefixedString(): string {
    return PrefixName.ContractPackage + this.hash.toHex();
  }

  /**
   * Creates a `ContractPackageHash` instance from its JSON representation.
   * @param json - The JSON string representation of the `ContractPackageHash`.
   * @returns A new `ContractPackageHash` instance.
   */
  static fromJSON(json: string): ContractPackageHash {
    return ContractPackageHash.newContractPackage(json);
  }

  /**
   * Creates a new `ContractPackageHash` instance from a string representation.
   * @param source - The string representation of the contract package hash, including any prefix.
   * @returns A new `ContractPackageHash` instance.
   */
  static newContractPackage(source: string): ContractPackageHash {
    let originPrefix = '';
    if (source.startsWith(PrefixName.Hash)) {
      originPrefix = PrefixName.Hash;
    } else if (source.startsWith(PrefixName.ContractPackageWasm)) {
      originPrefix = PrefixName.ContractPackageWasm;
    } else if (source.startsWith(PrefixName.ContractPackage)) {
      originPrefix = PrefixName.ContractPackage;
    }

    const hexBytes = Hash.fromHex(source.slice(originPrefix.length));
    return new ContractPackageHash(hexBytes, originPrefix);
  }
}
