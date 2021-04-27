import { Result, Ok, Err } from 'ts-results';

import {
  BOOL_ID,
  LIST_ID,
  BYTE_ARRAY_ID,
  KEY_ID,
  PUBLIC_KEY_ID,
  MAP_ID,
  STRING_ID,
  UREF_ID,
  UNIT_ID,
  RESULT_ID,
  I32_ID,
  I64_ID,
  U8_ID,
  U32_ID,
  U64_ID,
  U128_ID,
  U256_ID,
  U512_ID,
  TUPLE1_ID,
  TUPLE2_ID,
  TUPLE3_ID,
  CLTypeTag
} from './constants';
import {
  CLValueBytesParsers,
  CLType,
  ResultAndRemainder,
  resultHelper,
  // CLListType,
  // CLKeyType,
  // CLPublicKeyType,
  // CLMapType,
  // CLStringType,
  // CLUnitType,
  // CLOptionType,
  // CLResultType,
  // CLTuple1Type,
  // CLTuple2Type,
  // CLTuple3Type
  CLBoolType,
  CLBoolBytesParser,
  CLByteArrayType,
  CLByteArrayBytesParser,
  CLI32Type,
  CLI64Type,
  CLU8Type,
  CLU32Type,
  CLU64Type,
  CLU128Type,
  CLU256Type,
  CLU512Type,
  CLI32BytesParser,
  CLI64BytesParser,
  CLU8BytesParser,
  CLU32BytesParser,
  CLU64BytesParser,
  CLU128BytesParser,
  CLU256BytesParser,
  CLU512BytesParser,
  CLURefType,
  CLURefBytesParser,
  CLKey,
  CLKeyType,
  CLKeyBytesParser
  // CLAccountHash,
} from './index';

export const TUPLE_MATCH_LEN_TO_ID = [TUPLE1_ID, TUPLE2_ID, TUPLE3_ID];

export const matchTypeToCLType = (type: any): CLType => {
  if (typeof type === typeof 'string') {
    switch (type) {
      case BOOL_ID:
        return new CLBoolType();
      case KEY_ID:
        return new CLKeyType();
      // case PUBLIC_KEY_ID:
      //   return new CLPublicKeyType();
      // case STRING_ID:
      //   return new CLStringType();
      case UREF_ID:
        return new CLURefType();
      // case UNIT_ID:
      //   return new CLUnitType();
      case I32_ID:
        return new CLI32Type();
      case I64_ID:
        return new CLI64Type();
      case U8_ID:
        return new CLU8Type();
      case U32_ID:
        return new CLU32Type();
      case U64_ID:
        return new CLU64Type();
      case U128_ID:
        return new CLU128Type();
      // case U256_ID:
      //   return new CLU256Type();
      case U512_ID:
        return new CLU512Type();
      default:
        throw new Error(`The simple type ${type} is not supported`);
    }
  }

  if (typeof type === typeof {}) {
    // if (LIST_ID in type) {
    // const inner = matchTypeToCLType(type[LIST_ID]);
    // return new CLListType(inner);
    // }
    if (BYTE_ARRAY_ID in type) {
      const size = type[BYTE_ARRAY_ID];
      return new CLByteArrayType(size);
    }
    // if (MAP_ID in type) {
    // const keyType = matchTypeToCLType(type[MAP_ID].key);
    // const valType = matchTypeToCLType(type[MAP_ID].value);
    // return new CLMapType([keyType, valType]);
    // }
    // if (TUPLE1_ID in type) {
    // const vals = type[TUPLE1_ID].map((t: any) => matchTypeToCLType(t));
    // return new CLTuple1Type(vals);
    // }
    // if (TUPLE2_ID in type) {
    // const vals = type[TUPLE2_ID].map((t: any) => matchTypeToCLType(t));
    // return new CLTuple2Type(vals);
    // }
    // if (TUPLE3_ID in type) {
    // const vals = type[TUPLE3_ID].map((t: any) => matchTypeToCLType(t));
    // return new CLTuple3Type(vals);
    // }
    // if (CLOptionType.TypeId in type) {
    // const inner = matchTypeToCLType(type[CLOptionType.TypeId]);
    // return new CLOptionType(inner);
    // }
    // if (RESULT_ID in type) {
    // const innerOk = matchTypeToCLType(type[RESULT_ID].ok);
    // const innerErr = matchTypeToCLType(type[RESULT_ID].err);
    // return new CLResultType({ ok: innerOk, err: innerErr });
    // }
    throw new Error(`The complex type ${type} is not supported`);
  }

  throw new Error(`Unknown data provided.`);
};

