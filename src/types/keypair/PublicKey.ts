import { jsonObject, jsonMember } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { PublicKey as Ed25519PublicKey } from './ed25519/PublicKey';
import { PublicKey as Secp256k1PublicKey } from './secp256k1/PublicKey';
import { Hash, AccountHash, PrefixName } from '../key';
import { Conversions } from '../Conversions';
import { IResultWithBytes } from '../clvalue';
import { byteHash } from '../ByteConverters';

/** Error thrown when the signature is empty. */
const ErrEmptySignature = new Error('empty signature');

/** Error thrown when the public key algorithm is invalid. */
const ErrInvalidPublicKeyAlgo = new Error('invalid public key algorithm');

/** Error thrown when the signature is invalid. */
const ErrInvalidSignature = new Error('invalid signature');

/** Error thrown when the public key is empty. */
const ErrEmptyPublicKey = new Error('empty public key');

/**
 * Enum representing the supported cryptographic algorithms for public keys.
 */
enum KeyAlgorithm {
  ED25519 = 1,
  SECP256K1 = 2
}

/**
 * Narrows a raw algorithm byte to the enum, undefined when it is not a known
 * variant. One chokepoint for that check is what stops a renumbered enum from
 * silently re-routing which key implementation decodes the following bytes.
 */
function toKeyAlgorithm(tag: number): KeyAlgorithm | undefined {
  return (Object.values(KeyAlgorithm) as unknown[]).includes(tag)
    ? (tag as KeyAlgorithm)
    : undefined;
}

const SMALL_BYTES_COUNT = 75;
// prettier-ignore
const HEX_CHARS = [
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
  'A', 'B', 'C', 'D', 'E', 'F'
];

/**
 * Interface representing the internal structure of a public key, which includes
 * methods for obtaining bytes and verifying signatures.
 */
interface PublicKeyInternal {
  /** Returns the bytes of the public key. */
  bytes(): Uint8Array;

  /**
   * Verifies a signature for a given message.
   * @param message - The message to verify.
   * @param sig - The signature to verify.
   * @returns `true` if the signature is valid for the message, otherwise `false`.
   */
  verifySignature(message: Uint8Array, sig: Uint8Array): boolean;

  /**
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   */
  toPem(): string;
}

/**
 * Represents a public key with a cryptographic algorithm and key data.
 * Provides utilities for serialization, verification, and obtaining an associated account hash.
 */
@jsonObject
export class PublicKey {
  /** The cryptographic algorithm used for the key. */
  @jsonMember({ constructor: Number })
  cryptoAlg: KeyAlgorithm;

  /** The key data associated with the public key. */
  key: PublicKeyInternal | null;

  /**
   * Creates an instance of PublicKey.
   * @param cryptoAlg - The cryptographic algorithm used by the key.
   * @param key - The actual key data.
   */
  constructor(cryptoAlg: KeyAlgorithm, key: PublicKeyInternal) {
    this.cryptoAlg = cryptoAlg;
    this.key = key;
  }

  /**
   * Returns the byte representation of the public key.
   * @returns A Uint8Array of the public key bytes.
   */
  bytes(): Uint8Array {
    if (!this.key) {
      return new Uint8Array();
    }

    const cryptoAlgBytes = new Uint8Array([this.cryptoAlg]);
    const keyBytes = this.key.bytes();

    return concat([cryptoAlgBytes, keyBytes]);
  }

  /**
   * Converts the public key to a hexadecimal string representation.
   *
   * @param checksummed - A boolean indicating whether to return a checksummed version of the hex string.
   *   - `true`: Includes a checksum in the output.
   *   - `false` (default): Returns the raw hexadecimal string without a checksum.
   * @returns The hexadecimal string representation of the public key.
   *   - If `checksummed` is `true`, the result includes a checksum.
   *   - If `checksummed` is `false`, the raw hex string is returned.
   * @throws {Error} If the public key is not initialized properly (i.e., `this.key` is missing).
   */
  toHex(checksummed = false): string {
    if (!this.key) {
      throw new Error('Public key initialised incorrectly. Missing key');
    }

    const rawHex = `0${this.cryptoAlg}${Conversions.encodeBase16(
      this.key.bytes()
    )}`;

    if (checksummed) {
      const bytes = Conversions.decodeBase16(rawHex);
      return (
        PublicKey.encode(bytes.slice(0, 1)) + PublicKey.encode(bytes.slice(1))
      );
    }

    return rawHex;
  }

  /**
   * Serializes the public key to a JSON-compatible string.
   * @returns A JSON string representation of the public key.
   */
  toJSON(): string {
    return this.toHex();
  }

  /**
   * Converts the public key to a string representation.
   * @returns A string representation of the public key in hexadecimal.
   */
  toString(): string {
    return this.toHex();
  }

