import { jsonObject } from 'typedjson';
import { Hash } from './Hash';
import { PrefixName } from './PrefixName';

/**
 * Represents an account hash in the Casper network.
 * This class extends the `Hash` class, adding specific methods and properties for managing account hashes, which include special prefixes.
 */
@jsonObject
export class AccountHash extends Hash {
  /**
   * Stores the prefix of the original hash string if it had one.
   * Possible prefixes are `"00"` or `"account-hash-"`.
   */
  private originPrefix: string;

  /**
   * Initializes a new AccountHash instance.
   * @param hash - The underlying Hash object containing the raw bytes of the account hash.
   * @param originPrefix - Optional. The prefix of the original hash string (default is an empty string).
   */
  constructor(hash: Hash, originPrefix = '') {
    super(hash.toBytes());
    this.originPrefix = originPrefix;
  }

  /**
   * Parses a string representation of an account hash and creates an AccountHash instance.
   * Recognizes and preserves any prefix, either `"00"` or `"account-hash-"`.
   * @param source - The string representation of the account hash.
   * @returns A new AccountHash instance containing the parsed hash and prefix.
   */
  public static fromString(source: string): AccountHash {
    let originPrefix = '';
    if (source.length === 66 && source.startsWith('00')) {
      originPrefix = '00';
    } else if (source.startsWith(PrefixName.Account)) {
      originPrefix = PrefixName.Account;
    }

    const hexString = source.slice(originPrefix.length);
    const hash = Hash.fromHex(hexString);
    return new AccountHash(hash, originPrefix);
  }

  /**
   * Returns the account hash as a string, prefixed with `"account-hash-"`.
   * This is useful for displaying the hash in a format recognized by the Casper network.
   * @returns The account hash as a prefixed string.
   */
  public toPrefixedString(): string {
    return PrefixName.Account + this.toHex();
  }

  /**
   * Serializes the AccountHash to its JSON representation.
   * The JSON representation includes the original prefix if present.
   * @returns A string representation of the AccountHash for JSON serialization.
   */
  public toJSON(): string {
    return this.originPrefix + this.toHex();
  }

  /**
   * Deserializes an AccountHash instance from a JSON string representation.
   * @param data - The JSON string representation of the AccountHash.
   * @returns A new AccountHash instance created from the JSON string.
   * @throws {Error} Throws an error if the input is not a valid JSON string.
   */
  public static fromJSON(data: string): AccountHash {
    return AccountHash.fromString(data);
  }
}
