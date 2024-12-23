import { concat } from '@ethersproject/bytes';

import { CLType, CLTypeResult } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueParser } from './Parser';
import { CLValueUInt8 } from './Numeric';

/**
 * Represents a Result type in the Casper type system.
 * A Result can either be a success (Ok) or an error (Err).
 */
export class CLValueResult {
  public type: CLTypeResult;
  public isSuccess: boolean;
  public inner: CLValue;

  /**
   * Initializes a new instance of the CLValueResult class.
   * @param type - The CLTypeResult representing the type of the Result.
   * @param isSuccess - A boolean indicating whether the Result is a success (true) or an error (false).
   * @param inner - The CLValue contained within the Result.
   */
  constructor(type: CLTypeResult, isSuccess: boolean, inner: CLValue) {
    this.type = type;
    this.isSuccess = isSuccess;
    this.inner = inner;
  }

  /**
   * Converts the Result to its byte representation.
   * Includes a success flag byte (1 for success, 0 for error) followed by the bytes of the inner value.
   * @returns A Uint8Array representing the bytes of the Result.
   */
  public bytes(): Uint8Array {
    const successByte = Uint8Array.from([this.isSuccess ? 1 : 0]);
    const innerBytes = this.inner.bytes();
    return concat([successByte, innerBytes]);
  }

  /**
   * Provides a string representation of the Result.
   * @returns A string representation of the Result, either "Ok(innerValue)" or "Err(innerValue)".
   */
  public toString(): string {
    return this.isSuccess
      ? `Ok(${this.inner.toString()})`
      : `Err(${this.inner.toString()})`;
  }

  /**
   * Converts the instance to a JSON-compatible format.
   *
   * @returns {any} The JSON representation of the inner value.
   *
   * Calls `toJSON()` on the inner value to produce its JSON representation.
   */
  public toJSON(): any {
    return this.inner.toJSON();
  }

  /**
   * Retrieves the inner CLValue of the Result.
   * @returns The CLValue contained within the Result.
   */
  public value(): CLValue {
    return this.inner;
  }

  /**
   * Creates a new CLValue instance with a Result value.
   * @param innerOk - The CLType for the success case.
   * @param innerErr - The CLType for the error case.
   * @param value - The CLValue to be contained in the Result.
   * @param isSuccess - A boolean indicating whether the Result is a success (true) or an error (false).
   * @returns A new CLValue instance containing CLTypeResult and a CLValueResult.
   */
  public static newCLResult(
    innerOk: CLType,
    innerErr: CLType,
    value: CLValue,
    isSuccess: boolean
  ): CLValue {
    const resultType = new CLTypeResult(innerOk, innerErr);
    const clValue = new CLValue(resultType);
    clValue.result = new CLValueResult(resultType, isSuccess, value);
    return clValue;
  }

  /**
   * Creates a CLValueResult instance from a Uint8Array.
   * Parses the byte array to interpret the success flag and the inner value.
   * @param source - The Uint8Array containing the byte representation of the Result value.
   * @param clType - The CLTypeResult representing the type of the Result.
   * @returns An object containing the new CLValueResult instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeResult
  ): IResultWithBytes<CLValueResult> {
    const { result: u8, bytes: u8Bytes } = CLValueUInt8.fromBytes(source);
    const resultTag = u8?.getValue();
    const isSuccess = resultTag === 1;
    const innerType = isSuccess ? clType.innerOk : clType.innerErr;

    const inner = CLValueParser.fromBytesByType(u8Bytes, innerType);

    return {
      result: new CLValueResult(clType, isSuccess, inner?.result),
      bytes: inner?.bytes
    };
  }
}
