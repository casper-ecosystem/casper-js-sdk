// NOTE: Currently this isn't supported CLValue
import { Result, Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  ACCOUNT_HASH_LENGTH,
  resultHelper,
} from './index';

export class CLAccountHashType extends CLType {
  linksTo = CLAccountHash;

  toString(): string {
    return 'AccountHash';
  }

  toJSON(): string {
    return this.toString();
  }
}

/** A cryptographic public key. */
export class CLAccountHash extends CLValue {
  data: Uint8Array;
  /**
   * Constructs a new `AccountHash`.
   *
   * @param v The bytes constituting the public key.
   */
  constructor(v: Uint8Array) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new CLAccountHashType();
  }

  value(): Uint8Array {
    return this.data;
  }

  public toBytes(): ToBytesResult {
    return Ok(this.data);
  }

  static fromBytesWithRemainder(bytes: Uint8Array): ResultAndRemainder<CLAccountHash, CLErrorCodes> {
    if (bytes.length < ACCOUNT_HASH_LENGTH) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const accountHashBytes = bytes.subarray(0, ACCOUNT_HASH_LENGTH);
    const accountHash = new CLAccountHash(accountHashBytes);
    return resultHelper(Ok(accountHash));
  }
}
