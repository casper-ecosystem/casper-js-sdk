import { Result, Ok, Err } from 'ts-results';

import {
  ACCOUNT_HASH_TYPE,
  BOOL_TYPE,
  LIST_TYPE,
  BYTE_ARRAY_TYPE,
  KEY_TYPE,
  PUBLIC_KEY_TYPE,
  MAP_TYPE,
  STRING_TYPE,
  UREF_TYPE,
  UNIT_TYPE,
  RESULT_TYPE,
  I32_TYPE,
  I64_TYPE,
  U8_TYPE,
  U32_TYPE,
  U64_TYPE,
  U128_TYPE,
  U256_TYPE,
  U512_TYPE,
  TUPLE1_TYPE,
  TUPLE2_TYPE,
  TUPLE3_TYPE,
  OPTION_TYPE,
  CLTypeTag
} from './constants';
import {
  CLValueBytesParsers,
  CLAccountHashBytesParser,
  CLType,
  ResultAndRemainder,
  resultHelper,
  CLPublicKeyType,
  CLPublicKeyBytesParser,
  CLOptionType,
  CLOptionBytesParser,
  CLResultType,
  CLResultBytesParser,
  CLTuple1Type,
  CLTuple2Type,
  CLTuple3Type,
  CLTupleBytesParser,
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
  CLStringType,
  CLStringBytesParser,
  CLKeyType,
  CLKeyBytesParser,
  CLListType,
  CLListBytesParser,
  CLMapType,
  CLMapBytesParser,
  CLUnitType,
  CLUnitBytesParser
} from './index';

export const TUPLE_MATCH_LEN_TO_TYPE = [TUPLE1_TYPE, TUPLE2_TYPE, TUPLE3_TYPE];

export const matchTypeToCLType = (type: any): CLType => {
  if (typeof type === typeof 'string') {
    switch (type) {
      case BOOL_TYPE:
        return new CLBoolType();
      case KEY_TYPE:
        return new CLKeyType();
      case PUBLIC_KEY_TYPE:
        return new CLPublicKeyType();
      case STRING_TYPE:
        return new CLStringType();
      case UREF_TYPE:
        return new CLURefType();
      case UNIT_TYPE:
        return new CLUnitType();
      case I32_TYPE:
        return new CLI32Type();
      case I64_TYPE:
        return new CLI64Type();
      case U8_TYPE:
        return new CLU8Type();
      case U32_TYPE:
        return new CLU32Type();
      case U64_TYPE:
        return new CLU64Type();
      case U128_TYPE:
        return new CLU128Type();
      case U256_TYPE:
        return new CLU256Type();
      case U512_TYPE:
        return new CLU512Type();
      default:
        throw new Error(`The simple type ${type} is not supported`);
    }
  }

  if (typeof type === typeof {}) {
    if (LIST_TYPE in type) {
      const inner = matchTypeToCLType(type[LIST_TYPE]);
      return new CLListType(inner);
    }
    if (BYTE_ARRAY_TYPE in type) {
      const size = type[BYTE_ARRAY_TYPE];
      return new CLByteArrayType(size);
    }
    if (MAP_TYPE in type) {
      const keyType = matchTypeToCLType(type[MAP_TYPE].key);
      const valType = matchTypeToCLType(type[MAP_TYPE].value);
      return new CLMapType([keyType, valType]);
    }
    if (TUPLE1_TYPE in type) {
      const vals = type[TUPLE1_TYPE].map((t: any) => matchTypeToCLType(t));
      return new CLTuple1Type(vals);
    }
    if (TUPLE2_TYPE in type) {
      const vals = type[TUPLE2_TYPE].map((t: any) => matchTypeToCLType(t));
      return new CLTuple2Type(vals);
    }
    if (TUPLE3_TYPE in type) {
      const vals = type[TUPLE3_TYPE].map((t: any) => matchTypeToCLType(t));
      return new CLTuple3Type(vals);
    }
    if (OPTION_TYPE in type) {
      const inner = matchTypeToCLType(type[OPTION_TYPE]);
      return new CLOptionType(inner);
    }
    if (RESULT_TYPE in type) {
      const innerOk = matchTypeToCLType(type[RESULT_TYPE].ok);
      const innerErr = matchTypeToCLType(type[RESULT_TYPE].err);
      return new CLResultType({ ok: innerOk, err: innerErr });
    }
    throw new Error(`The complex type ${type} is not supported`);
  }

  throw new Error(`Unknown data provided.`);
};

