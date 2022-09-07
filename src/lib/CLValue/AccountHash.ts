// NOTE: Currently this isn't supported CLValue
// Don't export it outside internal code!

import { Ok, Err } from 'ts-results';

import {
  CLValue,
  CLValueBytesParsers,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  ACCOUNT_HASH_LENGTH,
  resultHelper,
  ACCOUNT_HASH_ID
} from './index';

export class CLAccountHashType extends CLType {
  linksTo = CLAccountHash;
  tag = -1;

  toString(): string {
    return ACCOUNT_HASH_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLAccountHashBytesParser extends CLValueBytesParsers {
  toBytes(value: CLAccountHash): ToBytesResult {
    return Ok(value.data);
  }

  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLAccountHash, CLErrorCodes> {
    if (bytes.length < ACCOUNT_HASH_LENGTH) {
      return resultHelper<CLAccountHash, CLErrorCodes>(
        Err(CLErrorCodes.EarlyEndOfStream)
      );
    }

    const accountHashBytes = bytes.subarray(0, ACCOUNT_HASH_LENGTH);
    const accountHash = new CLAccountHash(accountHashBytes);
    return resultHelper(Ok(accountHash));
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

  toBytes() {
    return new CLAccountHashBytesParser().toBytes(this);
  }

  static fromBytesWithRemainder(bytes: Uint8Array) {
    return new CLAccountHashBytesParser().fromBytesWithRemainder(bytes);
  }
}
