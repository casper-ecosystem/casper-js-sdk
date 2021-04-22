import { Result, Ok, Err } from 'ts-results';
// import { concat } from '@ethersproject/bytes';

// import { toBytesArrayU8 } from "../ByteConverters";
import { CLTypeTag } from "./constants";

import { CLErrorCodes } from './index';
import { encodeBase16, decodeBase16 } from '../Conversions';
import { matchTypeToCLType } from './utils';

export abstract class CLType {
  abstract toString(): string;
  abstract toJSON(): any;
  abstract linksTo: any;
  abstract tag: CLTypeTag;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;

  // TBD: Maybe rename it to toRawBytes()
  abstract toBytes(): Result<Uint8Array, CLErrorCodes>;

  static fromBytesWithRemainder: (
    bytes: Uint8Array,
    innerType?: CLType
  ) => ResultAndRemainder<CLValue & ToBytes & FromBytes, CLErrorCodes>;

  static fromBytes(bytes: Uint8Array, innerType?: CLType): Result<CLValue, CLErrorCodes> {
    const { result, remainder } = this.fromBytesWithRemainder(bytes, innerType);
    if (remainder && remainder.length) {
      return Err(CLErrorCodes.LeftOverBytes);
    }
    return result;
  }

  toJSON(): Result<CLJSONFormat, CLErrorCodes> {
    const rawBytes = this.toBytes().unwrap();
    const bytes = encodeBase16(rawBytes);
    const clType = this.clType().toJSON();
    return Ok({ bytes: bytes, cl_type: clType });
  }

  static fromJSON(
    json: CLJSONFormat
  ): Result<CLValue, CLErrorCodes> {
    const uint8bytes = decodeBase16(json.bytes);
    const clTypes = matchTypeToCLType(json.cl_type);
    return this.fromBytes(uint8bytes, clTypes);
  }

  // TBD: Maybe this should be just toBytes()
  // toBytesWithCLType(): Result<Uint8Array, CLErrorCodes> {
  //   const clType = this.clType();
  //   const bytes = this.toBytes().unwrap();
  //   const value = concat([toBytesArrayU8(bytes), 

  // }
}

export abstract class ToBytes {}

export abstract class FromBytes {}

export interface ResultAndRemainder<T, E> {
  result: Result<T, E>;
  remainder?: Uint8Array;
}

export const resultHelper = <T, E>(
  arg1: Result<T, E>,
  arg2?: Uint8Array
): ResultAndRemainder<T, E> => {
  return { result: arg1, remainder: arg2 };
};

export interface CLJSONFormat {
  bytes: string;
  cl_type: any;
}

export type ToBytesResult = Result<Uint8Array, CLErrorCodes>;
