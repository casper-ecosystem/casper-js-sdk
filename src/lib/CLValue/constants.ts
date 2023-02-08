/// The length in bytes of a [`AccountHash`].
export const ACCOUNT_HASH_LENGTH = 32;

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes = 'Left over bytes',
  OutOfMemory = 'Out of memory exception',
  UnknownValue = 'Unknown value'
}

export enum KeyVariant {
  Account,
  Hash,
  URef
}

/**
 * Casper types, i.e. types which can be stored and manipulated by smart contracts.
 *
 * Provides a description of the underlying data type of a [[CLValue]].
 */
export enum CLTypeTag {
  /** A boolean value */
  Bool = 0,
  /** A 32-bit signed integer */
  I32 = 1,
  /** A 64-bit signed integer */
  I64 = 2,
  /** An 8-bit unsigned integer (a byte) */
  U8 = 3,
  /** A 32-bit unsigned integer */
  U32 = 4,
  /** A 64-bit unsigned integer */
  U64 = 5,
  /** A 128-bit unsigned integer */
  U128 = 6,
  /** A 256-bit unsigned integer */
  U256 = 7,
  /** A 512-bit unsigned integer */
  U512 = 8,
  /** A unit type, i.e. type with no values (analogous to `void` in C and `()` in Rust) */
  Unit = 9,
  /** A string of characters */
  String = 10,
  /** A key in the global state - URef/hash/etc. */
  Key = 11,
  /** An Unforgeable Reference (URef) */
  URef = 12,
  /** An [[Option]], i.e. a type that can contain a value or nothing at all */
  Option = 13,
  /** A list of values */
  List = 14,
  /** A fixed-length array of bytes */
  ByteArray = 15,
  /**
   * A [[Result]], i.e. a type that can contain either a value representing success or one representing failure.
   */
  Result = 16,
  /** A key-value map. */
  Map = 17,
  /** A 1-value tuple. */
  Tuple1 = 18,
  /** A 2-value tuple, i.e. a pair of values. */
  Tuple2 = 19,
  /** A 3-value tuple. */
  Tuple3 = 20,
  /** A value of any type. */
  Any = 21,
  /** A value of public key type. */
  PublicKey = 22
}

export const ALIAS_ACCOUNT_HASH_TO_BYTE_ARRAY = -1;

export const BOOL_TYPE = 'Bool';
export const KEY_TYPE = 'Key';
export const PUBLIC_KEY_TYPE = 'PublicKey';
export const STRING_TYPE = 'String';
export const UREF_TYPE = 'URef';
export const UNIT_TYPE = 'Unit';
export const I32_TYPE = 'I32';
export const I64_TYPE = 'I64';
export const U8_TYPE = 'U8';
export const U32_TYPE = 'U32';
export const U64_TYPE = 'U64';
export const U128_TYPE = 'U128';
export const U256_TYPE = 'U256';
export const U512_TYPE = 'U512';

export const BYTE_ARRAY_TYPE = 'ByteArray';
export const LIST_TYPE = 'List';
export const MAP_TYPE = 'Map';
export const OPTION_TYPE = 'Option';
export const RESULT_TYPE = 'Result';
export const TUPLE1_TYPE = 'Tuple1';
export const TUPLE2_TYPE = 'Tuple2';
export const TUPLE3_TYPE = 'Tuple3';

export const ACCOUNT_HASH_TYPE = 'AccountHash';