export const matchByteParserByCLType = (
  val: CLType
): Result<CLValueBytesParsers, string> => {
  // const proto = (val as typeof CLValue).prototype;
  // if ((proto && proto === CLBool.prototype) || val instanceof CLBool) {
  //     return Ok(new CLBoolBytesParser());
  // }
  if (val instanceof CLBoolType) {
    return Ok(new CLBoolBytesParser());
  }
  if (val instanceof CLI32Type) {
    return Ok(new CLI32BytesParser());
  }
  if (val instanceof CLI64Type) {
    return Ok(new CLI64BytesParser());
  }
  if (val instanceof CLU8Type) {
    return Ok(new CLU8BytesParser());
  }
  if (val instanceof CLU32Type) {
    return Ok(new CLU32BytesParser());
  }
  if (val instanceof CLU64Type) {
    return Ok(new CLU64BytesParser());
  }
  if (val instanceof CLU128Type) {
    return Ok(new CLU128BytesParser());
  }
  if (val instanceof CLU256Type) {
    return Ok(new CLU256BytesParser());
  }
  if (val instanceof CLU512Type) {
    return Ok(new CLU512BytesParser());
  }
  if (val instanceof CLByteArrayType) {
    return Ok(new CLByteArrayBytesParser());
  }
  if (val instanceof CLByteArrayType) {
    return Ok(new CLByteArrayBytesParser());
  }
  if (val instanceof CLURefType) {
    return Ok(new CLURefBytesParser());
  }
  if (val instanceof CLKeyType) {
    return Ok(new CLKeyBytesParser());
  }
  return Err('Unknown type');
};

