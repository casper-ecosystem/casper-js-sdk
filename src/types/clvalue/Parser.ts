import { concat } from '@ethersproject/bytes';

import { CLValue, IResultWithBytes } from './CLValue';
import { Key, URef } from '../key';
import { PublicKey } from '../keypair';
import {
  CLType,
  CLTypeByteArray,
  CLTypeList,
  CLTypeMap,
  CLTypeOption,
  CLTypeParser,
  CLTypeResult,
  CLTypeTuple1,
  CLTypeTuple2,
  CLTypeTuple3,
  TypeID
} from './cltype';
import { CLValueUInt32 } from './Uint32';
import { CLValueBool } from './Bool';
import { CLValueAny } from './Any';
import { CLValueUnit } from './Unit';
import { CLValueString } from './String';
import { CLValueUInt512 } from './Uint512';
import { CLValueUInt256 } from './Uint256';
import { CLValueUInt128 } from './Uint128';
import { CLValueUInt64 } from './Uint64';
import { CLValueUInt8 } from './Uint8';
import { CLValueInt32 } from './Int32';
import { CLValueInt64 } from './Int64';
import { CLValueOption } from './Option';
import { CLValueList } from './List';
import { CLValueByteArray } from './ByteArray';
import { CLValueResult } from './Result';
import { CLValueMap } from './Map';
import { CLValueTuple1 } from './Tuple1';
import { CLValueTuple2 } from './Tuple2';
import { CLValueTuple3 } from './Tuple3';
import { Conversions } from '../Conversions';
import { toBytesArrayU8 } from '../ByteConverters';

/**
 * Error thrown when an unsupported CLType is encountered.
 */
export const ErrUnsupportedCLType = new Error(
  'buffer constructor is not found'
);

/**
 * A utility class for parsing CLValues from various formats, including JSON and byte arrays.
 */
export class CLValueParser {
  /**
   * Parses a CLValue from a JSON representation.
   * @param json - The JSON object representing a CLValue.
   * @returns A CLValue instance parsed from the JSON.
   */
  public static fromJSON(json: any): CLValue {
    const clType = CLTypeParser.fromInterface(json.cl_type);

    const clEntity = this.fromBytesByType(
      Conversions.decodeBase16(json.bytes),
      clType
    );

    return clEntity?.result;
  }

  /**
   * Converts a CLValue to its JSON representation.
   * @param value - The CLValue to convert.
   * @returns An object with 'bytes' and 'cl_type' properties representing the CLValue.
   */
  public static toJSON(value: CLValue) {
    const rawBytes = value.bytes();
    const bytes = Conversions.encodeBase16(rawBytes);
    const clType = value.type.toJSON();

    return {
      bytes,
      cl_type: clType
    };
  }

  /**
   * Serializes a CLValue to bytes, including its type information.
   * @param value - The CLValue to serialize.
   * @returns A Uint8Array containing the serialized CLValue with type information.
   */
  static toBytesWithType(value: CLValue): Uint8Array {
    const clTypeBytes = value.getType().toBytes();
    const bytes = value.bytes();
    return concat([toBytesArrayU8(bytes), clTypeBytes]);
  }

