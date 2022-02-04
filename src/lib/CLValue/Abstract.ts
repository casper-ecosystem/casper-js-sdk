import { Result, Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import { toBytesArrayU8 } from '../ByteConverters';
import { CLErrorCodes, CLTypeTag } from './constants';

import {
  matchTypeToCLType,
  matchBytesToCLType,
  matchByteParserByCLType
} from './utils';

import { CLU32BytesParser } from './index';

import { encodeBase16, decodeBase16 } from '../Conversions';

export interface ResultAndRemainder<T, E> {
  result: Result<T, E>;
  remainder?: Uint8Array;
}

export interface CLJSONFormat {
  bytes: string;
  cl_type: any;
}

export type ToBytesResult = Result<Uint8Array, CLErrorCodes>;

export const resultHelper = <T, E>(
  arg1: Result<T, E>,
  arg2?: Uint8Array
): ResultAndRemainder<T, E> => {
  return { result: arg1, remainder: arg2 };
};

export abstract class CLType {
  abstract toString(): string;
  abstract toJSON(): any;
  abstract linksTo: any;
  abstract tag: CLTypeTag;

  toBytes(): Uint8Array {
    return Uint8Array.from([this.tag]);
  }
}

export abstract class ToBytes {
  abstract toBytes(): ToBytesResult;
}

export abstract class CLValue {
  isCLValue(): boolean {
    return true;
  }
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
}

export class CLValueParsers {
  static fromJSON(json: any): Result<CLValue, string> {
    const clType = matchTypeToCLType(json.cl_type);
    const uint8bytes = decodeBase16(json.bytes);
    const clEntity = CLValueParsers.fromBytes(uint8bytes, clType).unwrap();
    return Ok(clEntity as CLValue);
  }

  static fromBytes(
    bytes: Uint8Array,
    type: CLType
  ): Result<CLValue, CLErrorCodes> {
    const parser = matchByteParserByCLType(type).unwrap();
    return parser.fromBytes(bytes, type);
  }

  static toJSON(value: CLValue): Result<CLJSONFormat, CLErrorCodes> {
    const rawBytes = CLValueParsers.toBytes(value).unwrap();
    const bytes = encodeBase16(rawBytes);
    const clType = value.clType().toJSON();
    return Ok({ bytes: bytes, cl_type: clType });
  }

  static toBytes(value: CLValue): ToBytesResult {
    const parser = matchByteParserByCLType(value.clType()).unwrap();
    return parser.toBytes(value);
  }

  static toBytesWithType(value: CLValue): Result<Uint8Array, CLErrorCodes> {
    const clTypeBytes = value.clType().toBytes();
    const parser = matchByteParserByCLType(value.clType()).unwrap();
    const bytes = parser.toBytes(value).unwrap();
    const result = concat([toBytesArrayU8(bytes), clTypeBytes]);
    return Ok(result);
  }

  static fromBytesWithType(
    rawBytes: Uint8Array
  ): Result<CLValue, CLErrorCodes> {
    const {
      result: CLU32res,
      remainder: CLU32rem
    } = new CLU32BytesParser().fromBytesWithRemainder(rawBytes);

    const length = CLU32res.unwrap()
      .value()
      .toNumber();

    if (!CLU32rem) {
      return Err(CLErrorCodes.EarlyEndOfStream);
    }
    const valueBytes = CLU32rem.subarray(0, length);
    const typeBytes = CLU32rem.subarray(length);
    const { result: clType } = matchBytesToCLType(typeBytes);

    const parser = matchByteParserByCLType(clType.unwrap()).unwrap();

    const clValue = parser.fromBytes(valueBytes, clType.unwrap()).unwrap();

    return Ok(clValue as CLValue);
  }
}

export abstract class CLValueBytesParsers {
  fromBytes(
    bytes: Uint8Array,
    innerType: CLType
  ): Result<CLValue, CLErrorCodes> {
    const { result, remainder } = this.fromBytesWithRemainder(bytes, innerType);
    if (remainder && remainder.length) {
      return Err(CLErrorCodes.LeftOverBytes);
    }
    return result;
  }

  abstract fromBytesWithRemainder(
    bytes: Uint8Array,
    innerType?: CLType
  ): ResultAndRemainder<CLValue, CLErrorCodes>;

  abstract toBytes(val: CLValue): ToBytesResult;
}
