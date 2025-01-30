import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { fromBytesUInt512 } from '../UintBig';
import { IResultWithBytes } from '../CLValue';
import { toBytesU512 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 512-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt512 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the UInt512 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt512 value.
   */
  public bytes(): Uint8Array {
    return toBytesU512(this.value);
  }

  /**
   * Creates a CLValueUInt512 instance from a JSON representation.
   * @param json - The JSON representation of the UInt512 value. Can be a string or a number.
   * @returns A new CLValueUInt512 instance.
   * @throws Will throw an error if the input is not a valid integer or is negative.
   */
  public static fromJSON(json: string | number): CLValueUInt512 {
    const num = BigNumber.from(json);

    if (!num.mod(1).isZero() || num.isNegative()) {
      throw new Error(`Invalid integer string: ${json}`);
    }

    return new CLValueUInt512(num);
  }

  /**
   * Creates a CLValueUInt512 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt512 value.
   * @param source - The Uint8Array containing the byte representation of the UInt512 value.
   * @returns An object containing the new CLValueUInt512 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt512> {
    return fromBytesUInt512(source);
  }
}
