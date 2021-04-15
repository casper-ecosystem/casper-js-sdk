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
