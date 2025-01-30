import { BigNumberish } from '@ethersproject/bignumber';

import { fromBytesUInt256 } from '../UintBig';
import { IResultWithBytes } from '../CLValue';
import { toBytesU256 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 256-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt256 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the UInt256 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt256 value.
   */
  public bytes(): Uint8Array {
    return toBytesU256(this.value);
  }

  /**
   * Creates a CLValueUInt256 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt256 value.
   * @param source - The Uint8Array containing the byte representation of the UInt256 value.
   * @returns An object containing the new CLValueUInt256 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt256> {
    return fromBytesUInt256(source);
  }
}
