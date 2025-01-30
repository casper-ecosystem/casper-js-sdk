import { BigNumberish } from '@ethersproject/bignumber';

import {
  CLType,
  CLTypeAny,
  CLTypeBool,
  CLTypeByteArray,
  CLTypeDynamic,
  CLTypeInt32,
  CLTypeInt64,
  CLTypeKey,
  CLTypeList,
  CLTypeMap,
  CLTypeOption,
  CLTypePublicKey,
  CLTypeResult,
  CLTypeString,
  CLTypeTuple1,
  CLTypeTuple2,
  CLTypeTuple3,
  CLTypeUInt128,
  CLTypeUInt256,
  CLTypeUInt32,
  CLTypeUInt512,
  CLTypeUInt64,
  CLTypeUInt8,
  CLTypeUnit,
  CLTypeUref,
  TypeID
} from './cltype';
import { URef, Key } from '../key';
import { PublicKey } from '../keypair';
import {
  CLValueUInt8,
  CLValueInt64,
  CLValueInt32,
  CLValueUInt32,
  CLValueUInt64,
  CLValueUInt128,
  CLValueUInt256,
  CLValueUInt512
} from './Numeric';
import { CLValueBool } from './Bool';
import { CLValueUnit } from './Unit';
import { CLValueOption } from './Option';
import { CLValueList } from './List';
import { CLValueByteArray } from './ByteArray';
import { CLValueResult } from './Result';
import { CLValueString } from './String';
import { CLValueMap } from './Map';
import { CLValueTuple1 } from './Tuple1';
import { CLValueTuple2 } from './Tuple2';
import { CLValueTuple3 } from './Tuple3';
import { CLValueAny } from './Any';

/**
 * Interface representing a value that can be converted to bytes and a string.
 */
interface IValue {
  bytes(): Uint8Array;
  toString(): string;
  toJSON(): any;
}

export interface IResultWithBytes<T> {
  result: T;
  bytes: Uint8Array;
}

/**
 * Represents a CLValue in the Casper type system.
 * CLValue is a container for various types of values used in smart contracts.
 */
export class CLValue {
  public type: CLType;
  public bool?: CLValueBool;
  public i32?: CLValueInt32;
  public i64?: CLValueInt64;
  public ui8?: CLValueUInt8;
  public ui32?: CLValueUInt32;
  public ui64?: CLValueUInt64;
  public ui128?: CLValueUInt128;
  public ui256?: CLValueUInt256;
  public ui512?: CLValueUInt512;
  public unit?: CLValueUnit;
  public uref?: URef;
  public key?: Key;
  public option?: CLValueOption;
  public list?: CLValueList;
  public byteArray?: CLValueByteArray;
  public result?: CLValueResult;
  public stringVal?: CLValueString;
  public map?: CLValueMap;
  public tuple1?: CLValueTuple1;
  public tuple2?: CLValueTuple2;
  public tuple3?: CLValueTuple3;
  public any?: CLValueAny;
  public publicKey?: PublicKey;

  /**
   * Initializes a new CLValue instance.
   * @param type - The CLType of the value.
   */
  constructor(type: CLType) {
    this.type = type;
  }

  /**
   * Gets the actual type of the CLValue, resolving dynamic types if necessary.
   * @returns The CLType of the value.
   */
  public getType(): CLType {
    return this.type instanceof CLTypeDynamic ? this.type.inner : this.type;
  }

  /**
   * Returns a string representation of the CLValue.
   * @returns A string representation of the value.
   */
  public toString(): string {
    return this.getValueByType().toString();
  }

  public toJSON(): any {
    return this.getValueByType().toJSON();
  }

  /**
   * Converts the CLValue to its byte representation.
   * @returns A Uint8Array representing the bytes of the value.
   */
  public bytes(): Uint8Array {
    return this.getValueByType().bytes();
  }

  /**
   * Retrieves the value associated with the CLValue's type.
   * @returns An IValue representing the actual value stored in the CLValue.
   * @throws Error if the type is not implemented.
   */
  private getValueByType(): IValue {
    switch (this.type.getTypeID()) {
      case TypeID.Bool:
        return this.bool!;
      case TypeID.I32:
        return this.i32!;
      case TypeID.I64:
        return this.i64!;
      case TypeID.U8:
        return this.ui8!;
      case TypeID.U32:
        return this.ui32!;
      case TypeID.U64:
        return this.ui64!;
      case TypeID.U128:
        return this.ui128!;
      case TypeID.U256:
        return this.ui256!;
      case TypeID.U512:
        return this.ui512!;
      case TypeID.Unit:
        return this.unit!;
      case TypeID.String:
        return this.stringVal!;
      case TypeID.Key:
        return this.key!;
      case TypeID.URef:
        return this.uref!;
      case TypeID.Option:
        return this.option!;
      case TypeID.List:
        return this.list!;
      case TypeID.ByteArray:
        return this.byteArray!;
      case TypeID.Result:
        return this.result!;
      case TypeID.Map:
        return this.map!;
      case TypeID.Tuple1:
        return this.tuple1!;
      case TypeID.Tuple2:
        return this.tuple2!;
      case TypeID.Tuple3:
        return this.tuple3!;
      case TypeID.Any:
        return this.any!;
      case TypeID.PublicKey:
        return this.publicKey!;
      default:
        throw new Error(
          'Type in getValueByType method of CLValue is not implemented'
        );
    }
  }

