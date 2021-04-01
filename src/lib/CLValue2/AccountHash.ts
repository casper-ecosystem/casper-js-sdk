import {
  CLType,
  CLValue,
  ToBytes,
  CLErrorCodes,
  ACCOUNT_HASH_LENGTH
} from './index';
import { Ok, Err, Result } from 'ts-results';

export class CLAccountHashType extends CLType {
  toString(): string {
    return 'AccountHash';
  }
}

/** A cryptographic public key. */
export class CLAccountHash extends CLValue implements ToBytes {
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

  public toBytes(): Uint8Array {
    return this.data;
  }

  static fromBytes(bytes: Uint8Array): Result<CLAccountHash, CLErrorCodes> {
    if (bytes.length < ACCOUNT_HASH_LENGTH) {
      return new Err(CLErrorCodes.EarlyEndOfStream);
    }

    const accountHashBytes = bytes.subarray(0, ACCOUNT_HASH_LENGTH);
    const accountHash = new CLAccountHash(accountHashBytes);
    return new Ok(accountHash);
  }
}
