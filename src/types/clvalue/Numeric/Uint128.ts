import { BigNumberish } from '@ethersproject/bignumber';

import { CLTypeUInt128 } from '../cltype';
import { fromBytesUInt128 } from '../UintBig';
import { CLValue, IResultWithBytes } from '../CLValue';
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
   * Creates a new CLValue instance with a UInt128 value.
   * @param value - The value to initialize the UInt128 with.
   * @returns A new CLValue instance containing CLTypeUInt128 and a CLValueUInt128.
   */
  public static newCLUInt128(value: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt128);
    res.ui128 = new CLValueUInt128(value);
    return res;
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