  /**
   * Retrieves the Key value from the CLValue.
   * @returns The Key stored in the CLValue.
   * @throws Error if the Key property is empty.
   */
  public getKey(): Key {
    if (!this.key) {
      throw new Error(
        `Key property is empty in CLValue, type is ${this.type.toString()}`
      );
    }
    return this.key;
  }

  /**
   * Creates a new CLValue instance containing a Key value.
   * @param data - The Key to be stored in the CLValue.
   * @returns A new CLValue instance encapsulating the Key.
   */
  public static newCLKey(data: Key): CLValue {
    const clValue = new CLValue(CLTypeKey);
    clValue.key = data;
    return clValue;
  }

  /**
   * Creates a new CLValue instance containing a URef value.
   * @param data - The URef to be stored in the CLValue.
   * @returns A new CLValue instance encapsulating the URef.
   */
  public static newCLUref(data: URef): CLValue {
    const clValue = new CLValue(CLTypeUref);
    clValue.uref = data;
    return clValue;
  }

  /**
   * Creates a new CLValue instance containing a PublicKey value.
   * @param data - The PublicKey to be stored in the CLValue.
   * @returns A new CLValue instance encapsulating the PublicKey.
   */
  public static newCLPublicKey(data: PublicKey): CLValue {
    const clValue = new CLValue(CLTypePublicKey);
    clValue.publicKey = data;
    return clValue;
  }

  /**
   * Creates a new CLValue instance containing an 'Any' value.
   * @param data - The Uint8Array to be stored within the CLValue.
   * @returns A new CLValue instance encapsulating the 'Any' value.
   */
  public static newCLAny(data: Uint8Array): CLValue {
    const res = new CLValue(CLTypeAny);
    res.any = new CLValueAny(data);
    return res;
  }

  /**
   * Creates a new CLValue instance containing a boolean value.
   * @param val - The boolean value to be stored in the CLValue.
   * @returns A new CLValue instance encapsulating the boolean value.
   */
  public static newCLValueBool(val: boolean): CLValue {
    const res = new CLValue(CLTypeBool);
    res.bool = new CLValueBool(val);
    return res;
  }

  /**
   * Creates a new CLValue instance containing a ByteArray value.
   * @param val - The Uint8Array to be stored within the CLValue.
   * @returns A new CLValue instance encapsulating the ByteArray.
   */
  public static newCLByteArray(val: Uint8Array): CLValue {
    const byteArrayType = new CLTypeByteArray(val.length);
    const clValueByteArray = new CLValue(byteArrayType);

    clValueByteArray.byteArray = new CLValueByteArray(val);
    return clValueByteArray;
  }

