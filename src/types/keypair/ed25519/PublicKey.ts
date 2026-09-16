import * as ed25519 from '@noble/ed25519';
import { Conversions } from '../../Conversions';
import { parseKey, readBase64WithPEM } from '../utils';

/** Expected size of an Ed25519 public key in bytes. */
const PublicKeySize = 32;
const ED25519_PEM_PUBLIC_KEY_TAG = 'PUBLIC KEY';

/**
 * Represents an Ed25519 public key, supporting signature verification
 * and loading from byte arrays.
 */
export class PublicKey {
  /** The raw bytes of the public key. */
  private key: Uint8Array;

  /**
   * Creates an instance of PublicKey.
   * @param key - The public key bytes.
   */
  constructor(key: Uint8Array) {
    this.key = key;
  }

  /**
   * Retrieves the byte array of the public key.
   * @returns A `Uint8Array` representing the public key.
   */
  bytes(): Uint8Array {
    return this.key;
  }

  /**
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   */
  public toPem(): string {
    const derPrefix = Buffer.from([
      48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0
    ]);
    const encoded = Conversions.encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.key)])
    );

    return (
      `-----BEGIN ${ED25519_PEM_PUBLIC_KEY_TAG}-----\n` +
      `${encoded}\n` +
      `-----END ${ED25519_PEM_PUBLIC_KEY_TAG}-----\n`
    );
  }

  /**
   * Creates a PublicKey instance from a PEM-encoded string.
   * @param content - The PEM string representing the private key.
   * @returns A new PublicKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  static fromPem(content: string): PublicKey {
    const publicKeyBytes = readBase64WithPEM(content);

    return new PublicKey(
      new Uint8Array(Buffer.from(parseKey(publicKeyBytes, 32, 64)))
    );
  }

  /**
   * Verifies a signature for a given message.
   * Utilizes the Ed25519 algorithm to check if the signature is valid
   * for the given message and public key.
   * @param message - The original message that was signed.
   * @param signature - The signature to verify.
   * @returns `true` if the signature is valid, or `false` otherwise.
   */
  verifySignature(message: Uint8Array, signature: Uint8Array): boolean {
    return ed25519.sync.verify(signature, message, this.key);
  }

  /**
   * Creates a PublicKey instance from a byte array.
   * Validates the size of the byte array to ensure it matches the expected
   * size of an Ed25519 public key.
   * @param data - The byte array representing the public key.
   * @returns A new PublicKey instance.
   * @throws Error if the byte array length is not equal to `PublicKeySize`.
   */
  static fromBytes(data: Uint8Array): PublicKey {
    if (data.length !== PublicKeySize) {
      throw new Error(`Can't parse wrong size of public key: ${data.length}`);
    }
    return new PublicKey(data);
  }
}
