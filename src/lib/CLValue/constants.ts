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

export const ACCOUNT_HASH_ID = 'AccountHash';
