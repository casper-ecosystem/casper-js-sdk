import { Result, Ok, Err, Option } from 'ts-results';
import { concat } from '@ethersproject/bytes';
import { BigNumberish } from '@ethersproject/bignumber';

import { toBytesArrayU8 } from '../ByteConverters';
import { CLErrorCodes, CLTypeTag } from './constants';

import { matchTypeToCLType, matchBytesToCLType, matchByteParserByCLType } from './utils';

import {
  CLBool,
  // CLU8,
  // CLU32,
  // CLU64,
  // CLU128,
  // CLU256,
  // CLU512,
  // CLI32,
  // CLI64,
  // CLKey,
  // CLKeyParameters,
  // CLUnit,
  // CLString,
  // CLURef,
  // AccessRights,
  // CLPublicKey,
  // CLPublicKeyTag,
  // CLList,
  // CLTuple1,
  // CLTuple2,
  // CLTuple3,
  // CLOption,
  // CLMap,
  // CLByteArray
} from './index';

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
}

export abstract class ToBytes {
  abstract toBytes(): ToBytesResult;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
  abstract bytesParser: CLValueBytesParser;
}

export class CLValueBuilder {
  static bool = (val: boolean): CLBool => {
    return new CLBool(val);
  };

  // static u8 = (val: BigNumberish): CLU8 => {
  //   return new CLU8(val);
  // };

  // static u32 = (val: BigNumberish): CLU32 => {
  //   return new CLU32(val);
  // };

  // static i32 = (val: BigNumberish): CLI32 => {
  //   return new CLI32(val);
  // };

  // static u64 = (val: BigNumberish): CLU64 => {
  //   return new CLU64(val);
  // };

  // static i64 = (val: BigNumberish): CLI64 => {
  //   return new CLI64(val);
  // };

  // static u128 = (val: BigNumberish): CLU128 => {
  //   return new CLU128(val);
  // };

  // static u256 = (val: BigNumberish): CLU256 => {
  //   return new CLU256(val);
  // };

  // static u512 = (val: BigNumberish): CLU512 => {
  //   return new CLU256(val);
  // };

  // static unit = (): CLUnit => {
  //   return new CLUnit();
  // };

  // static string = (val: string): CLString => {
  //   return new CLString(val);
  // };

  // static key = (val: CLKeyParameters): CLKey => {
  //   return new CLKey(val);
  // };

  // static uref = (val: Uint8Array, accessRights: AccessRights): CLURef => {
  //   return new CLURef(val, accessRights);
  // };

  // static list<T extends CLValue>(val: T[]): CLList<T> {
  //   return new CLList(val);
  // }

  // static tuple1<T extends CLValue>(t0: T): CLTuple1 {
  //   return new CLTuple1([t0]);
  // }

  // static tuple2<T extends CLValue>(t0: T, t1: T): CLTuple2 {
  //   return new CLTuple2([t0, t1]);
  // }

  // static tuple3<T extends CLValue>(t0: T, t1: T, t2: T): CLTuple3 {
  //   return new CLTuple3([t0, t1, t2]);
  // }

  // static option(data: Option<CLValue>, innerType?: CLType): CLOption<CLValue> {
  //   return new CLOption(data, innerType);
  // }

  // static map<K extends CLValue, V extends CLValue>(
  //   val: [K, V][] | [CLType, CLType]
  // ): CLMap<K, V> {
  //   return new CLMap(val);
  // }

  // static publicKey(rawPublicKey: Uint8Array, tag: CLPublicKeyTag): CLPublicKey {
  //   return new CLPublicKey(rawPublicKey, tag);
  // }

  // static byteArray(bytes: Uint8Array): CLByteArray {
  //   return new CLByteArray(bytes);
  // }

  static fromJSON(json: any): Result<CLValue, string> {
    const clType = matchTypeToCLType(json.cl_type);
    const uint8bytes = decodeBase16(json.bytes);
    const clEntity = CLValueBuilder.fromBytes(uint8bytes, clType).unwrap();
    return Ok(clEntity as CLValue);
  }

  static toJSON(value: CLValue): Result<CLJSONFormat, CLErrorCodes> {
    const rawBytes= CLValueBuilder.toBytes(value).unwrap();
    const bytes = encodeBase16(rawBytes);
    const clType = value.clType().toJSON();
    return Ok({ bytes: bytes, cl_type: clType });
  }


  static toBytes(value: CLValue): ToBytesResult {
    const parser = matchByteParserByCLType(value.clType()).unwrap(); //value.bytesParser.toBytes(value);
    return parser.toBytes(value);
  }

  static fromBytes(bytes: Uint8Array, type: CLType): Result<CLValue, CLErrorCodes>{
    const parser = matchByteParserByCLType(type).unwrap();
    return parser.fromBytes(bytes, type);
  }
}

export abstract class CLValueBytesParser {
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
