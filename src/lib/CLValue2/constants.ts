/// The length in bytes of a [`AccountHash`].
export const ACCOUNT_HASH_LENGTH = 32;

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes,
  OutOfMemory
}

export enum KeyVariant {
  Account,
  Hash,
  URef
}

export const BOOL_CL_TYPE = "Bool";

export type CLTypes = typeof BOOL_CL_TYPE;

export const BOOL_ID = "Bool";
export const KEY_ID = "Key";
export const STRING_ID = "String";
export const I32_ID = "I32";

export const BYTE_ARRAY_ID = "ByteArray";
export const LIST_ID = "List";
export const MAP_ID = "Map";
export const OPTION_ID = "Option";
export const TUPLE1_ID = "Tuple1";
export const TUPLE2_ID = "Tuple2";
export const TUPLE3_ID = "Tuple3";
