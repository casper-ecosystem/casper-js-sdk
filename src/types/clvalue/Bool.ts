import { CLTypeBool } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';

/**
 * Represents a boolean value in the Casper type system.
 * This class encapsulates a boolean value and provides methods for byte conversion and CLValue integration.
 */
export class CLValueBool {
  private value: boolean;

  /**
   * Initializes a new instance of the CLValueBool class.
   * @param value - The boolean value to be stored.
   */
  constructor(value: boolean) {
    this.value = value;
  }

  /**
   * Converts the boolean value to its byte representation.
   * @returns A Uint8Array with a single byte: 1 for true, 0 for false.
   */
  public bytes(): Uint8Array {
    return new Uint8Array([this.value ? 1 : 0]);
  }

  /**
   * Provides a string representation of the boolean value.
   * @returns The string 'true' or 'false'.
   */
  public toString(): string {
    return this.value ? 'true' : 'false';
  }

  /**
   * Converts the instance to a JSON boolean.
   *
   * @returns {boolean} The boolean value of the instance.
   */
  public toJSON(): boolean {
    return this.value;
  }

  /**
   * Retrieves the boolean value.
   * @returns The stored boolean value.
   */
  public getValue(): boolean {
    return this.value;
  }

  /**
   * Creates a new CLValue instance containing a boolean value.
   * @param val - The boolean value to be stored in the CLValue.
   * @returns A new CLValue instance encapsulating the boolean value.
   */
  public static newCLValueBool(val: boolean): CLValue {
    const res = new CLValue(CLTypeBool);
    res.bool = new CLValueBool(val);
    return res;
  }

  /**
   * Creates a CLValueBool instance from a Uint8Array.
   * Parses the first byte in the array to determine the boolean value.
   * @param source - The Uint8Array containing the byte representation of the boolean value.
   * @returns An object containing the new CLValueBool instance and any remaining bytes.
   * @throws Will throw an error if the source array is empty or contains an invalid boolean byte.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueBool> {
    if (source.length === 0) {
      throw new Error('Empty byte array');
    }

    if (source[0] === 1) {
      return { result: new CLValueBool(true), bytes: source.subarray(1) };
    } else if (source[0] === 0) {
      return { result: new CLValueBool(false), bytes: source.subarray(1) };
    } else {
      throw new Error('Invalid bool value');
    }
  }
}
