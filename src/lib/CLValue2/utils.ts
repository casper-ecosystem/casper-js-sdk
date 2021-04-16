import {
  BOOL_ID,
  LIST_ID,
  BYTE_ARRAY_ID,
  KEY_ID,
  PUBLIC_KEY_ID,
  MAP_ID,
  STRING_ID,
  UREF_ID,
  OPTION_ID,
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
  TUPLE3_ID
} from './constants';
import {
  CLValue,
  CLType,
  CLBoolType,
  CLListType,
  CLByteArrayType,
  CLKeyType,
  CLPublicKeyType,
  CLMapType,
  CLStringType,
  CLURefType,
  CLOptionType,
  CLI32Type,
  CLI64Type,
  CLU8Type,
  CLU32Type,
  CLU64Type,
  CLU128Type,
  CLU256Type,
  CLU512Type,
  CLTuple1Type,
  CLTuple2Type,
  CLTuple3Type,
} from './index';

// const cl_type = { List: { List: 'Bool' } };

export const TUPLE_MATCH_LEN_TO_ID = [TUPLE1_ID, TUPLE2_ID, TUPLE3_ID];

export const matchTypeToCLType = (type: any): CLType => {
  if (typeof type === typeof 'string') {
    switch (type) {
      case BOOL_ID:
        return new CLBoolType();
      case KEY_ID:
        return new CLKeyType();
      case PUBLIC_KEY_ID:
        return new CLPublicKeyType();
      case STRING_ID:
        return new CLStringType();
      case UREF_ID:
        return new CLURefType();
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
      case U256_ID:
        return new CLU256Type();
      case U512_ID:
        return new CLU512Type();
      default:
        throw new Error(`The simple type ${type} is not supported`);
    }
  }

  if (typeof type === typeof {}) {
    if (LIST_ID in type) {
      const inner = matchTypeToCLType(type[LIST_ID]);
      return new CLListType(inner);
    }
    if (BYTE_ARRAY_ID in type) {
      const size = type[BYTE_ARRAY_ID];
      return new CLByteArrayType(size);
    }
    if (MAP_ID in type) {
      const keyType = matchTypeToCLType(type[MAP_ID].key);
      const valType = matchTypeToCLType(type[MAP_ID].value);
      return new CLMapType(keyType, valType);
    }
    if (TUPLE1_ID in type) {
      const vals = type[TUPLE1_ID].map((t: any) => matchTypeToCLType(t));
      return new CLTuple1Type(vals);
    }
    if (TUPLE2_ID in type) {
      const vals = type[TUPLE2_ID].map((t: any) => matchTypeToCLType(t));
      return new CLTuple2Type(vals);
    }
    if (TUPLE3_ID in type) {
      const vals = type[TUPLE3_ID].map((t: any) => matchTypeToCLType(t));
      return new CLTuple3Type(vals);
    }
    if (OPTION_ID in type) {
      const inner = matchTypeToCLType(type[OPTION_ID]);
      return new CLOptionType(inner);
    }
    throw new Error(`The complex type ${type} is not supported`);
  }

  throw new Error(`Unknown data provided.`);
};

export const buildCLValueFromJson = (json: any): CLValue => {
  const clType = matchTypeToCLType(json.cl_type);
  const ref = clType.linksTo;
  const clValue = ref.fromJSON(json);
  return clValue;
};
