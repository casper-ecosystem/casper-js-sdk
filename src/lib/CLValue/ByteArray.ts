import { Ok } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLType,
  CLData,
  ToBytesResult,
  CLErrorCodes,
  ResultAndRemainder,
  resultHelper
} from './index';
import { BYTE_ARRAY_ID, CLTypeTag } from './constants';
import { toBytesU32 } from '../ByteConverters';

export const CL_BYTE_ARRAY_MAX_LENGTH = 32;

export class CLByteArray extends CLData {
  data: Uint8Array;
  /**
   * Constructs a new `CLByteArray`.
   *
   * @param v The bytes array with max length 32.
   */
  constructor(v: Uint8Array) {
    super();
    if (v.length > CL_BYTE_ARRAY_MAX_LENGTH) {
      throw new Error(
        `Provided value has length ${v.length} which exceeded the limit (${CL_BYTE_ARRAY_MAX_LENGTH})`
      );
    }
    this.data = v;
  }

  clType(): CLType {
    return new CLByteArrayType(this.data.length);
  }

  value(): Uint8Array {
    return this.data;
  }

  toBytes(): ToBytesResult {
    return Ok(this.data);
  }

  static fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLByteArray, CLErrorCodes> {
    const byteArray = new CLByteArray(
      bytes.subarray(0, CL_BYTE_ARRAY_MAX_LENGTH)
    );
    return resultHelper(
      Ok(byteArray),
      bytes.subarray(CL_BYTE_ARRAY_MAX_LENGTH)
    );
  }
}

export class CLByteArrayType extends CLType {
  linksTo = CLByteArray;
  tag = CLTypeTag.ByteArray;

  size: number;

  constructor(size: number) {
    super();
    this.size = size;
  }

  toString(): string {
    return BYTE_ARRAY_ID;
  }

  toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.tag]), toBytesU32(this.size)]);
  }

  toJSON(): { [BYTE_ARRAY_ID]: number } {
    return {
      [BYTE_ARRAY_ID]: this.size
    };
  }
}
