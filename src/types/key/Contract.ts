import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { PrefixName } from './PrefixName';

/**
 * Represents a contract hash within the system, providing various prefixed representations.
 */
@jsonObject
export class ContractHash {
  /**
   * The hash object representing the contract.
   */
  @jsonMember({ name: 'Hash', constructor: Hash })
  hash: Hash;

  /**
   * The prefix of the original contract hash string, if any (e.g., "hash-", "contract-wasm-", "contract-").
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string;

  /**
   * Constructs a new `ContractHash` instance.
   * @param hash - The `Hash` object representing the contract hash.
   * @param originPrefix - The original prefix of the contract hash string.
   */
  constructor(hash: Hash, originPrefix: string) {
    this.hash = hash;
    this.originPrefix = originPrefix;
  }

  /**
   * Converts the `ContractHash` instance to its JSON representation.
   * @returns A string representation of the `ContractHash`, including the original prefix.
   */
  toJSON(): string {
    return this.originPrefix + this.hash.toHex();
  }

  /**
   * Returns the contract hash as a WASM-prefixed string.
   * @returns The contract hash prefixed with `ContractWasm`.
   */
  toPrefixedWasmString(): string {
    return PrefixName.ContractWasm + this.hash.toHex();
  }

  /**
   * Returns the contract hash as a general prefixed string.
   * @returns The contract hash prefixed with `Contract`.
   */
  toPrefixedString(): string {
    return PrefixName.Contract + this.hash.toHex();
  }

  /**
   * Creates a `ContractHash` instance from its JSON representation.
   * @param json - The JSON string representation of the `ContractHash`.
   * @returns A new `ContractHash` instance.
   */
  static fromJSON(json: string): ContractHash {
    return ContractHash.newContract(json);
  }

  /**
   * Creates a new `ContractHash` instance from a string representation.
   * @param source - The string representation of the contract hash.
   * @returns A new `ContractHash` instance.
   */
  static newContract(source: string): ContractHash {
    let originPrefix = '';
    if (source.startsWith(PrefixName.Hash)) {
      originPrefix = PrefixName.Hash;
    } else if (source.startsWith(PrefixName.ContractWasm)) {
      originPrefix = PrefixName.ContractWasm;
    } else if (source.startsWith(PrefixName.Contract)) {
      originPrefix = PrefixName.Contract;
    } else if (source.startsWith(PrefixName.EntityContract)) {
      originPrefix = PrefixName.EntityContract;
    }

    const hexBytes = Hash.fromHex(source.slice(originPrefix.length));
    return new ContractHash(hexBytes, originPrefix);
  }
}
