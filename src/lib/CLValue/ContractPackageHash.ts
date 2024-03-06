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
  KEY_HASH_LENGTH,
  PACKAGE_STRING_PREFIX,
  PACKAGE_STRING_LEGACY_EXTRA_PREFIX,
  CONTRACT_PACKAGE_HASH_TYPE
} from './constants';

export type FormattedContractPackageHash = `contact-package-${string}`

export class CLContractPackageHashType extends CLByteArrayType {
  linksTo = CONTRACT_PACKAGE_HASH_TYPE;
  constructor() {
    super(KEY_HASH_LENGTH);
  }
}

export class CLContractPackageHashBytesParser extends CLByteArrayBytesParser {
  toBytes(value: CLContractPackageHash): ToBytesResult {
    return Ok(value.data);
  }

  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLContractPackageHash, CLErrorCodes> {
    if (bytes.length < KEY_HASH_LENGTH) {
      return resultHelper<CLContractPackageHash, CLErrorCodes>(
        Err(CLErrorCodes.EarlyEndOfStream)
      );
    }

    const contractPackageHashBytes = bytes.subarray(0, KEY_HASH_LENGTH);
    const contractPackageHash = new CLContractPackageHash(
      contractPackageHashBytes
    );
    return resultHelper(
      Ok(contractPackageHash),
      bytes.subarray(KEY_HASH_LENGTH)
    );
  }
}

export class CLContractPackageHash extends CLByteArray {
  /**
   * Constructs a new `CLContractPackageHash`.
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
   * Return CLContractPackageHash from formatted string (starts with `contract-package-`).
   * @param v formatted string
   * @returns CLContractPackageHash
   */
  static fromFormattedString(v: FormattedContractPackageHash | `contract-package-wasm${string}`): CLContractPackageHash {
    if (!v.startsWith(PACKAGE_STRING_PREFIX)) {
      throw new Error('Invalid Format');
    }
    let packageHash = v.slice(PACKAGE_STRING_PREFIX.length);

    // We need to support the legacy prefix of "contract-package-wasm".
    packageHash = packageHash.startsWith(PACKAGE_STRING_LEGACY_EXTRA_PREFIX)
      ? packageHash.slice(PACKAGE_STRING_LEGACY_EXTRA_PREFIX.length)
      : packageHash;

    return new CLContractPackageHash(decodeBase16(packageHash));
  }

  /**
   * Return formatted string (starts with `contract-package-`).
   * @returns formatted string
   */
  toFormattedString(): FormattedContractPackageHash {
    return PACKAGE_STRING_PREFIX + encodeBase16(this.data) as FormattedContractPackageHash;
  }
}
