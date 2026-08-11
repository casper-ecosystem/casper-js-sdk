import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';
import { PrivateKeyInternal } from '../PrivateKey';
import { Conversions } from '../../Conversions';
import { readBase64WithPEM } from '../utils';
import { encodePrivate } from './encoders';

secp256k1.utils.hmacSha256Sync = (k, ...m) =>
  hmac(sha256, k, secp256k1.utils.concatBytes(...m));

/**
 * Represents a secp256k1 private key, supporting key generation, signing, and PEM encoding.
 * The class offers static methods to create instances from bytes, hex, and PEM formats.
 */
export class PrivateKey implements PrivateKeyInternal {
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
   * Generates a new random secp256k1 private key.
   * @returns A promise that resolves to a new PrivateKey instance.
   */
  static generate(): PrivateKey {
    const privateKey = secp256k1.utils.randomPrivateKey();
    return new PrivateKey(privateKey);
  }

  /**
   * Retrieves the byte array of the public key in compressed format.
   * @returns A promise that resolves to the compressed public key bytes.
   */
  publicKeyBytes(): Uint8Array {
    return secp256k1.getPublicKey(this.key, true);
  }

  /**
   * Retrieves the byte array of the public key in compressed format.
   * @returns A promise that resolves to the compressed public key bytes.
   */
  async getPublicKeyBytes(): Promise<Uint8Array> {
    return secp256k1.getPublicKey(this.key, true);
  }

  toBytes(): Uint8Array {
    return this.key;
  }

  /**
   * Signs a message using the private key.
   * The message is first hashed with SHA-256 before signing.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signature bytes in compact format.
   */
  sign(message: Uint8Array): Uint8Array {
    const hash = sha256(message);
    return secp256k1.signSync(hash, this.key, { der: false });
  }

  /**
   * Creates a PrivateKey instance from a byte array.
   * @param key - The byte array representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the byte array length is not 32.
   */
  static fromBytes(key: Uint8Array): PrivateKey {
    if (key.length !== 32) {
      throw new Error(
        `Invalid private key length: expected 32 bytes, got ${key.length}`
      );
    }
    return new PrivateKey(key);
  }

  /**
   * Creates a PrivateKey instance from a hexadecimal string.
   * @param key - The hexadecimal string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the hex length is not 64 characters or if decoding fails.
   */
  static fromHex(key: string): PrivateKey {
    if (key.length !== 64) {
      throw new Error(
        `Invalid private key hex length: expected 64 characters, got ${key.length}`
      );
    }

    let decoded;
    try {
      decoded = secp256k1.utils.hexToBytes(key);
    } catch (err) {
      throw new Error(`Failed to decode hex: ${err}`, { cause: err });
    }

    return PrivateKey.fromBytes(decoded);
  }

  /**
   * Exports the private key to PEM format, which can be used for secure storage or sharing.
   * @returns A PEM-encoded string of the private key.
   */
  toPem(): string {
    return encodePrivate(Conversions.encodeBase16(this.key), 'raw', 'pem');
  }

  /**
   * Creates a PrivateKey instance from a PEM-encoded string.
   * @param content - The PEM string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  static fromPem(content: string): PrivateKey {
    const privateKeyBytes = readBase64WithPEM(content);

    const rawKeyHex = encodePrivate(Buffer.from(privateKeyBytes), 'der', 'raw');

    return new PrivateKey(new Uint8Array(Buffer.from(rawKeyHex, 'hex')));
  }
}
