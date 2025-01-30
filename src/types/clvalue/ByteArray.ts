import { CLTypeByteArray } from './cltype';
import { IResultWithBytes } from './CLValue';

/**
 * Represents a byte array value in the Casper type system.
 * This class encapsulates a byte array, providing methods for conversion to and from CLValue.
 */
export class CLValueByteArray {
  private data: Uint8Array;

  /**
   * Initializes a new instance of the CLValueByteArray class.
   * @param data - The Uint8Array to be stored in the CLValueByteArray.
   */
  constructor(data: Uint8Array) {
    this.data = data;
  }

  /**
   * Retrieves the byte representation of the byte array.
   * @returns A Uint8Array representing the bytes of the byte array.
   */
  public bytes(): Uint8Array {
    return this.data;
  }

  /**
   * Converts the instance to a JSON-compatible byte array.
   *
   * @returns {Uint8Array} The byte representation of the instance.
   */
  public toJSON(): Uint8Array {
    return this.bytes();
  }

  /**
   * Provides a hexadecimal string representation of the byte array.
   * Each byte is represented by two hexadecimal digits.
   * @returns A string representing the byte array in hexadecimal format.
   */
  public toString(): string {
    return Array.from(this.data, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  /**
   * Creates a CLValueByteArray instance from a Uint8Array.
   * Extracts the bytes specified by the given CLTypeByteArray size.
   * @param data - The Uint8Array containing the byte representation of the ByteArray value.
   * @param clType - The CLTypeByteArray defining the size of the ByteArray.
   * @returns An object containing the new CLValueByteArray instance and any remaining bytes.
   */
  public static fromBytes(
    data: Uint8Array,
    clType: CLTypeByteArray
  ): IResultWithBytes<CLValueByteArray> {
    const byteArray = data.subarray(0, clType.size);
    return {
      result: new CLValueByteArray(byteArray),
      bytes: data.subarray(clType.size)
    };
  }
}
