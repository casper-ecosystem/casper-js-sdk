/// The length in bytes of a [`AccountHash`].
export const ACCOUNT_HASH_LENGTH = 32;

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes = "Left over bytes",
  OutOfMemory = "Out of memory exception",
  UnknownValue = "Unknown value"
}

export enum KeyVariant {
  Account,
  Hash,
  URef
}

export const BOOL_CL_TYPE = 'Bool';

export type CLTypes = typeof BOOL_CL_TYPE;

export const BOOL_ID = 'Bool';
export const KEY_ID = 'Key';
export const PUBLIC_KEY_ID = 'PublicKey';
export const STRING_ID = 'String';
export const UREF_ID = 'URef';
export const UNIT_ID = 'Unit';
export const I32_ID = 'I32';
export const I64_ID = 'I64';
export const U8_ID = 'U8';
export const U32_ID = 'U32';
export const U64_ID = 'U64';
export const U128_ID = 'U128';
export const U256_ID = 'U256';
export const U512_ID = 'U512';

export const BYTE_ARRAY_ID = 'ByteArray';
export const LIST_ID = 'List';
export const MAP_ID = 'Map';
export const OPTION_ID = 'Option';
export const RESULT_ID = 'Result';
export const TUPLE1_ID = 'Tuple1';
export const TUPLE2_ID = 'Tuple2';
export const TUPLE3_ID = 'Tuple3';
