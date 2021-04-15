import {
  BOOL_ID,
  LIST_ID,
  BYTE_ARRAY_ID,
  KEY_ID,
  MAP_ID,
  STRING_ID,
  I32_ID,
  TUPLE1_ID,
  TUPLE2_ID,
  TUPLE3_ID,
} from './constants';
import {
  CLValue,
  CLType,
  CLBoolType,
  CLListType,
  CLByteArrayType,
  CLKeyType,
  CLMapType,
  CLStringType,
  CLI32Type,
  CLTuple1Type,
  CLTuple2Type,
  CLTuple3Type
} from './index';

// const cl_type = { List: { List: 'Bool' } };

export const TUPLE_MATCH_LEN_TO_ID = [
  TUPLE1_ID,
  TUPLE2_ID,
  TUPLE3_ID
]

// return type is also number due to CLByteArrayType size constructor
export const matchTypeToCLType = (type: any): CLType => {
  if (typeof type === typeof 'string') {
    switch (type) {
      case BOOL_ID:
        return new CLBoolType();
      case KEY_ID:
        return new CLKeyType();
      case STRING_ID:
        return new CLStringType();
      case I32_ID:
        return new CLI32Type();
      default:
        throw new Error(`The simple type ${type} is not supported`);
    }
  }

  if (typeof type === typeof {}) {
    if (LIST_ID in type) {
      const inner = matchTypeToCLType(type[LIST_ID]) as CLType;
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