  /**
   * Creates a PublicKey instance from a JSON string.
   * @param json - The JSON string.
   * @returns A new PublicKey instance.
   */
  static fromJSON(json: string): PublicKey {
    return PublicKey.fromHex(json);
  }

  /**
   * Creates a PublicKey instance from a hexadecimal string.
   * @param source - The hexadecimal string.
   * @returns A new PublicKey instance.
   */
  // static fromHex(source: string): PublicKey {
  //   const publicKeyHexBytes = Conversions.decodeBase16(source);
  //
  //   return PublicKey.fromBuffer(publicKeyHexBytes);
  // }

  /**
   * Tries to decode PublicKey from its hex-representation.
   * The hex format should be as produced by PublicKey.toHex
   * @param publicKeyHex public key hex string contains key tag
   * @param checksummed throws an Error if true and given string is not checksummed
   */
  static fromHex(publicKeyHex: string, checksummed = false): PublicKey {
    if (publicKeyHex.length < 2) {
      throw new Error('Public key error: too short');
    }

    if (!/^0(1[0-9a-fA-F]{64}|2[0-9a-fA-F]{66})$/.test(publicKeyHex)) {
      throw new Error('Invalid public key');
    }

    if (checksummed && !PublicKey.isChecksummed(publicKeyHex)) {
      throw Error('Provided public key is not checksummed.');
    }

    return PublicKey.fromBuffer(Conversions.decodeBase16(publicKeyHex));
  }

  /**
   * Creates a PublicKey instance from an ArrayBuffer or a byte array.
   * @param buffer - The ArrayBuffer or `Uint8Array` holding the algorithm byte
   *   followed by the raw key bytes.
   * @returns A new PublicKey instance.
   * @throws Error if the public key algorithm is invalid.
   */
  public static fromBuffer(buffer: ArrayBuffer | Uint8Array): PublicKey {
    const byteArray = new Uint8Array(buffer);
    const alg = byteArray[0] as KeyAlgorithm;
    const keyData = byteArray.slice(1);

    let key: PublicKeyInternal;
    switch (alg) {
      case KeyAlgorithm.ED25519:
        key = new Ed25519PublicKey(keyData);
        break;
      case KeyAlgorithm.SECP256K1:
        key = new Secp256k1PublicKey(keyData);
        break;
      default:
        throw ErrInvalidPublicKeyAlgo;
    }

    return new PublicKey(alg, key);
  }

  /**
   * Generates an account hash for the public key, used to uniquely identify an account.
   * @returns An AccountHash representing the account associated with this public key.
   */
  accountHash(): AccountHash {
    if (!this.key) {
      return new AccountHash(new Hash(new Uint8Array(0)));
    }

    const algString = KeyAlgorithm[this.cryptoAlg].toLowerCase();
    const algBytes = new TextEncoder().encode(algString);
    const separatorByte = new Uint8Array([0]);
    const keyBytes = this.key.bytes();

    const bytesToHash = concat([algBytes, separatorByte, keyBytes]);

    const blakeHash = byteHash(bytesToHash);
    const hash = Hash.fromBuffer(Buffer.from(blakeHash));
    return new AccountHash(hash, PrefixName.Account);
  }

  /**
   * Verifies a signature for a given message.
   * @param message - The message to verify.
   * @param sig - The signature to verify.
   * @returns `true` if the signature is valid for the message, otherwise `false`.
   * @throws Error if the signature or public key is empty, or if the signature is invalid.
   */
  verifySignature(message: Uint8Array, sig: Uint8Array): boolean {
    if (sig.length <= 1) throw ErrEmptySignature;
    if (!this.key) throw ErrEmptyPublicKey;

    const sigWithoutAlgByte = sig.slice(1);
    const signature = this.key.verifySignature(message, sigWithoutAlgByte);

    if (!signature) throw ErrInvalidSignature;

    return signature;
  }

  public toPem(): string {
    return this.key!.toPem();
  }

  /**
   * Creates a PublicKey instance from a PEM-encoded string.
   * @param content - The PEM string representing the private key.
   * @param algorithm - The KeyAlgorithm of PEM
   * @returns A new PublicKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  public static fromPem(content: string, algorithm: KeyAlgorithm) {
    let key: PublicKeyInternal;

    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        key = Ed25519PublicKey.fromPem(content);
        break;
      case KeyAlgorithm.SECP256K1:
        key = Secp256k1PublicKey.fromPem(content);
        break;
      default:
        throw ErrInvalidPublicKeyAlgo;
    }

    return new PublicKey(algorithm, key);
  }

  /**
   * Checks equality between two PublicKey instances.
   * @param other - The other PublicKey instance to compare.
   * @returns True if the two PublicKey instances are equal; otherwise, false.
   */
  equals(other: PublicKey): boolean {
    return this.toHex() === other.toHex();
  }

