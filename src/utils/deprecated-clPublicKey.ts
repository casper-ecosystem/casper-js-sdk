import { concat } from '@ethersproject/bytes';
import {
  CLType,
  CLTypePublicKey,
  CLValue,
  Conversions,
  PublicKey
} from '../types';
import { SignatureAlgorithm } from './deprecated-keys';
import { byteHash } from '../types/ByteConverters';

const ED25519_LENGTH = 32;
const SECP256K1_LENGTH = 33;

/** @deprecated */
export enum CLPublicKeyTag {
  ED25519 = 1,
  SECP256K1 = 2
}

/** @deprecated use {@link PublicKey} */
export class CLPublicKey extends CLValue {
  data: Uint8Array;
  tag: CLPublicKeyTag;
  private _publicKey: PublicKey;

  get pk(): PublicKey {
    return this._publicKey;
  }

  /** @deprecated */
  constructor(
    rawPublicKey: Uint8Array,
    tag: CLPublicKeyTag | SignatureAlgorithm
  ) {
    super(CLTypePublicKey);

    // NOTE Two ifs because of the legacy indentifiers in ./Keys
    if (tag === CLPublicKeyTag.ED25519 || tag === SignatureAlgorithm.Ed25519) {
      if (rawPublicKey.length !== ED25519_LENGTH) {
        throw new Error(
          `Wrong length of ED25519 key. Expected ${ED25519_LENGTH}, but got ${rawPublicKey.length}.`
        );
      }
      this.data = rawPublicKey;
      this.tag = CLPublicKeyTag.ED25519;

      const algorithmIdentifier = CLPublicKeyTag[this.tag];
      const separator = Uint8Array.from([0]);
      const prefix = Buffer.concat([
        Buffer.from(algorithmIdentifier.toLowerCase()),
        separator
      ]);

      this._publicKey = PublicKey.fromBytes(
        // TODO check if this.data contains prefix. If yes -> remove concat
        byteHash(concat([prefix, this.data]))
      ).result;
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

      const algorithmIdentifier = CLPublicKeyTag[this.tag];
      const separator = Uint8Array.from([0]);
      const prefix = Buffer.concat([
        Buffer.from(algorithmIdentifier.toLowerCase()),
        separator
      ]);

      this._publicKey = PublicKey.fromBytes(
        byteHash(concat([prefix, this.data])) // TODO check if this.data contains prefix. If yes -> remove concat
      ).result;
      return;
    }

    throw new Error('Unsupported type of public key');
  }

  /** @deprecated */
  clType(): CLType {
    return CLTypePublicKey;
  }

  /** @deprecated */
  isEd25519(): boolean {
    return this.tag === CLPublicKeyTag.ED25519;
  }

  /** @deprecated */
  isSecp256K1(): boolean {
    return this.tag === CLPublicKeyTag.SECP256K1;
  }

  /** @deprecated */
  toHex(checksummed = true): string {
    return this._publicKey.toHex(checksummed);
  }

  /** @deprecated */
  toAccountHash(): Uint8Array {
    return this._publicKey.accountHash().toBytes();
  }

  /** @deprecated */
  toAccountHashStr(): string {
    const bytes = this.toAccountHash();
    const hashHex = Buffer.from(bytes).toString('hex');
    return `account-hash-${hashHex}`;
  }

  /** @deprecated */
  toAccountRawHashStr(): string {
    const bytes = this.toAccountHash();
    const hashHex = Buffer.from(bytes).toString('hex');
    return hashHex;
  }

  /** @deprecated */
  value(): Uint8Array {
    return this.data;
  }

  /** @deprecated */
  static fromEd25519(publicKey: Uint8Array): CLPublicKey {
    return new CLPublicKey(publicKey, CLPublicKeyTag.ED25519);
  }

  /** @deprecated */
  static fromSecp256K1(publicKey: Uint8Array): CLPublicKey {
    return new CLPublicKey(publicKey, CLPublicKeyTag.SECP256K1);
  }

  /**
   * @deprecated
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

    if (!PublicKey.isChecksummed(publicKeyHex)) {
      console.warn(
        'Provided public key is not checksummed. Please check if you provide valid public key. You can generate checksummed public key from CLPublicKey.toHex(true).'
      );
      if (checksummed) throw Error('Provided public key is not checksummed.');
    }

    const publicKeyHexBytes = Conversions.decodeBase16(publicKeyHex);

    return new CLPublicKey(publicKeyHexBytes.subarray(1), publicKeyHexBytes[0]);
  }

  /** @deprecated */
  getTag(): CLPublicKeyTag {
    return this.tag;
  }

  /** @deprecated */
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
