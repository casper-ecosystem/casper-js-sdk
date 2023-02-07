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
  // The tag is same as ByteArray as AccountHash is just an alias type.
  // This might be considered unclear, so in next version we should found more transparent way of declaring aliases.
  tag = CLTypeTag.ByteArray;

  toString(): string {
    return ACCOUNT_HASH_ID;
  }

  toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.tag]), toBytesU32(32)]);
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

    const accountHash = new CLAccountHash(bytes);
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
