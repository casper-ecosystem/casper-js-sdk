import { Err, Ok } from 'ts-results';

import { decodeBase16, encodeBase16 } from '../Conversions';
import { ResultAndRemainder, resultHelper, ToBytesResult } from './Abstract';
import {
  CLByteArray,
  CLByteArrayBytesParser,
  CLByteArrayType
} from './ByteArray';
import {
  CLErrorCodes,
  CONTRACT_HASH_TYPE,
  CONTRACT_STRING_PREFIX,
  KEY_HASH_LENGTH
} from './constants';

export class CLContractHashType extends CLByteArrayType {
  linksTo = CONTRACT_HASH_TYPE;

  constructor() {
    super(KEY_HASH_LENGTH);
  }
}

export class CLContractHashBytesParser extends CLByteArrayBytesParser {
  toBytes(value: CLContractHash): ToBytesResult {
    return Ok(value.data);
  }

  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLContractHash, CLErrorCodes> {
    if (bytes.length < KEY_HASH_LENGTH) {
      return resultHelper<CLContractHash, CLErrorCodes>(
        Err(CLErrorCodes.EarlyEndOfStream)
      );
    }

    const contractHashBytes = bytes.subarray(0, KEY_HASH_LENGTH);
    const contractHash = new CLContractHash(contractHashBytes);
    return resultHelper(Ok(contractHash), bytes.subarray(KEY_HASH_LENGTH));
  }
}

export class CLContractHash extends CLByteArray {
  /**
   * Constructs a new `CLContractHash`.
   *
   * @param v The bytes array with 32 length.
   */
  constructor(v: Uint8Array) {
    if (v.length !== KEY_HASH_LENGTH) {
      throw new Error('Invalid length');
    }
    super(v);
  }

  /**
   * Return ContractHash from formatted string (starts with `contract-`).
   * @param v formatted string
   * @returns CLContractHash
   */
  static fromFormattedString(v: string): CLContractHash {
    if (!v.startsWith(CONTRACT_STRING_PREFIX)) {
      throw new Error('Invalid Format');
    }

    return new CLContractHash(
      decodeBase16(v.slice(CONTRACT_STRING_PREFIX.length))
    );
  }

  /**
   * Return formatted string (starts with `contract-`).
   * @returns formatted string
   */
  toFormattedString(): string {
    return CONTRACT_STRING_PREFIX + encodeBase16(this.data);
  }
}
