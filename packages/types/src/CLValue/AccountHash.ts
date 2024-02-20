import { Err, Ok } from 'ts-results';

import {
  ACCOUNT_HASH_LENGTH,
  ACCOUNT_HASH_TYPE,
  CLByteArrayType,
  CLErrorCodes,
  CLType,
  CLValue,
  CLValueBytesParsers,
  ResultAndRemainder,
  resultHelper,
  ToBytesResult
} from './index';

// AccountHash is an alias, not a fully functional CLType so uses the same CLTypeTag as ByteArray
export class CLAccountHashType extends CLByteArrayType {
  linksTo = ACCOUNT_HASH_TYPE;

  constructor() {
    super(ACCOUNT_HASH_LENGTH);
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
