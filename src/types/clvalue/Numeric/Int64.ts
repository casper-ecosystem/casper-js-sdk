import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { Int64ByteSize } from '../cltype';
import { IResultWithBytes } from '../CLValue';
import { toBytesI64 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 64-bit signed integer value in the Casper type system.
 * This class provides methods for handling 64-bit integers, including byte conversion and CLValue integration.
 */
export class CLValueInt64 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the Int64 value to its byte representation in little-endian format.
   * @returns A Uint8Array representing the bytes of the Int64 value.
   */
  public bytes(): Uint8Array {
    return toBytesI64(this.value);
  }

  /**
   * Creates a CLValueInt64 instance from a Uint8Array.
   * Interprets the first 8 bytes of the array as a 64-bit integer in little-endian format.
   * @param source - The Uint8Array containing the byte representation of the Int64 value.
   * @returns An object containing the new CLValueInt64 instance and any remaining bytes.
   * @throws Will throw an error if the source array is smaller than Int64ByteSize.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueInt64> {
    if (source.length < Int64ByteSize) {
      throw new Error('buffer size is too small');
    }
    const bytes = Uint8Array.from(source.subarray(0, 8));
    const val = BigNumber.from(bytes.slice().reverse()).fromTwos(64);
    const resultBytes = source.subarray(8);

    return { result: new CLValueInt64(val), bytes: resultBytes };
  }
}
