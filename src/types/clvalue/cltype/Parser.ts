import {
  TypeID,
  TypeName,
  CLType,
  CLTypeBool,
  CLTypeInt32,
  CLTypeInt64,
  CLTypeUInt8,
  CLTypeUInt32,
  CLTypeUInt64,
  CLTypeUInt128,
  CLTypeUInt256,
  CLTypeUInt512,
  CLTypeUnit,
  CLTypeKey,
  CLTypeUref,
  CLTypeAny,
  CLTypePublicKey,
  CLTypeString
} from './CLType';
import { CLTypeOption } from './Option';
import { CLTypeList } from './List';
import { CLTypeByteArray } from './ByteArray';
import { CLTypeResult } from './Result';
import { CLTypeMap } from './Map';
import { CLTypeTuple1 } from './Tuple1';
import { CLTypeTuple2 } from './Tuple2';
import { CLTypeTuple3 } from './Tuple3';
import { IResultWithBytes } from '../CLValue';
import { CLValueUInt32 } from '../Numeric';

/**
 * Narrows a raw tag byte to the enum, or returns undefined when the byte is
 * not a known variant. Keeping this in one place is what makes the switch
 * below exhaustive-checkable, and what stops a renumbered enum from silently
 * re-routing a decode.
 */
function toCLTypeTag(tag: number): TypeID | undefined {
  return (Object.values(TypeID) as unknown[]).includes(tag)
    ? (tag as TypeID)
    : undefined;
}

/**
 * A utility class for parsing various CLTypes from different formats, such as JSON, strings, and bytes.
 * This class includes static methods for handling both simple and complex types, along with error handling for unsupported or unrecognized formats.
 */
export class CLTypeParser {
  /**
   * Error thrown when a buffer constructor is not detected.
   */
  static readonly BufferConstructorNotDetectedError = new Error(
    'buffer constructor not detected'
  );

  /**
   * Error thrown when a complex type format is invalid.
   */
  static readonly ComplexTypeFormatInvalidError = new Error(
    'complex type format is invalid'
  );

  /**
   * Error thrown when a complex type format is not detected.
   */
  static readonly ErrComplexTypeFormatNotDetected = new Error(
    'complex type format is not detected'
  );

  /**
   * Error thrown when a JSON constructor is not found.
   */
  static readonly ErrJsonConstructorNotFound = new Error(
    'json type constructor is not found'
  );

  /**
   * A record of simple CLTypes indexed by their TypeName.
   */
  static readonly simpleTypeByName: Record<TypeName, CLType> = {
    [TypeName.Bool]: CLTypeBool,
    [TypeName.I32]: CLTypeInt32,
    [TypeName.I64]: CLTypeInt64,
    [TypeName.U8]: CLTypeUInt8,
    [TypeName.U32]: CLTypeUInt32,
    [TypeName.U64]: CLTypeUInt64,
    [TypeName.U128]: CLTypeUInt128,
    [TypeName.U256]: CLTypeUInt256,
    [TypeName.U512]: CLTypeUInt512,
    [TypeName.Unit]: CLTypeUnit,
    [TypeName.String]: CLTypeString,
    [TypeName.Key]: CLTypeKey,
    [TypeName.URef]: CLTypeUref,
    [TypeName.Any]: CLTypeAny,
    [TypeName.PublicKey]: CLTypePublicKey
  };

  /**
   * A record of simple CLTypes indexed by their TypeID.
   */
  static readonly simpleTypeByID: { [key in TypeID]?: CLType } = {
    [TypeID.Bool]: CLTypeBool,
    [TypeID.I32]: CLTypeInt32,
    [TypeID.I64]: CLTypeInt64,
    [TypeID.U8]: CLTypeUInt8,
    [TypeID.U32]: CLTypeUInt32,
    [TypeID.U64]: CLTypeUInt64,
    [TypeID.U128]: CLTypeUInt128,
    [TypeID.U256]: CLTypeUInt256,
    [TypeID.U512]: CLTypeUInt512,
    [TypeID.Unit]: CLTypeUnit,
    [TypeID.String]: CLTypeString,
    [TypeID.Key]: CLTypeKey,
    [TypeID.URef]: CLTypeUref,
    [TypeID.Any]: CLTypeAny,
    [TypeID.PublicKey]: CLTypePublicKey
  };

  /**
   * Retrieves a simple CLType by its TypeName.
   * @param typeName - The TypeName of the CLType to retrieve.
   * @returns The corresponding CLType.
   * @throws Error if the type name is not registered.
   */
  static getSimpleTypeByName(typeName: TypeName): CLType {
    const result = CLTypeParser.simpleTypeByName[typeName];
    if (!result) {
      throw new Error(`type name is not registered, source: ${typeName}`);
    }
    return result;
  }

  /**
   * Parses a CLType from a raw JSON string.
   * @param source - The raw JSON string to parse.
   * @returns The parsed CLType.
   */
  static fromRawJson(source: any): CLType {
    try {
      return CLTypeParser.fromInterface(source);
    } catch (err) {
      return CLTypeParser.getSimpleTypeByName(source as TypeName);
    }
  }

