import { concat } from '@ethersproject/bytes';

import { CLTypeTuple3 } from './cltype';
import { CLValueParser } from './Parser';
import { CLValue, IResultWithBytes } from './CLValue';

/**
 * Represents a tuple containing three CLValues in the Casper type system.
 */
export class CLValueTuple3 {
  public innerType: CLTypeTuple3;
  public inner1: CLValue;
  public inner2: CLValue;
  public inner3: CLValue;

  /**
   * Initializes a new instance of the CLValueTuple3 class.
   * @param innerType - The CLType representing the type of the tuple.
   * @param inner1 - The first CLValue in the tuple.
   * @param inner2 - The second CLValue in the tuple.
   * @param inner3 - The third CLValue in the tuple.
   */
  constructor(
    innerType: CLTypeTuple3,
    inner1: CLValue,
    inner2: CLValue,
    inner3: CLValue
  ) {
    this.innerType = innerType;
    this.inner1 = inner1;
    this.inner2 = inner2;
    this.inner3 = inner3;
  }

  /**
   * Converts the tuple to its byte representation.
   * @returns A Uint8Array representing the concatenated bytes of all three inner CLValues.
   */
  public bytes(): Uint8Array {
    const inner1Bytes = this.inner1.bytes();
    const inner2Bytes = this.inner2.bytes();
    const inner3Bytes = this.inner3.bytes();
    return concat([inner1Bytes, inner2Bytes, inner3Bytes]);
  }

  /**
   * Provides a string representation of the tuple.
   * @returns A string representation of the tuple in the format "(value1, value2, value3)".
   */
  public toString(): string {
    return `(${this.inner1.toString()}, ${this.inner2.toString()}, ${this.inner3.toString()})`;
  }

  /**
   * Converts the instance to a JSON-compatible array.
   *
   * @returns {any[]} An array containing the JSON representations of inner1, inner2, and inner3.
   */
  public toJSON(): any[] {
    return [this.inner1.toJSON(), this.inner2.toJSON(), this.inner3.toJSON()];
  }

  /**
   * Retrieves the values of the tuple as an array.
   * @returns An array containing the three CLValues of the tuple.
   */
  public value(): [CLValue, CLValue, CLValue] {
    return [this.inner1, this.inner2, this.inner3];
  }

  /**
   * Creates a new CLValue instance with a Tuple3 value.
   * @param val1 - The first CLValue in the tuple.
   * @param val2 - The second CLValue in the tuple.
   * @param val3 - The third CLValue in the tuple.
   * @returns A new CLValue instance containing CLTypeTuple3 and a CLValueTuple3.
   */
  public static newCLTuple3(
    val1: CLValue,
    val2: CLValue,
    val3: CLValue
  ): CLValue {
    const tupleType = new CLTypeTuple3(val1.type, val2.type, val3.type);
    const clValue = new CLValue(tupleType);
    clValue.tuple3 = new CLValueTuple3(tupleType, val1, val2, val3);
    return clValue;
  }

  /**
   * Creates a CLValueTuple3 instance from a Uint8Array.
   * Parses the byte array to retrieve the three values of the tuple.
   * @param source - The Uint8Array containing the byte representation of the Tuple3 value.
   * @param clType - The CLTypeTuple3 representing the type of the tuple.
   * @returns An object containing the new CLValueTuple3 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeTuple3
  ): IResultWithBytes<CLValueTuple3> {
    const inner1 = CLValueParser.fromBytesByType(source, clType.inner1);
    const inner2 = CLValueParser.fromBytesByType(inner1.bytes, clType.inner2);
    const inner3 = CLValueParser.fromBytesByType(inner2.bytes, clType.inner3);

    return {
      result: new CLValueTuple3(
        clType,
        inner1.result,
        inner2.result,
        inner3.result
      ),
      bytes: inner3.bytes
    };
  }
}
