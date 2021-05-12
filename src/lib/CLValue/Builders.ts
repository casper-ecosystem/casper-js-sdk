import { BigNumberish } from '@ethersproject/bignumber';
import { Option } from 'ts-results';

import {
  CLValue,
  CLType,
  CLBool,
  CLBoolType,
  CLU8,
  CLU8Type,
  CLU32,
  CLU32Type,
  CLU64,
  CLU64Type,
  CLU128,
  CLU128Type,
  CLU256,
  CLU256Type,
  CLU512,
  CLU512Type,
  CLI32,
  CLI32Type,
  CLI64,
  CLI64Type,
  CLKey,
  CLKeyType,
  CLKeyParameters,
  CLUnit,
  CLUnitType,
  CLString,
  CLStringType,
  CLURef,
  CLURefType,
  AccessRights,
  CLPublicKey,
  CLPublicKeyType,
  CLPublicKeyTag,
  CLList,
  CLListType,
  CLTuple1,
  CLTuple1Type,
  CLTuple2,
  CLTuple2Type,
  CLTuple3,
  CLTuple3Type,
  CLOption,
  CLOptionType,
  CLMap,
  CLMapType,
  CLByteArray,
  CLByteArrayType
} from './index';

export class CLTypeBuilder {
  static bool = (): CLBoolType => {
    return new CLBoolType();
  };

  static u8 = (): CLU8Type => {
    return new CLU8Type();
  };

  static u32 = (): CLU32Type => {
    return new CLU32Type();
  };

  static i32 = (): CLI32Type => {
    return new CLI32Type();
  };

  static u64 = (): CLU64Type => {
    return new CLU64Type();
  };

  static i64 = (): CLI64Type => {
    return new CLI64Type();
  };

  static u128 = (): CLU128Type => {
    return new CLU128Type();
  };

  static u256 = (): CLU256Type => {
    return new CLU256Type();
  };

  static u512 = (): CLU512Type => {
    return new CLU256Type();
  };

  static unit = (): CLUnitType => {
    return new CLUnitType();
  };

  static string = (): CLStringType => {
    return new CLStringType();
  };

  static key = (): CLKeyType => {
    return new CLKeyType();
  };

  static uref = (): CLURefType => {
    return new CLURefType();
  };

  static list<T extends CLType>(val: T): CLListType<T> {
    return new CLListType(val);
  }

  static tuple1<T extends CLType>(types: [T]): CLTuple1Type {
    return new CLTuple1Type(types);
  }

  static tuple2<T extends CLType>(types: [T, T]): CLTuple2Type {
    return new CLTuple2Type(types);
  }

  static tuple3<T extends CLType>(types: [T, T, T]): CLTuple3Type {
    return new CLTuple3Type(types);
  }

  static option<T extends CLType>(type: T): CLOptionType<T> {
    return new CLOptionType(type);
  }

  static map<K extends CLType, V extends CLType>(val: [K, V]): CLMapType<K, V> {
    return new CLMapType(val);
  }

  static publicKey(): CLPublicKeyType {
    return new CLPublicKeyType();
  }

  static byteArray(size: number): CLByteArrayType {
    return new CLByteArrayType(size);
  }
}

export class CLValueBuilder {
  static bool = (val: boolean): CLBool => {
    return new CLBool(val);
  };

  static u8 = (val: BigNumberish): CLU8 => {
    return new CLU8(val);
  };

  static u32 = (val: BigNumberish): CLU32 => {
    return new CLU32(val);
  };

  static i32 = (val: BigNumberish): CLI32 => {
    return new CLI32(val);
  };

  static u64 = (val: BigNumberish): CLU64 => {
    return new CLU64(val);
  };

  static i64 = (val: BigNumberish): CLI64 => {
    return new CLI64(val);
  };

  static u128 = (val: BigNumberish): CLU128 => {
    return new CLU128(val);
  };

  static u256 = (val: BigNumberish): CLU256 => {
    return new CLU256(val);
  };

  static u512 = (val: BigNumberish): CLU512 => {
    return new CLU256(val);
  };

  static unit = (): CLUnit => {
    return new CLUnit();
  };

  static string = (val: string): CLString => {
    return new CLString(val);
  };

  static key = (val: CLKeyParameters): CLKey => {
    return new CLKey(val);
  };

  static uref = (val: Uint8Array, accessRights: AccessRights): CLURef => {
    return new CLURef(val, accessRights);
  };

  static list<T extends CLValue>(val: T[]): CLList<T> {
    return new CLList(val);
  }

  static tuple1<T extends CLValue>(t0: T): CLTuple1 {
    return new CLTuple1([t0]);
  }

  static tuple2<T extends CLValue>(t0: T, t1: T): CLTuple2 {
    return new CLTuple2([t0, t1]);
  }

  static tuple3<T extends CLValue>(t0: T, t1: T, t2: T): CLTuple3 {
    return new CLTuple3([t0, t1, t2]);
  }

  static option(data: Option<CLValue>, innerType?: CLType): CLOption<CLValue> {
    return new CLOption(data, innerType);
  }

  static map<K extends CLValue, V extends CLValue>(
    val: [K, V][] | [CLType, CLType]
  ): CLMap<K, V> {
    return new CLMap(val);
  }

  static publicKey(rawPublicKey: Uint8Array, tag: CLPublicKeyTag): CLPublicKey {
    return new CLPublicKey(rawPublicKey, tag);
  }

  static byteArray(bytes: Uint8Array): CLByteArray {
    return new CLByteArray(bytes);
  }
}
