import { BigNumberish } from '@ethersproject/bignumber';

import { fromBytesUInt128 } from '../UintBig';
import { IResultWithBytes } from '../CLValue';
import { toBytesU128 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 128-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt128 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the UInt128 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt128 value.
   */
  public bytes(): Uint8Array {
    return toBytesU128(this.value);
  }

  /**
   * Creates a CLValueUInt128 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt128 value.
   * @param source - The Uint8Array containing the byte representation of the UInt128 value.
   * @returns An object containing the new CLValueUInt128 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt128> {
    return fromBytesUInt128(source);
  }
}
