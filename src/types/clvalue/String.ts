import { concat } from '@ethersproject/bytes';

import { CLTypeString } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueUInt32 } from './Numeric';
import { fromBytesString } from '../ByteConverters';

/**
 * Represents a string value in the Casper type system.
 */
export class CLValueString {
  private value: string;

  /**
   * Initializes a new instance of the CLValueString class.
   * @param value - The string value to be represented.
   */
  constructor(value: string) {
    this.value = value;
  }

  /**
   * Converts the string value to its byte representation.
   * The result is a Uint8Array containing the length of the string (as a 4-byte prefix) followed by the string's bytes.
   * @returns A Uint8Array representing the bytes of the string.
   */
  public bytes(): Uint8Array {
    const sizeBytes = this.sizeToBytes(this.value.length);
    const valueBytes = new TextEncoder().encode(this.value);
    return concat([sizeBytes, valueBytes]);
  }

  /**
   * Converts a size number to its 4-byte Uint8Array representation in little-endian format.
   * @param size - The size to convert.
   * @returns A Uint8Array representing the size.
   */
  private sizeToBytes(size: number): Uint8Array {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, size, true);
    return new Uint8Array(buffer);
  }

  /**
   * Converts the instance to a JSON-compatible string.
   *
   * @returns {string} The string representation of the instance.
   */
  public toJSON(): string {
    return this.toString();
  }

  /**
   * Provides the string value.
   * @returns The string value.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a string value.
   * @param val - The string value to be represented.
   * @returns A new CLValue instance containing CLTypeString and a CLValueString.
   */
  public static newCLString(val: string): CLValue {
    const res = new CLValue(CLTypeString);
    res.stringVal = new CLValueString(val);
    return res;
  }

  /**
   * Creates a CLValueString instance from a Uint8Array.
   * Parses the byte array to retrieve the string value, interpreting the first 4 bytes as the string length.
   * @param source - The Uint8Array containing the byte representation of the string value.
   * @returns An object containing the new CLValueString instance and any remaining bytes.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueString> {
    const uint32Value = CLValueUInt32.fromBytes(source);
    const size = uint32Value?.result?.toNumber();
    const value = fromBytesString(uint32Value?.bytes?.subarray(0, size));

    return {
      result: new CLValueString(value),
      bytes: uint32Value?.bytes?.subarray(size)
    };
  }
}