export const matchBytesToCLType = (
  bytes: Uint8Array
): ResultAndRemainder<CLType, string> => {
  const tag = bytes[0];
  const remainder = bytes.subarray(1);

  switch (tag) {
    case CLTypeTag.Bool:
      return resultHelper(Ok(new CLBoolType()), remainder);
    // case CLTypeTag.I32:
    //   return resultHelper(Ok(new CLI32Type()), remainder);
    // case CLTypeTag.I64:
    //   return resultHelper(Ok(new CLI64Type()), remainder);
    // case CLTypeTag.U8:
    //   return resultHelper(Ok(new CLU8Type()), remainder);
    // case CLTypeTag.U32:
    //   return resultHelper(Ok(new CLU32Type()), remainder);
    // case CLTypeTag.U64:
    //   return resultHelper(Ok(new CLU64Type()), remainder);
    // case CLTypeTag.U64:
    //   return resultHelper(Ok(new CLU64Type()), remainder);
    // case CLTypeTag.U128:
    //   return resultHelper(Ok(new CLU128Type()), remainder);
    // case CLTypeTag.U256:
    //   return resultHelper(Ok(new CLU256Type()), remainder);
    // case CLTypeTag.U512:
    //   return resultHelper(Ok(new CLU512Type()), remainder);
    // case CLTypeTag.Unit:
    //   return resultHelper(Ok(new CLUnitType()), remainder);
    // case CLTypeTag.String:
    //   return resultHelper(Ok(new CLStringType()), remainder);
    case CLTypeTag.Key:
      return resultHelper(Ok(new CLKeyType()), remainder);
    // case CLTypeTag.URef:
    //   return resultHelper(Ok(new CLURefType()), remainder);
    // case CLTypeTag.Option: {
    //   const { result, remainder: typeRem } = matchBytesToCLType(remainder);

    //   const innerType = result.unwrap();

    //   return resultHelper(Ok(new CLOptionType(innerType)), typeRem);
    // }
    // case CLTypeTag.List: {
    //   const { result, remainder: typeRem } = matchBytesToCLType(remainder);

    //   const innerType = result.unwrap();

    //   return resultHelper(Ok(new CLListType(innerType)), typeRem);
    // }
    // case CLTypeTag.ByteArray: {
    //   const { result, remainder: typeRem } = matchBytesToCLType(remainder);
    //   const innerType = result.unwrap();
    //   return resultHelper(Ok(new CLListType(innerType)), typeRem);
    // }
    // case CLTypeTag.Result: {
    //   const { result: okTypeRes, remainder: okTypeRem } = matchBytesToCLType(
    //     remainder
    //   );
    //   const okType = okTypeRes.unwrap();

    //   if (!okTypeRem)
    //     return resultHelper(Err('Missing Error type bytes in Result'));

    //   const { result: errTypeRes, remainder: rem } = matchBytesToCLType(
    //     okTypeRem
    //   );
    //   const errType = errTypeRes.unwrap();

    //   return resultHelper(
    //     Ok(new CLResultType({ ok: okType, err: errType })),
    //     rem
    //   );
    // }
    // case CLTypeTag.Map: {
    //   const { result: keyTypeRes, remainder: keyTypeRem } = matchBytesToCLType(
    //     remainder
    //   );
    //   const keyType = keyTypeRes.unwrap();

    //   if (!keyTypeRem)
    //     return resultHelper(Err('Missing Key type bytes in Map'));

    //   const { result: valTypeRes, remainder: rem } = matchBytesToCLType(
    //     keyTypeRem
    //   );
    //   const valType = valTypeRes.unwrap();

    //   return resultHelper(Ok(new CLMapType([keyType, valType])), rem);
    // }
    // case CLTypeTag.Tuple1: {
    //   const { result: innerTypeRes, remainder: rem } = matchBytesToCLType(
    //     remainder
    //   );
    //   const innerType = innerTypeRes.unwrap();

    //   return resultHelper(Ok(new CLTuple1Type([innerType])), rem);
    // }
    // case CLTypeTag.Tuple2: {
    //   const { result: innerType1Res, remainder: innerType1Rem } = matchBytesToCLType(
    //     remainder
    //   );
    //   const innerType1 = innerType1Res.unwrap();

    //   if (!innerType1Rem) {
    //     return resultHelper(Err('Missing second tuple type bytes in CLTuple2Type'));
    //   }

    //   const { result: innerType2Res, remainder: innerType2Rem } = matchBytesToCLType(
    //     innerType1Rem
    //   );
    //   const innerType2 = innerType2Res.unwrap();

    //   return resultHelper(Ok(new CLTuple1Type([innerType1, innerType2])), innerType2Rem);
    // }
    // case CLTypeTag.Tuple3: {
    //   const { result: innerType1Res, remainder: innerType1Rem } = matchBytesToCLType(
    //     remainder
    //   );
    //   const innerType1 = innerType1Res.unwrap();

    //   if (!innerType1Rem) {
    //     return resultHelper(Err('Missing second tuple type bytes in CLTuple2Type'));
    //   }

    //   const { result: innerType2Res, remainder: innerType2Rem } = matchBytesToCLType(
    //     innerType1Rem
    //   );
    //   const innerType2 = innerType2Res.unwrap();

    //   if (!innerType2Rem) {
    //     return resultHelper(Err('Missing third tuple type bytes in CLTuple2Type'));
    //   }

    //   const { result: innerType3Res, remainder: innerType3Rem } = matchBytesToCLType(
    //     innerType2Rem
    //   );
    //   const innerType3 = innerType3Res.unwrap();

    //   return resultHelper(Ok(new CLTuple1Type([innerType1, innerType2, innerType3])), innerType3Rem);
    // }
    // case CLTypeTag.Any: {
    //   return resultHelper(Err('Any unsupported'));
    // }
    // case CLTypeTag.PublicKey:
    //   return resultHelper(
    //     Ok(new CLPublicKeyType())
    //   );
  }

  return resultHelper(Err('Unsuported type'));
};

// const CLVALUE_TO_BYTESPARSER = {
// };

// const matchBytesParserToCLValue = (val: CLValue) => {
// };