export const matchByteParserByCLType = (
  val: CLType
): Result<CLValueBytesParsers, string> => {
  switch (val.linksTo) {
    case ACCOUNT_HASH_TYPE:
      return Ok(new CLAccountHashBytesParser());
    case BOOL_TYPE:
      return Ok(new CLBoolBytesParser());
    case I32_TYPE:
      return Ok(new CLI32BytesParser());
    case I64_TYPE:
      return Ok(new CLI64BytesParser());
    case U8_TYPE:
      return Ok(new CLU8BytesParser());
    case U32_TYPE:
      return Ok(new CLU32BytesParser());
    case U64_TYPE:
      return Ok(new CLU64BytesParser());
    case U128_TYPE:
      return Ok(new CLU128BytesParser());
    case U256_TYPE:
      return Ok(new CLU256BytesParser());
    case U512_TYPE:
      return Ok(new CLU512BytesParser());
    case BYTE_ARRAY_TYPE:
      return Ok(new CLByteArrayBytesParser());
    case UREF_TYPE:
      return Ok(new CLURefBytesParser());
    case KEY_TYPE:
      return Ok(new CLKeyBytesParser());
    case PUBLIC_KEY_TYPE:
      return Ok(new CLPublicKeyBytesParser());
    case LIST_TYPE:
      return Ok(new CLListBytesParser());
    case MAP_TYPE:
      return Ok(new CLMapBytesParser());
    case TUPLE1_TYPE:
    case TUPLE2_TYPE:
    case TUPLE3_TYPE:
      return Ok(new CLTupleBytesParser());
    case OPTION_TYPE:
      return Ok(new CLOptionBytesParser());
    case RESULT_TYPE:
      return Ok(new CLResultBytesParser());
    case STRING_TYPE:
      return Ok(new CLStringBytesParser());
    case UNIT_TYPE:
      return Ok(new CLUnitBytesParser());
    default:
      return Err('Unknown type');
  }
};

