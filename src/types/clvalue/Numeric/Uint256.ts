import { BigNumberish } from '@ethersproject/bignumber';

import { fromBytesUInt256 } from '../UintBig';
import { CLValue, IResultWithBytes } from '../CLValue';
import { CLTypeUInt256 } from '../cltype';
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
   * Creates a new CLValue instance with a UInt256 value.
   * @param value - The value to initialize the UInt256 with.
   * @returns A new CLValue instance containing CLTypeUInt256 and a CLValueUInt256.
   */
  public static newCLUInt256(value: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt256);
    res.ui256 = new CLValueUInt256(value);
    return res;
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
