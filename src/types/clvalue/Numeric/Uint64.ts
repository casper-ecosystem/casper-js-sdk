import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { CLTypeUInt64, Int64ByteSize } from '../cltype';
import { CLValue, IResultWithBytes } from '../CLValue';
import { toBytesU64 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 64-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt64 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the UInt64 value to its byte representation in little-endian format.
   * @returns A Uint8Array representing the bytes of the UInt64 value.
   */
  public bytes(): Uint8Array {
    return toBytesU64(this.value);
  }

  /**
   * Creates a new CLValue instance with a UInt64 value.
   * @param val - The value to initialize the UInt64 with. Can be any BigNumberish type.
   * @returns A new CLValue instance containing CLTypeUInt64 and a CLValueUInt64.
   */
  public static newCLUint64(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt64);
    res.ui64 = new CLValueUInt64(val);
    return res;
  }

  /**
   * Creates a CLValueUInt64 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt64 value.
   * @param source - The Uint8Array containing the byte representation of the UInt64 value.
   * @returns An object containing the new CLValueUInt64 instance and any remaining bytes.
   * @throws Error if the source array is smaller than the required size for a UInt64.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUInt64> {
    if (source.length < Int64ByteSize) {
      throw new Error('buffer size is too small');
    }
    const u64Bytes = Uint8Array.from(source.subarray(0, 8));
    const u64 = BigNumber.from(u64Bytes.slice().reverse());

    return { result: new CLValueUInt64(u64), bytes: source.subarray(8) };
  }
}
