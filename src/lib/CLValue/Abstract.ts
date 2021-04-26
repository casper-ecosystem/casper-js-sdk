import { Result, Ok, Err, Option } from 'ts-results';
import { concat } from '@ethersproject/bytes';
import { BigNumberish } from '@ethersproject/bignumber';

import { toBytesArrayU8 } from '../ByteConverters';
import { CLErrorCodes, CLTypeTag } from './constants';

import { matchTypeToCLType, matchBytesToCLType } from './utils';

import {
  CLBool,
  CLU8,
  CLU32,
  CLU64,
  CLU128,
  CLU256,
  CLU512,
  CLI32,
  CLI64,
  CLKey,
  CLKeyParameters,
  CLUnit,
  CLString,
  CLURef,
  AccessRights,
  CLPublicKey,
  CLPublicKeyTag,
  CLList,
  CLTuple1,
  CLTuple2,
  CLTuple3,
  CLOption,
  CLMap,
  CLByteArray
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

  toBytes(): Uint8Array {
    return Uint8Array.from([this.tag]);
  }
}

export abstract class ToBytes {
  abstract toBytes(): ToBytesResult;
}

export abstract class CLEntity {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;

  abstract toBytes(): Result<Uint8Array, CLErrorCodes>;

  static fromBytesWithRemainder: (
    bytes: Uint8Array,
    innerType?: CLType
  ) => ResultAndRemainder<CLEntity, CLErrorCodes>;

  static fromBytes(
    bytes: Uint8Array,
    innerType?: CLType
  ): Result<CLEntity, CLErrorCodes> {
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

  static fromJSON(json: CLJSONFormat): Result<CLEntity, CLErrorCodes> {
    const uint8bytes = decodeBase16(json.bytes);
    const clTypes = matchTypeToCLType(json.cl_type);
    return this.fromBytes(uint8bytes, clTypes);
  }
}

export class CLValue<T extends CLEntity> implements ToBytes {
  innerEntity: T;

  constructor(innerEntity: T) {
    this.innerEntity = innerEntity;
  }

  toBytes(): Result<Uint8Array, CLErrorCodes> {
    const clTypeBytes = this.innerEntity.clType().toBytes();
    const bytes = this.innerEntity.toBytes().unwrap();
    const value = concat([toBytesArrayU8(bytes), clTypeBytes]);
    return Ok(value);
  }

  static fromBytes(
    rawBytes: Uint8Array
  ): Result<CLValue<CLEntity>, CLErrorCodes> {
    const {
      result: CLU32res,
      remainder: CLU32rem
    } = CLU32.fromBytesWithRemainder(rawBytes);
    const length = CLU32res.unwrap()
      .value()
      .toNumber();
    if (!CLU32rem) {
      return Err(CLErrorCodes.EarlyEndOfStream);
    }
    const valueBytes = CLU32rem.subarray(0, length);
    const typeBytes = CLU32rem.subarray(length);
    const { result: clType } = matchBytesToCLType(typeBytes);

    const clEntity = clType
      .unwrap()
      .linksTo.fromBytes(valueBytes, clType.unwrap())
      .unwrap();

    const clValue = new CLValue(clEntity);

    return Ok(clValue as CLValue<CLEntity>);
  }

  toJSON(): Result<CLJSONFormat, CLErrorCodes> {
    return this.innerEntity.toJSON();
  }

  static fromJSON(json: CLJSONFormat): Result<CLValue<CLEntity>, CLErrorCodes> {
    const clType = matchTypeToCLType(json.cl_type);
    const ref = clType.linksTo;
    const clEntity = ref.fromJSON(json).unwrap();
    const clValue = new CLValue(clEntity);
    return Ok(clValue);
  }

  static bool = (val: boolean): CLValue<CLBool> => {
    return new CLValue(new CLBool(val));
  };

  static u8 = (val: BigNumberish): CLValue<CLU8> => {
    return new CLValue(new CLU8(val));
  };

  static u32 = (val: BigNumberish): CLValue<CLU32> => {
    return new CLValue(new CLU32(val));
  };

  static i32 = (val: BigNumberish): CLValue<CLI32> => {
    return new CLValue(new CLI32(val));
  };

  static u64 = (val: BigNumberish): CLValue<CLU64> => {
    return new CLValue(new CLU64(val));
  };

  static i64 = (val: BigNumberish): CLValue<CLI64> => {
    return new CLValue( new CLI64(val));
  };

  static u128 = (val: BigNumberish): CLValue<CLU128> => {
    return new CLValue(new CLU128(val));
  };

  static u256 = (val: BigNumberish): CLValue<CLU256> => {
    return new CLValue( new CLU256(val));
  };

  static u512 = (val: BigNumberish): CLValue<CLU512> => {
    return new CLValue(new CLU256(val));
  };

  static unit = (): CLValue<CLUnit> => {
    return new CLValue(new CLUnit());
  };

  static string = (val: string): CLValue<CLString> => {
    return new CLValue(new CLString(val));
  };

  static key = (val: CLKeyParameters): CLValue<CLKey> => {
    return new CLValue(new CLKey(val));
  };

  static uref = (val: Uint8Array, accessRights: AccessRights): CLValue<CLURef> => {
    return new CLValue(new CLURef(val, accessRights));
  };

  static list<T extends CLEntity>(val: T[]): CLValue<CLList<T>> {
    return new CLValue( new CLList(val));
  }

  static tuple1<T extends CLEntity>(t0: T): CLValue<CLTuple1> {
    return new CLValue(new CLTuple1([t0]));
  }

  static tuple2<T extends CLEntity>(t0: T, t1: T): CLValue<CLTuple2> {
    return new CLValue(new CLTuple2([t0, t1]));
  }

  static tuple3<T extends CLEntity>(t0: T, t1: T, t2: T): CLValue<CLTuple3> {
    return new CLValue(new CLTuple3([t0, t1, t2]));
  }

  static option(data: Option<CLEntity>, innerType?: CLType): CLValue<CLOption<CLEntity>> {
    return new CLValue(new CLOption(data, innerType));
  }

  static map<K extends CLEntity, V extends CLEntity>(
    val: [K, V][] | [CLType, CLType]
  ): CLValue<CLMap<K, V>> {
    return new CLValue(new CLMap(val));
  }

  static publicKey(rawPublicKey: Uint8Array, tag: CLPublicKeyTag): CLValue<CLPublicKey> {
    return new CLValue(new CLPublicKey(rawPublicKey, tag));
  }

  static byteArray(bytes: Uint8Array): CLValue<CLByteArray> {
    return new CLValue(new CLByteArray(bytes));
  }
}
