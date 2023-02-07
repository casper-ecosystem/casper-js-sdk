// TODO: In v3 we need better way of dealing with Alias types
import { Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';
import { toBytesU32 } from '../ByteConverters';

import {
  CLValue,
  CLValueBytesParsers,
  CLType,
  CLTypeTag,
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

  // AccountHash is an alias, not a fully functional CLType so uses the same CLTypeTag as ByteArray
  toBytes(): Uint8Array {
    return concat([Uint8Array.from([CLTypeTag.ByteArray]), toBytesU32(32)]);
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
    return resultHelper(Ok(accountHash), bytes.subarray(ACCOUNT_HASH_LENGTH));
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
}
