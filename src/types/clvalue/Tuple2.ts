import { concat } from '@ethersproject/bytes';

import { CLTypeTuple2 } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueParser } from './Parser';

/**
 * Represents a tuple containing two CLValues in the Casper type system.
 */
export class CLValueTuple2 {
  public innerType: CLTypeTuple2;
  public inner1: CLValue;
  public inner2: CLValue;

  /**
   * Initializes a new instance of the CLValueTuple2 class.
   * @param innerType - The CLTypeTuple2 representing the type of the tuple.
   * @param inner1 - The first CLValue in the tuple.
   * @param inner2 - The second CLValue in the tuple.
   */
  constructor(innerType: CLTypeTuple2, inner1: CLValue, inner2: CLValue) {
    this.innerType = innerType;
    this.inner1 = inner1;
    this.inner2 = inner2;
  }

  /**
   * Converts the tuple to its byte representation.
   * @returns A Uint8Array representing the concatenated bytes of both inner CLValues.
   */
  public bytes(): Uint8Array {
    const inner1Bytes = this.inner1.bytes();
    const inner2Bytes = this.inner2.bytes();
    return concat([inner1Bytes, inner2Bytes]);
  }

  /**
   * Provides a string representation of the tuple.
   * @returns A string representation of the tuple in the format "(value1, value2)".
   */
  public toString(): string {
    return `(${this.inner1.toString()}, ${this.inner2.toString()})`;
  }

  /**
   * Converts the instance to a JSON-compatible array.
   *
   * @returns {any[]} An array containing the JSON representations of inner1 and inner2.
   */
  public toJSON(): any[] {
    return [this.inner1.toJSON(), this.inner2.toJSON()];
  }

  /**
   * Retrieves the values of the tuple as an array.
   * @returns An array containing the two CLValues of the tuple.
   */
  public value(): [CLValue, CLValue] {
    return [this.inner1, this.inner2];
  }

  /**
   * Creates a CLValueTuple2 instance from a Uint8Array.
   * Parses the byte array to retrieve the two values of the tuple.
   * @param source - The Uint8Array containing the byte representation of the Tuple2 value.
   * @param clType - The CLTypeTuple2 representing the type of the tuple.
   * @returns An object containing the new CLValueTuple2 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeTuple2
  ): IResultWithBytes<CLValueTuple2> {
    const inner1 = CLValueParser.fromBytesByType(source, clType.inner1);
    const inner2 = CLValueParser.fromBytesByType(inner1.bytes, clType.inner2);

    return {
      result: new CLValueTuple2(clType, inner1?.result, inner2?.result),
      bytes: inner2?.bytes
    };
  }
}
