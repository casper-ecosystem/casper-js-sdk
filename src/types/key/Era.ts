import { jsonMember, jsonObject } from 'typedjson';
import { fromBytesU64, toBytesNumber } from '../ByteConverters';

/**
 * Represents an Era in the system.
 * An Era is a distinct period in the blockchain, typically used for consensus, validator rotations, and reward distributions.
 */
@jsonObject
export class Era {
  /**
   * The numeric identifier of the Era.
   */
  @jsonMember({ constructor: Number })
  public value: number;

  /**
   * Creates a new Era instance.
   * @param value - The numeric identifier of the Era.
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Converts the Era instance to its JSON representation.
   * @returns A string representation of the Era's numeric value.
   */
  toJSON(): string {
    return this.value.toString();
  }

  /**
   * Creates an Era instance from its JSON representation.
   * @param json - The JSON string representation of the Era.
   * @returns A new Era instance.
   * @throws Error if the JSON string cannot be parsed as a valid number.
   */
  static fromJSON(json: string): Era {
    const value = parseInt(json, 10);
    if (isNaN(value)) {
      throw new Error(`Invalid Era value: ${json}`);
    }
    return new Era(value);
  }

  /**
   * Creates an Era instance from a byte array.
   * @param bytes - The Era value as a little-endian `u64`, in the first 8 bytes.
   * @returns A new Era instance.
   * @throws Error if fewer than 8 bytes are given, or the value exceeds `Number.MAX_SAFE_INTEGER`.
   */
  static fromBytes(bytes: Uint8Array): Era {
    return new Era(fromBytesU64(bytes.subarray(0, 8)).toNumber());
  }

  /**
   * Converts the Era instance to a byte array.
   * @returns The Era value as a little-endian `u64`.
   */
  toBytes(): Uint8Array {
    return toBytesNumber(64, false)(this.value);
  }
}