  /**
   * Parses a CLValue from a Uint8Array given its type.
   * @param bytes - The Uint8Array containing the serialized CLValue.
   * @param sourceType - The CLType of the value to parse.
   * @returns An object containing the parsed CLValue and any remaining bytes.
   * @throws {ErrUnsupportedCLType} If an unsupported CLType is encountered.
   */
  public static fromBytesByType(
    bytes: Uint8Array,
    sourceType: CLType
  ): IResultWithBytes<CLValue> {
    const result = new CLValue(sourceType);
    const typeID = sourceType.getTypeID();

    switch (typeID) {
      case TypeID.Bool:
        const boolValue = CLValueBool.fromBytes(bytes);
        result.bool = boolValue?.result;
        return { result, bytes: boolValue.bytes };
      case TypeID.I32:
        const i32 = CLValueInt32.fromBytes(bytes);
        result.i32 = i32.result;
        return { result, bytes: i32?.bytes };
      case TypeID.I64:
        const i64 = CLValueInt64.fromBytes(bytes);
        result.i64 = i64?.result;
        return { result, bytes: i64?.bytes };
      case TypeID.U8:
        const u8 = CLValueUInt8.fromBytes(bytes);
        result.ui8 = u8?.result;
        return { result, bytes: u8?.bytes };
      case TypeID.U32:
        const u32 = CLValueUInt32.fromBytes(bytes);
        result.ui32 = u32?.result;
        return { result, bytes: u32?.bytes };
      case TypeID.U64:
        const u64 = CLValueUInt64.fromBytes(bytes);
        result.ui64 = u64?.result;
        return { result, bytes: u64?.bytes };
      case TypeID.U128:
        const u128 = CLValueUInt128.fromBytes(bytes);
        result.ui128 = u128?.result;
        return { result, bytes: u128?.bytes };
      case TypeID.U256:
        const u256 = CLValueUInt256.fromBytes(bytes);
        result.ui256 = u256?.result;
        return { result, bytes: u256?.bytes };
      case TypeID.U512:
        const u512 = CLValueUInt512.fromBytes(bytes);
        result.ui512 = u512?.result;
        return { result, bytes: u512?.bytes };
      case TypeID.String:
        const stringValue = CLValueString.fromBytes(bytes);
        result.stringVal = stringValue.result;
        return { result, bytes: stringValue?.bytes };
      case TypeID.Unit:
        const unit = CLValueUnit.fromBytes(bytes);
        result.unit = unit?.result;
        return { result, bytes: unit?.bytes };
      case TypeID.Key:
        const key = Key.fromBytes(bytes);
        result.key = key?.result;
        return { result, bytes: key?.bytes };
      case TypeID.URef:
        const uref = URef.fromBytes(bytes);
        result.uref = uref?.result;
        return { result, bytes: uref?.bytes };
      case TypeID.Any:
        result.any = new CLValueAny(bytes);
        return { result, bytes };
      case TypeID.PublicKey:
        const pubKey = PublicKey.fromBytes(bytes);
        result.publicKey = pubKey?.result;
        return { result, bytes: pubKey?.bytes };
      case TypeID.Option:
        const optionType = CLValueOption.fromBytes(
          bytes,
          sourceType as CLTypeOption
        );
        result.option = optionType?.result;
        return { result, bytes: optionType?.bytes };
      case TypeID.List:
        const listType = CLValueList.fromBytes(bytes, sourceType as CLTypeList);
        result.list = listType?.result;
        return { result, bytes: listType?.bytes };
      case TypeID.ByteArray:
        const byteArrayType = CLValueByteArray.fromBytes(
          bytes,
          sourceType as CLTypeByteArray
        );
        result.byteArray = byteArrayType?.result;
        return { result, bytes: byteArrayType?.bytes };
      case TypeID.Result:
        const resultType = CLValueResult.fromBytes(
          bytes,
          sourceType as CLTypeResult
        );
        result.result = resultType?.result;
        return { result, bytes: resultType?.bytes };
      case TypeID.Map:
        const mapType = CLValueMap.fromBytes(bytes, sourceType as CLTypeMap);
        result.map = mapType?.result;
        return { result, bytes: mapType?.bytes };
      case TypeID.Tuple1:
        const tuple1 = CLValueTuple1.fromBytes(
          bytes,
          sourceType as CLTypeTuple1
        );
        result.tuple1 = tuple1.result;
        return { result, bytes: tuple1?.bytes };
      case TypeID.Tuple2:
        const tuple2 = CLValueTuple2.fromBytes(
          bytes,
          sourceType as CLTypeTuple2
        );
        result.tuple2 = tuple2?.result;
        return { result, bytes: tuple2?.bytes };
      case TypeID.Tuple3:
        const tuple3 = CLValueTuple3.fromBytes(
          bytes,
          sourceType as CLTypeTuple3
        );
        result.tuple3 = tuple3?.result;
        return { result, bytes: tuple3?.bytes };
      // case TypeID.Dynamic:
      //   const typeData = CLTypeParser.matchBytesToCLType(bytes);
      //   result.type = new CLTypeDynamic(
      //     typeData.result?.getTypeID(),
      //     typeData?.result
      //   );
      //   return { result, bytes: typeData?.bytes };
      default:
        throw ErrUnsupportedCLType;
    }
  }

  /**
   * Parses a `Uint8Array` to extract a `CLValue` with its corresponding type.
   *
   * This method takes a byte array and interprets it as a `CLValue` by first extracting
   * the length of the value, then splitting the bytes into the value's data and its type.
   *
   * @param bytes - The byte array to be parsed.
   * @returns An `IResultWithBytes<CLValue>` containing the parsed `CLValue` and its remaining bytes.
   * @throws Error - If the length of the value extracted from the bytes is invalid.
   *
   * ### Example
   * ```typescript
   * const bytes = new Uint8Array([...]); // Provide valid CLValue bytes
   * const result = CLValueParser.fromBytesWithType(bytes);
   * console.log(result.result); // Parsed CLValue
   * ```
   */
  public static fromBytesWithType(
    bytes: Uint8Array
  ): IResultWithBytes<CLValue> {
    const u32 = CLValueUInt32.fromBytes(bytes);
    const length = u32.result.getValue().toNumber();

    if (!length) {
      throw new Error(`Invalid length for bytes: ${length}`);
    }

    const valueBytes = u32.bytes.subarray(0, length);
    const typeBytes = u32.bytes.subarray(length);
    const clType = CLTypeParser.matchBytesToCLType(typeBytes);
    return this.fromBytesByType(valueBytes, clType.result);
  }
}
