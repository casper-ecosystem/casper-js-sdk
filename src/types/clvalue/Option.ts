import { concat } from '@ethersproject/bytes';

import { CLTypeOption } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueParser } from './Parser';
import { CLValueUInt8 } from './Numeric';

/**
 * Represents an optional value in the Casper type system.
 * An option can either contain a value or be empty (null).
 */
export class CLValueOption {
  public type?: CLTypeOption;
  public inner: CLValue | null;

  /**
   * Initializes a new instance of the CLValueOption class.
   * @param inner - The CLValue contained in the option, or null if empty.
   * @param type - The CLTypeOption representing the type of the option.
   */
  constructor(inner: CLValue | null, type?: CLTypeOption) {
    this.type = type;
    this.inner = inner;
  }

  /**
   * Converts the option to its byte representation.
   * If the option is empty, it returns a Uint8Array with a single 0 byte.
   * If it contains a value, it returns a Uint8Array with 1 followed by the inner value's bytes.
   * @returns A Uint8Array representing the bytes of the option.
   */
  public bytes(): Uint8Array {
    if (this.isEmpty()) {
      return Uint8Array.from([0]);
    }
    const innerBytes = this.inner!.bytes();
    return concat([Uint8Array.from([1]), innerBytes]);
  }

  /**
   * Provides a string representation of the option.
   * @returns An empty string if the option is empty, otherwise the string representation of the inner value.
   */
  public toString(): string {
    return this.isEmpty() ? '' : this.inner!.toString();
  }

  /**
   * Converts the instance to a JSON-compatible format.
   *
   * @returns {any} The JSON representation of the inner value or `null` if empty.
   *
   * If the instance is empty, it returns `null`. Otherwise, it calls `toJSON()`
   * on the inner value to produce its JSON representation.
   */
  public toJSON(): any {
    return this.isEmpty() ? null : this.inner!.toJSON();
  }

  /**
   * Checks if the option is empty.
   * @returns true if the option is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.inner === null;
  }

  /**
   * Retrieves the inner value of the option.
   * @returns The inner CLValue if the option is not empty, or null if it is empty.
   */
  public value(): CLValue | null {
    return this.inner;
  }

  /**
   * Creates a CLValueOption instance from a Uint8Array.
   * Parses the byte array to determine if the option is empty or contains a value.
   * @param source - The Uint8Array containing the byte representation of the Option value.
   * @param clType - The CLTypeOption representing the type of the option.
   * @returns An object containing the new CLValueOption instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeOption
  ): IResultWithBytes<CLValueOption> {
    const { result: u8, bytes: u8Bytes } = CLValueUInt8.fromBytes(source);
    const optionTag = u8.toNumber();

    if (optionTag === 0) {
      return { result: new CLValueOption(null, clType), bytes: u8Bytes };
    }

    const inner = CLValueParser.fromBytesByType(u8Bytes, clType.inner);

    return {
      result: new CLValueOption(inner.result, clType),
      bytes: inner.bytes
    };
  }
}
