import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';

/** Prefix for transfer hashes in TransferHash. */
export const PrefixNameTransfer = 'transfer-';

/**
 * Represents a transfer hash, extending the `Hash` class, with an additional prefix specific to transfer entities.
 * This prefix aids in identifying transfer-related hashes within the system.
 */
@jsonObject
export class TransferHash extends Hash {
  /**
   * The origin prefix used to identify transfer-related hashes, defaulting to `transfer-`.
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string = PrefixNameTransfer;

  /**
   * Creates an instance of TransferHash.
   * Supports both hex strings (with or without the transfer prefix) and Uint8Array representations of the hash.
   * @param source - A hex string or Uint8Array representing the hash.
   */
  constructor(source: string | Uint8Array) {
    // Resolve first, then call `super` once. A `super(...)` per branch runs
    // the `originPrefix` field initializer after the branch has assigned it.
    const { hashBytes, originPrefix } =
      typeof source === 'string'
        ? TransferHash.initializeFromSource(source)
        : { hashBytes: source, originPrefix: PrefixNameTransfer };

    super(hashBytes);
    this.originPrefix = originPrefix;
  }

  /**
   * Parses a source string to extract the hash bytes and verify if it includes the transfer prefix.
   * @param source - The source string representing the transfer hash, optionally prefixed.
   * @returns An object containing the hash bytes and the detected origin prefix.
   */
  private static initializeFromSource(source: string): {
    hashBytes: Uint8Array;
    originPrefix: string;
  } {
    const originPrefix = source.startsWith(PrefixNameTransfer)
      ? PrefixNameTransfer
      : '';
    const hashHex = source.replace(originPrefix, '');
    return {
      hashBytes: Uint8Array.from(Buffer.from(hashHex, 'hex')),
      originPrefix
    };
  }

  /**
   * Converts the TransferHash to a standardized prefixed string format.
   * This format includes the transfer-specific prefix followed by the hash in hexadecimal format.
   * @returns A string representation of the TransferHash with its prefix.
   */
  toPrefixedString(): string {
    return `${this.originPrefix}${this.toHex()}`;
  }

  /**
   * Serializes the TransferHash to a JSON-compatible string.
   * Primarily used for JSON-based data exchange or storage.
   * @returns A JSON-compatible string representation of the TransferHash.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Instantiates a TransferHash from a JSON-compatible string, allowing for easy deserialization.
   * The string should represent the TransferHash in prefixed hex format.
   * @param json - The JSON string representing the TransferHash.
   * @returns A new TransferHash instance initialized from the JSON string.
   */
  static fromJSON(json: string): TransferHash {
    return new TransferHash(json);
  }
}