  /**
   * Creates a new PublicKey instance from a hex string.
   * @param source - The hex string.
   * @returns A new PublicKey instance.
   */
  static newPublicKey(source: string): PublicKey {
    const data = Buffer.from(source, 'hex');
    return this.fromBytes(data)?.result;
  }

  /**
   * Creates a PublicKey instance from a byte array.
   * @param source - The byte array.
   * @returns A new PublicKey instance.
   * @throws Error if the public key algorithm is invalid.
   */
  static fromBytes(source: Uint8Array): IResultWithBytes<PublicKey> {
    const alg = toKeyAlgorithm(source[0]);
    if (alg === undefined) {
      throw ErrInvalidPublicKeyAlgo;
    }
    let key: PublicKeyInternal | null = null;
    let expectedPublicKeySize;

    switch (alg) {
      case KeyAlgorithm.ED25519:
        expectedPublicKeySize = 32;
        key = new Ed25519PublicKey(
          source.subarray(1, expectedPublicKeySize + 1)
        );
        break;
      case KeyAlgorithm.SECP256K1:
        expectedPublicKeySize = 33;
        key = new Secp256k1PublicKey(
          source.subarray(1, expectedPublicKeySize + 1)
        );
        break;
    }

    return {
      result: new PublicKey(alg, key),
      bytes: source.subarray(expectedPublicKeySize + 1)
    };
  }

  /**
   * Verify a mixed-case hexadecimal string that it conforms to the checksum scheme
   * similar to scheme in [EIP-55](https://eips.ethereum.org/EIPS/eip-55).
   * Key differences:
   * - Works on any length of (decoded) data up to `SMALL_BYTES_COUNT`, not just 20-byte addresses
   * - Uses Blake2b hashes rather than Keccak
   * - Uses hash bits rather than nibbles
   * For backward compatibility: if the hex string is all uppercase or all lowercase, the check is
   * skipped.
   * @param input string to check if it is checksummed
   * @returns true if input is checksummed
   */
  static isChecksummed = (input: string): boolean => {
    const bytes = new Uint8Array(Buffer.from(input, 'hex'));

    if (bytes.length > SMALL_BYTES_COUNT || isSameCase(input)) return true;

    if (isValidPublicKey(input)) {
      return (
        input ===
        PublicKey.encode(bytes.slice(0, 1)) + PublicKey.encode(bytes.slice(1))
      );
    }

    return input === PublicKey.encode(bytes);
  };

  /**
   * Returns the bytes encoded as hexadecimal with mixed-case based checksums following a scheme
   * similar to [EIP-55](https://eips.ethereum.org/EIPS/eip-55).
   * Key differences:
   * - Works on any length of data, not just 20-byte addresses
   * - Uses Blake2b hashes rather than Keccak
   * - Uses hash bits rather than nibbles
   * @param input Uint8Array to generate checksummed hex string
   * @returns checksummed hex presentation string of input
   */
  static encode = (input: Uint8Array): string => {
    const inputNibbles = bytesToNibbles(input);
    const hashBits = bytesToBitsCycle(byteHash(input)).values();

    const hexOutputString = inputNibbles.reduce((accum, nibble) => {
      const c = HEX_CHARS[nibble];

      if (/^[a-zA-Z()]+$/.test(c) && hashBits.next().value) {
        return accum + c.toUpperCase();
      } else {
        return accum + c.toLowerCase();
      }
    }, '');

    return hexOutputString;
  };
}

/**
 * Represents a list of public keys, with utility methods for checking membership and managing keys.
 */
export class PublicKeyList {
  private keys: PublicKey[];

  /**
   * Creates an instance of PublicKeyList.
   * @param keys - An optional array of PublicKey instances.
   */
  constructor(keys: PublicKey[] = []) {
    this.keys = keys;
  }

  /**
   * Checks if a given PublicKey is present in the list.
   * @param target - The PublicKey to check for.
   * @returns True if the target PublicKey is in the list; otherwise, false.
   */
  contains(target: PublicKey): boolean {
    return this.keys.some(key => key.equals(target));
  }
}

export function isSameCase(value: string) {
  return /^[a-z0-9]+$|^[A-Z0-9]+$/.test(value);
}

export function isValidPublicKey(key: string) {
  return /^0(1[0-9a-fA-F]{64}|2[0-9a-fA-F]{66})$/.test(key);
}

function bytesToNibbles(bytes: Uint8Array): Uint8Array {
  const outputNibbles = bytes.reduce<Uint8Array>((accum, byte) => {
    return concat([accum, Uint8Array.of(byte >>> 4, byte & 0x0f)]);
  }, new Uint8Array());

  return outputNibbles;
}

function bytesToBitsCycle(bytes: Uint8Array) {
  const output: boolean[] = [];

  for (let i = 0, k = 0; i < bytes.length; i++)
    for (let j = 0; j < 8; j++)
      output[k++] = ((bytes[i] >>> j) & 0x01) === 0x01;

  return output;
}
