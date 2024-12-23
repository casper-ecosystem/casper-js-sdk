import {
  CLType,
  CLTypeDynamic,
  CLTypeKey,
  CLTypePublicKey,
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
}
