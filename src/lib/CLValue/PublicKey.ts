import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLValueBytesParsers,
  CLErrorCodes,
  resultHelper,
  ResultAndRemainder,
  ToBytesResult
} from './index';
import { PUBLIC_KEY_TYPE, CLTypeTag } from './constants';
import { decodeBase16, encodeBase16 } from '../Conversions';
import { byteHash } from '../ByteConverters';

// TODO: Tidy up almost the same enum in Keys.
import { SignatureAlgorithm } from '../Keys';
import { encode, isChecksummed } from '../ChecksummedHex';

const ED25519_LENGTH = 32;
const SECP256K1_LENGTH = 33;

export enum CLPublicKeyTag {
  ED25519 = 1,
  SECP256K1 = 2
}

export class CLPublicKeyType extends CLType {
  linksTo = PUBLIC_KEY_TYPE;
  tag = CLTypeTag.PublicKey;
}

export class CLPublicKeyBytesParser extends CLValueBytesParsers {
  public toBytes(value: CLPublicKey): ToBytesResult {
    return Ok(concat([Uint8Array.from([value.tag]), value.data]));
  }

  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLPublicKey, CLErrorCodes> {
    if (rawBytes.length < 1) {
      return resultHelper<CLPublicKey, CLErrorCodes>(
        Err(CLErrorCodes.EarlyEndOfStream)
      );
    }

    const variant = rawBytes[0];

    let expectedPublicKeySize;
    if (variant === CLPublicKeyTag.ED25519) {
      expectedPublicKeySize = ED25519_LENGTH;
    } else if (variant === CLPublicKeyTag.SECP256K1) {
      expectedPublicKeySize = SECP256K1_LENGTH;
    } else {
      return resultHelper<CLPublicKey, CLErrorCodes>(
        Err(CLErrorCodes.Formatting)
      );
    }

    const bytes = rawBytes.subarray(1, expectedPublicKeySize + 1);

    const publicKey = new CLPublicKey(bytes, variant);

    return resultHelper(
      Ok(publicKey),
      rawBytes.subarray(expectedPublicKeySize + 1)
    );
  }
}

export class CLPublicKey extends CLValue {
  data: Uint8Array;
  tag: CLPublicKeyTag;

  constructor(
    rawPublicKey: Uint8Array,
    tag: CLPublicKeyTag | SignatureAlgorithm
  ) {
    super();
    // NOTE Two ifs because of the legacy indentifiers in ./Keys
    if (tag === CLPublicKeyTag.ED25519 || tag === SignatureAlgorithm.Ed25519) {
      if (rawPublicKey.length !== ED25519_LENGTH) {
        throw new Error(
          `Wrong length of ED25519 key. Expected ${ED25519_LENGTH}, but got ${rawPublicKey.length}.`
        );
      }
      this.data = rawPublicKey;
      this.tag = CLPublicKeyTag.ED25519;
      return;
    }
    if (
      tag === CLPublicKeyTag.SECP256K1 ||
      tag === SignatureAlgorithm.Secp256K1
    ) {
      if (rawPublicKey.length !== SECP256K1_LENGTH) {
        throw new Error(
          `Wrong length of SECP256K1 key. Expected ${SECP256K1_LENGTH}, but got ${rawPublicKey.length}.`
        );
      }
      this.data = rawPublicKey;
      this.tag = CLPublicKeyTag.SECP256K1;
      return;
    }
    throw new Error('Unsupported type of public key');
  }

  clType(): CLType {
    return new CLPublicKeyType();
  }

  isEd25519(): boolean {
    return this.tag === CLPublicKeyTag.ED25519;
  }

  isSecp256K1(): boolean {
    return this.tag === CLPublicKeyTag.SECP256K1;
  }

  toHex(checksummed = true): string {
    // Updated: Returns checksummed hex string
    const rawHex = `0${this.tag}${encodeBase16(this.data)}`;
    if (checksummed) {
      const bytes = decodeBase16(rawHex);
      return encode(bytes.slice(0, 1)) + encode(bytes.slice(1));
    }
    return rawHex;
  }

  toAccountHash(): Uint8Array {
    const algorithmIdentifier = CLPublicKeyTag[this.tag];
    const separator = Uint8Array.from([0]);
    const prefix = Buffer.concat([
      Buffer.from(algorithmIdentifier.toLowerCase()),
      separator
    ]);

    if (this.data.length === 0) {
      return Uint8Array.from([]);
    } else {
      return byteHash(concat([prefix, this.data]));
    }
  }

  toAccountHashStr(): string {
    const bytes = this.toAccountHash();
    const hashHex = Buffer.from(bytes).toString('hex');
    return `account-hash-${hashHex}`;
  }

  toAccountRawHashStr(): string {
    const bytes = this.toAccountHash();
    const hashHex = Buffer.from(bytes).toString('hex');
    return hashHex;
  }

  value(): Uint8Array {
    return this.data;
  }

  static fromEd25519(publicKey: Uint8Array): CLPublicKey {
    return new CLPublicKey(publicKey, CLPublicKeyTag.ED25519);
  }

  static fromSecp256K1(publicKey: Uint8Array): CLPublicKey {
    return new CLPublicKey(publicKey, CLPublicKeyTag.SECP256K1);
  }

  /**
   * Tries to decode PublicKey from its hex-representation.
   * The hex format should be as produced by CLPublicKey.toHex
   * @param publicKeyHex public key hex string contains key tag
   * @param checksummed throws an Error if true and given string is not checksummed
   */
  static fromHex(publicKeyHex: string, checksummed = false): CLPublicKey {
    if (publicKeyHex.length < 2) {
      throw new Error('Asymmetric key error: too short');
    }
    if (!/^0(1[0-9a-fA-F]{64}|2[0-9a-fA-F]{66})$/.test(publicKeyHex)) {
      throw new Error('Invalid public key');
    }
    if (!isChecksummed(publicKeyHex)) {
      console.warn(
        'Provided public key is not checksummed. Please check if you provide valid public key. You can generate checksummed public key from CLPublicKey.toHex(true).'
      );
      if (checksummed) throw Error('Provided public key is not checksummed.');
    }
    const publicKeyHexBytes = decodeBase16(publicKeyHex);

    return new CLPublicKey(publicKeyHexBytes.subarray(1), publicKeyHexBytes[0]);
  }

  getTag(): CLPublicKeyTag {
    return this.tag;
  }

  // TODO: mapping tag to signature algo because of the legacy indentifiers in ./Keys
  getSignatureAlgorithm(): SignatureAlgorithm {
    const mapTagToSignatureAlgorithm = (
      tag: CLPublicKeyTag
    ): SignatureAlgorithm => {
      const signatureAlgorithm = {
        [CLPublicKeyTag.ED25519]: SignatureAlgorithm.Ed25519,
        [CLPublicKeyTag.SECP256K1]: SignatureAlgorithm.Secp256K1
      }[tag];

      if (signatureAlgorithm === undefined) {
        throw Error('Unknown tag to signature algo mapping.');
      }

      return signatureAlgorithm;
    };

    return mapTagToSignatureAlgorithm(this.tag);
  }
}
