import * as ed25519 from '@noble/ed25519';
import { PrivateKeyInternal } from '../PrivateKey';
import { sha512 } from '@noble/hashes/sha2';
import { Conversions } from '../../Conversions';
import { parseKey, readBase64WithPEM } from '../utils';

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

const ED25519_PEM_SECRET_KEY_TAG = 'PRIVATE KEY';

/**
 * Represents an Ed25519 private key, supporting key generation, signing, and PEM encoding.
 * Provides methods for creating instances from byte arrays, hexadecimal strings, and PEM format.
 */
export class PrivateKey implements PrivateKeyInternal {
  /** Size of the PEM prefix for Ed25519 private keys. */
  static PemFramePrivateKeyPrefixSize = 16;

  /** The raw bytes of the private key. */
  private key: Uint8Array;

  /**
   * Creates an instance of PrivateKey.
   * @param key - The private key bytes.
   */
  constructor(key: Uint8Array) {
    this.key = key;
  }

  /**
   * Generates a new random Ed25519 private key.
   * @returns A promise that resolves to a new PrivateKey instance.
   */
  static generate(): PrivateKey {
    const keyPair = ed25519.utils.randomPrivateKey();
    return new PrivateKey(keyPair);
  }

  /**
   * Retrieves the byte array of the associated public key.
   * @returns A promise that resolves to the public key bytes.
   */
  publicKeyBytes(): Uint8Array {
    return ed25519.sync.getPublicKey(this.key);
  }

  toBytes(): Uint8Array {
    return this.key;
  }

  /**
   * Signs a message using the private key.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signature bytes.
   */
  sign(message: Uint8Array): Uint8Array {
    return ed25519.sync.sign(message, this.key);
  }

  /**
   * Creates a PrivateKey instance from a byte array.
   * Validates that the byte array matches the expected length for an Ed25519 private key.
   * @param key - The byte array representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the byte array length is not 64.
   */
  static fromBytes(key: Uint8Array): PrivateKey {
    if (key.length !== 32) {
      throw new Error(`Invalid key size: expected 64 bytes, got ${key.length}`);
    }
    return new PrivateKey(key);
  }

  /**
   * Creates a PrivateKey instance from a hexadecimal string.
   * Converts the hexadecimal string to bytes and validates the length.
   * @param keyHex - The hexadecimal string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the hex string length is not 128 characters.
   */
  static fromHex(keyHex: string): PrivateKey {
    if (keyHex.length !== 64) {
      throw new Error(
        `Invalid hex string length: expected 64 characters, got ${keyHex.length}`
      );
    }
    const keyBytes = Buffer.from(keyHex, 'hex');
    return PrivateKey.fromBytes(keyBytes);
  }

  /**
   * Exports the private key to PEM format, with a standardized prefix and suffix.
   * @returns A PEM-encoded string of the private key.
   */
  toPem(): string {
    const derPrefix = Buffer.from([
      48,
      46,
      2,
      1,
      0,
      48,
      5,
      6,
      3,
      43,
      101,
      112,
      4,
      34,
      4,
      32
    ]);
    const encoded = Conversions.encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.key)])
    );

    return (
      `-----BEGIN ${ED25519_PEM_SECRET_KEY_TAG}-----\n` +
      `${encoded}\n` +
      `-----END ${ED25519_PEM_SECRET_KEY_TAG}-----\n`
    );
  }

  /**
   * Creates a PrivateKey instance from a PEM-encoded string.
   * Parses the PEM content to extract the private key bytes.
   * @param content - The PEM string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  static fromPem(content: string): PrivateKey {
    const privateKeyBytes = readBase64WithPEM(content);

    return new PrivateKey(
      new Uint8Array(Buffer.from(parseKey(privateKeyBytes, 0, 32)))
    );
  }
}