  /**
   * Creates a new CLValue instance with a List value.
   * @param elementType - The CLType for the elements of the list.
   * @param elements - Optional array of CLValues to initialize the list with.
   * @returns A new CLValue instance containing CLTypeList and a CLValueList.
   */
  public static newCLList(
    elementType: CLType,
    elements: CLValue[] = []
  ): CLValue {
    const listType = new CLTypeList(elementType);
    const clValue = new CLValue(listType);
    clValue.list = new CLValueList(listType, elements);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a Map value.
   * @param keyType - The CLType for the map keys.
   * @param valType - The CLType for the map values.
   * @returns A new CLValue instance with CLTypeMap and a CLValueMap.
   */
  public static newCLMap(keyType: CLType, valType: CLType): CLValue {
    const mapType = new CLTypeMap(keyType, valType);
    const clValue = new CLValue(mapType);
    clValue.map = new CLValueMap(mapType);
    return clValue;
  }

  /**
   * Creates a new `CLValue` instance that represents an optional value.
   *
   * This method allows you to wrap a given `CLValue` as an optional type (`Option`),
   * which can either contain a value or be `null`. This is useful for scenarios where
   * a value may or may not be present.
   *
   * If `inner` is `null`, the method will use the provided `clType` as the type of the option.
   * If `clType` is not provided, it defaults to `CLTypeAny`. If `inner` is not `null`,
   * its type is used instead of `clType`.
   *
   * @param inner - The `CLValue` to be wrapped in the option. Pass `null` if no value is present.
   * @param clType - (Optional) The `CLType` representing the type of the value contained in the option.
   *                 This is required if `inner` is `null` to properly define the option type.
   *
   * @returns A new `CLValue` instance containing:
   * - A `CLTypeOption` representing the type of the optional value.
   * - A `CLValueOption` that holds the inner value or `null`.
   *
   * @example
   * ```typescript
   * // Example of an option containing a value
   * const innerValue = CLValue.fromU32(42);
   * const optionValue = CLValue.newCLOption(innerValue);
   *
   * // Example of an empty option with an explicitly defined type
   * const emptyOptionValue = CLValue.newCLOption(null, CLType.U32);
   *
   * // Example of an empty option with no type provided (defaults to CLTypeAny)
   * const emptyOptionValueDefault = CLValue.newCLOption(null);
   * ```
   */
  public static newCLOption(inner: CLValue | null, clType?: CLType): CLValue {
    const clTypeForOption = inner === null ? clType || CLTypeAny : inner.type;
    const optionType = new CLTypeOption(clTypeForOption);
    const clValue = new CLValue(optionType);
    clValue.option = new CLValueOption(inner, optionType);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a Result value.
   * @param innerOk - The CLType for the success case.
   * @param innerErr - The CLType for the error case.
   * @param value - The CLValue to be contained in the Result.
   * @param isSuccess - A boolean indicating whether the Result is a success (true) or an error (false).
   * @returns A new CLValue instance containing CLTypeResult and a CLValueResult.
   */
  public static newCLResult(
    innerOk: CLType,
    innerErr: CLType,
    value: CLValue,
    isSuccess: boolean
  ): CLValue {
    const resultType = new CLTypeResult(innerOk, innerErr);
    const clValue = new CLValue(resultType);
    clValue.result = new CLValueResult(resultType, isSuccess, value);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a string value.
   * @param val - The string value to be represented.
   * @returns A new CLValue instance containing CLTypeString and a CLValueString.
   */
  public static newCLString(val: string): CLValue {
    const res = new CLValue(CLTypeString);
    res.stringVal = new CLValueString(val);
    return res;
  }

  /**
   * Creates a new CLValue instance with a Tuple1 value.
   * @param val - The CLValue to be contained in the tuple.
   * @returns A new CLValue instance containing CLTypeTuple1 and a CLValueTuple1.
   */
  public static newCLTuple1(val: CLValue): CLValue {
    const tupleType = new CLTypeTuple1(val.type);
    const clValue = new CLValue(tupleType);
    clValue.tuple1 = new CLValueTuple1(tupleType, val);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a Tuple2 value.
   * @param val1 - The first CLValue in the tuple.
   * @param val2 - The second CLValue in the tuple.
   * @returns A new CLValue instance containing CLTypeTuple2 and a CLValueTuple2.
   */
  public static newCLTuple2(val1: CLValue, val2: CLValue): CLValue {
    const tupleType = new CLTypeTuple2(val1.type, val2.type);
    const clValue = new CLValue(tupleType);
    clValue.tuple2 = new CLValueTuple2(tupleType, val1, val2);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a Tuple3 value.
   * @param val1 - The first CLValue in the tuple.
   * @param val2 - The second CLValue in the tuple.
   * @param val3 - The third CLValue in the tuple.
   * @returns A new CLValue instance containing CLTypeTuple3 and a CLValueTuple3.
   */
  public static newCLTuple3(
    val1: CLValue,
    val2: CLValue,
    val3: CLValue
  ): CLValue {
    const tupleType = new CLTypeTuple3(val1.type, val2.type, val3.type);
    const clValue = new CLValue(tupleType);
    clValue.tuple3 = new CLValueTuple3(tupleType, val1, val2, val3);
    return clValue;
  }

  /**
   * Creates a new CLValue instance with a Unit value.
   *
   * @returns A new CLValue instance with CLTypeUnit and a CLValueUnit.
   */
  public static newCLUnit(): CLValue {
    const res = new CLValue(CLTypeUnit);
    res.unit = new CLValueUnit();
    return res;
  }

  /**
   * Creates a new CLValue instance with an Int32 value.
   * @param val - The 32-bit integer to be encapsulated in a CLValue.
   * @returns A new CLValue instance containing CLTypeInt32 and a CLValueInt32.
   */
  public static newCLInt32(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeInt32);
    res.i32 = new CLValueInt32(val);
    return res;
  }

  /**
   * Creates a new CLValue instance with an Int64 value.
   * @param val - The value to be stored in the Int64. Accepts any BigNumberish type.
   * @returns A new CLValue instance containing CLTypeInt64 and a CLValueInt64.
   */
  public static newCLInt64(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeInt64);
    res.i64 = new CLValueInt64(val);
    return res;
  }

  /**
   * Creates a new CLValue instance with a UInt8 value.
   * @param value - The value to initialize the UInt8 with. Must be an integer between 0 and 255.
   * @returns A new CLValue instance containing CLTypeUInt8 and a CLValueUInt8.
   */
  public static newCLUint8(value: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt8);
    res.ui8 = new CLValueUInt8(value);
    return res;
  }

  /**
   * Creates a new CLValue instance with a UInt32 value.
   * @param value - The value to initialize the UInt32 with.
   * @returns A new CLValue instance containing CLTypeUInt32 and a CLValueUInt32.
   */
  public static newCLUInt32(value: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt32);
    res.ui32 = new CLValueUInt32(value);
    return res;
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
   * Creates a new CLValue instance with a UInt512 value.
   * @param value - The value to initialize the UInt512 with.
   * @returns A new CLValue instance containing CLTypeUInt512 and a CLValueUInt512.
   */
  public static newCLUInt512(value: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt512);
    res.ui512 = new CLValueUInt512(value);
    return res;
  }
}