  /**
   * Parses a CLType from a Uint8Array.
   * @param bytes - The Uint8Array to parse.
   * @returns An object containing the parsed CLType and the remaining bytes.
   * @throws BufferConstructorNotDetectedError if the type is not recognized.
   */
  static matchBytesToCLType(bytes: Uint8Array): IResultWithBytes<CLType> {
    const tag = toCLTypeTag(bytes[0]);
    const remainder = bytes.subarray(1);

    if (tag === undefined) {
      throw CLTypeParser.BufferConstructorNotDetectedError;
    }

    switch (tag) {
      case TypeID.Bool:
      case TypeID.I32:
      case TypeID.I64:
      case TypeID.U8:
      case TypeID.U32:
      case TypeID.U64:
      case TypeID.U128:
      case TypeID.U256:
      case TypeID.U512:
      case TypeID.Unit:
      case TypeID.String:
      case TypeID.Key:
      case TypeID.URef:
      case TypeID.Any:
      case TypeID.PublicKey:
        return {
          result: CLTypeParser.simpleTypeByID[tag]!,
          bytes: remainder
        };
      case TypeID.Option:
        const {
          result: optionInner,
          bytes: optionBytes
        } = CLTypeParser.matchBytesToCLType(remainder);
        return { result: new CLTypeOption(optionInner), bytes: optionBytes };
      case TypeID.List:
        const {
          result: listInner,
          bytes: listBytes
        } = CLTypeParser.matchBytesToCLType(remainder);
        return { result: new CLTypeList(listInner), bytes: listBytes };
      case TypeID.ByteArray:
        const {
          result: byteArraySize,
          bytes: byteArrayBytes
        } = CLValueUInt32.fromBytes(remainder);
        return {
          result: new CLTypeByteArray(byteArraySize.toNumber()),
          bytes: byteArrayBytes
        };
      case TypeID.Result:
        const {
          result: innerOk,
          bytes: resultBytes
        } = CLTypeParser.matchBytesToCLType(remainder);

        if (!resultBytes) {
          throw new Error('Missing Error type bytes in Result');
        }

        const {
          result: innerErr,
          bytes: errBytes
        } = CLTypeParser.matchBytesToCLType(resultBytes);
        return { result: new CLTypeResult(innerOk, innerErr), bytes: errBytes };
      case TypeID.Map:
        const {
          result: key,
          bytes: keyBytes
        } = CLTypeParser.matchBytesToCLType(remainder);

        if (!keyBytes) {
          throw new Error('Missing Key type bytes in Map');
        }

        const {
          result: val,
          bytes: valBytes
        } = CLTypeParser.matchBytesToCLType(keyBytes);
        return { result: new CLTypeMap(key, val), bytes: valBytes };
      case TypeID.Tuple1:
        const {
          result: innerTypeRes,
          bytes: tuple1Bytes
        } = CLTypeParser.matchBytesToCLType(remainder);
        return { result: new CLTypeTuple1(innerTypeRes), bytes: tuple1Bytes };
      case TypeID.Tuple2:
        const {
          result: innerType1Res,
          bytes: innerType1Bytes
        } = CLTypeParser.matchBytesToCLType(remainder);

        if (!innerType1Bytes) {
          throw new Error('Missing second tuple type bytes in CLTuple2Type');
        }

        const {
          result: innerType2Res,
          bytes: innerType2Bytes
        } = CLTypeParser.matchBytesToCLType(innerType1Bytes);
        return {
          result: new CLTypeTuple2(innerType1Res, innerType2Res),
          bytes: innerType2Bytes
        };
      case TypeID.Tuple3:
        const {
          result: innerType1,
          bytes: innerType1Byte
        } = CLTypeParser.matchBytesToCLType(remainder);

        if (!innerType1Byte) {
          throw new Error('Missing second tuple type bytes in CLTuple3Type');
        }

        const {
          result: innerType2,
          bytes: innerType2Byte
        } = CLTypeParser.matchBytesToCLType(innerType1Byte);

        if (!innerType2Byte) {
          throw new Error('Missing third tuple type bytes in CLTuple3Type');
        }

        const {
          result: innerType3,
          bytes: innerType3Byte
        } = CLTypeParser.matchBytesToCLType(innerType2Byte);
        return {
          result: new CLTypeTuple3(innerType1, innerType2, innerType3),
          bytes: innerType3Byte
        };
    }
  }

  /**
   * Parses a CLType from an interface (object or string).
   * @param rawData - The data to parse.
   * @returns The parsed CLType.
   */
  static fromInterface(rawData: any): CLType {
    if (typeof rawData === 'string') {
      return CLTypeParser.getSimpleTypeByName(rawData as TypeName);
    }
    return CLTypeParser.fromComplexStruct(rawData);
  }

  /**
   * Parses a CLType from a complex structure.
   * @param rawData - The complex structure to parse.
   * @returns The parsed CLType.
   * @throws Various errors if the structure is invalid or unrecognized.
   */
  private static fromComplexStruct(rawData: any): CLType {
    if (typeof rawData === 'object' && rawData !== null) {
      const keys = Object.keys(rawData);
      if (keys.length > 1) {
        throw CLTypeParser.ComplexTypeFormatInvalidError;
      }
      const key = keys[0];
      const val = rawData[key];
      switch (key) {
        case TypeName.Option:
          return CLTypeOption.fromJSON(val);
        case TypeName.List:
          return CLTypeList.fromJSON(val);
        case TypeName.ByteArray:
          return CLTypeByteArray.fromJSON(val);
        case TypeName.Result:
          return CLTypeResult.fromJSON(val);
        case TypeName.Map:
          return CLTypeMap.fromJSON(val);
        case TypeName.Tuple1:
          return CLTypeTuple1.fromJSON(val);
        case TypeName.Tuple2:
          return CLTypeTuple2.fromJSON(val);
        case TypeName.Tuple3:
          return CLTypeTuple3.fromJSON(val);
        default:
          throw CLTypeParser.ErrJsonConstructorNotFound;
      }
    }
    throw CLTypeParser.ErrComplexTypeFormatNotDetected;
  }
}
