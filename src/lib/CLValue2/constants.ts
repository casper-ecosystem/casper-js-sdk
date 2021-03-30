/// The length in bytes of a [`AccountHash`].
export const ACCOUNT_HASH_LENGTH = 32;

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes,
  OutOfMemory
}