export const matchBytesToCLType = (
  bytes: Uint8Array
): ResultAndRemainder<CLType, string> => {
  const tag = bytes[0];
  const remainder = bytes.subarray(1);

  switch (tag) {
    case CLTypeTag.Bool:
      return resultHelper(Ok(new CLBoolType()), remainder);
    case CLTypeTag.I32:
      return resultHelper(Ok(new CLI32Type()), remainder);
    case CLTypeTag.I64:
      return resultHelper(Ok(new CLI64Type()), remainder);
    case CLTypeTag.U8:
      return resultHelper(Ok(new CLU8Type()), remainder);
    case CLTypeTag.U32:
      return resultHelper(Ok(new CLU32Type()), remainder);
    case CLTypeTag.U64:
      return resultHelper(Ok(new CLU64Type()), remainder);
    case CLTypeTag.U64:
      return resultHelper(Ok(new CLU64Type()), remainder);
    case CLTypeTag.U128:
      return resultHelper(Ok(new CLU128Type()), remainder);
    case CLTypeTag.U256:
      return resultHelper(Ok(new CLU256Type()), remainder);
    case CLTypeTag.U512:
      return resultHelper(Ok(new CLU512Type()), remainder);
    case CLTypeTag.Unit:
      return resultHelper(Ok(new CLUnitType()), remainder);
    case CLTypeTag.String:
      return resultHelper(Ok(new CLStringType()), remainder);
    case CLTypeTag.Key:
      return resultHelper(Ok(new CLKeyType()), remainder);
    case CLTypeTag.URef:
      return resultHelper(Ok(new CLURefType()), remainder);
    case CLTypeTag.Option: {
      const { result, remainder: typeRem } = matchBytesToCLType(remainder);

      const innerType = result.unwrap();

      return resultHelper(Ok(new CLOptionType(innerType)), typeRem);
    }
    case CLTypeTag.List: {
      const { result, remainder: typeRem } = matchBytesToCLType(remainder);

      const innerType = result.unwrap();

      return resultHelper(Ok(new CLListType(innerType)), typeRem);
    }
    case CLTypeTag.ByteArray: {
      const { result, remainder: typeRem } = matchBytesToCLType(remainder);
      const innerType = result.unwrap();
      return resultHelper(Ok(new CLListType(innerType)), typeRem);
    }
    case CLTypeTag.Result: {
      const { result: okTypeRes, remainder: okTypeRem } = matchBytesToCLType(
        remainder
      );
      const okType = okTypeRes.unwrap();

      if (!okTypeRem)
        return resultHelper(Err('Missing Error type bytes in Result'));

      const { result: errTypeRes, remainder: rem } = matchBytesToCLType(
        okTypeRem
      );
      const errType = errTypeRes.unwrap();

      return resultHelper(
        Ok(new CLResultType({ ok: okType, err: errType })),
        rem
      );
    }
    case CLTypeTag.Map: {
      const { result: keyTypeRes, remainder: keyTypeRem } = matchBytesToCLType(
        remainder
      );
      const keyType = keyTypeRes.unwrap();

      if (!keyTypeRem)
        return resultHelper(Err('Missing Key type bytes in Map'));

      const { result: valTypeRes, remainder: rem } = matchBytesToCLType(
        keyTypeRem
      );
      const valType = valTypeRes.unwrap();

      return resultHelper(Ok(new CLMapType([keyType, valType])), rem);
    }
    case CLTypeTag.Tuple1: {
      const { result: innerTypeRes, remainder: rem } = matchBytesToCLType(
        remainder
      );
      const innerType = innerTypeRes.unwrap();

      return resultHelper(Ok(new CLTuple1Type([innerType])), rem);
    }
    case CLTypeTag.Tuple2: {
      const {
        result: innerType1Res,
        remainder: innerType1Rem
      } = matchBytesToCLType(remainder);
      const innerType1 = innerType1Res.unwrap();

      if (!innerType1Rem) {
        return resultHelper(
          Err('Missing second tuple type bytes in CLTuple2Type')
        );
      }

      const {
        result: innerType2Res,
        remainder: innerType2Rem
      } = matchBytesToCLType(innerType1Rem);
      const innerType2 = innerType2Res.unwrap();

      return resultHelper(
        Ok(new CLTuple1Type([innerType1, innerType2])),
        innerType2Rem
      );
    }
    case CLTypeTag.Tuple3: {
      const {
        result: innerType1Res,
        remainder: innerType1Rem
      } = matchBytesToCLType(remainder);
      const innerType1 = innerType1Res.unwrap();

      if (!innerType1Rem) {
        return resultHelper(
          Err('Missing second tuple type bytes in CLTuple2Type')
        );
      }

      const {
        result: innerType2Res,
        remainder: innerType2Rem
      } = matchBytesToCLType(innerType1Rem);
      const innerType2 = innerType2Res.unwrap();

      if (!innerType2Rem) {
        return resultHelper(
          Err('Missing third tuple type bytes in CLTuple2Type')
        );
      }

      const {
        result: innerType3Res,
        remainder: innerType3Rem
      } = matchBytesToCLType(innerType2Rem);
      const innerType3 = innerType3Res.unwrap();

      return resultHelper(
        Ok(new CLTuple1Type([innerType1, innerType2, innerType3])),
        innerType3Rem
      );
    }
    case CLTypeTag.Any: {
      return resultHelper(Err('Any unsupported'));
    }
    case CLTypeTag.PublicKey:
      return resultHelper(Ok(new CLPublicKeyType()));
  }

  return resultHelper(Err('Unsuported type'));
};

export const padNum = (v: string, n = 1): string =>
  new Array(n).join('0').slice((n || 2) * -1) + v;
