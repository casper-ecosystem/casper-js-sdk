import { BigNumberish } from '@ethersproject/bignumber';

import { IResultWithBytes } from '../CLValue';
import { toBytesU8 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents an 8-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt8 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the UInt8 value to its byte representation.
   * @returns A Uint8Array containing a single byte representing the UInt8 value.
   */
  public bytes(): Uint8Array {
    return toBytesU8(this.value);
  }

  /**
   * Creates a CLValueUInt8 instance from a Uint8Array.
   * Parses the first byte to retrieve the UInt8 value.
   * @param source - The Uint8Array containing the byte representation of the UInt8 value.
   * @returns An object containing the new CLValueUInt8 instance and any remaining bytes.
   * @throws Error if the source array is empty.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUInt8> {
    if (source.length === 0) {
      throw new Error('Insufficient buffer length for UInt8');
    }

    return { result: new CLValueUInt8(source[0]), bytes: source.subarray(1) };
  }
}
