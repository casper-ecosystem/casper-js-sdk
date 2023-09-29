import {
  CLPublicKey,
  decodeBase64,
  SignatureAlgorithm
} from '@casper-js-sdk/types';

export abstract class AsymmetricKey {
  public readonly publicKey: CLPublicKey;
  public readonly privateKey: Uint8Array;
  public readonly signatureAlgorithm: SignatureAlgorithm;

  /**
   * Constructs an `AsymmetricKey` inherited object
   * @param {Uint8Array} publicKey An account's public key as a byte array
   * @param {Uint8Array} privateKey An account's private key as a byte array
   * @param {SignatureAlgorithm} signatureAlgorithm The signature algorithm of the key. Currently supported are Ed25519 and Secp256k1
   */
  constructor(
    publicKey: Uint8Array,
    privateKey: Uint8Array,
    signatureAlgorithm: SignatureAlgorithm
  ) {
    this.publicKey = new CLPublicKey(publicKey, signatureAlgorithm);
    this.privateKey = privateKey;
    this.signatureAlgorithm = signatureAlgorithm;
  }

  /**
   * Inserts the provided `content` and `tag` into a .pem compliant string
   * @param tag The tag inserted on the END line
   * @param content The base-64 PEM compliant private key
   */
  protected toPem(tag: string, content: string) {
    // prettier-ignore
    return `-----BEGIN ${tag}-----\n` +
      `${content}\n` +
      `-----END ${tag}-----\n`;
  }

  public static readBase64WithPEM(content: string) {
    const base64 = content
      // there are two kinks of line-endings, CRLF(\r\n) and LF(\n)
      // we need handle both
      .split(/\r?\n/)
      .filter(x => !x.startsWith('---'))
      .join('')
      // remove the line-endings in the end of content
      .trim();
    return decodeBase64(base64);
  }

  /**
   * Export the public key encoded as a .pem
   */
  public abstract exportPublicKeyInPem(): string;

  /**
   * Export the private key encoded as a .pem
   */
  public abstract exportPrivateKeyInPem(): string;

  /**
   * Sign a message using this `AsymmetricKey`'s private key
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns A byte array containing the signed message
   */
  public abstract sign(msg: Uint8Array): Uint8Array;

  /**
   * Validate the signature by comparing it to the provided message
   * @param {Uint8Array} signature The signature as a byte array
   * @param {Uint8Array} msg The original message to be validated
   * @returns `true` if the signature is valid, `false` otherwise
   */
  public abstract verify(signature: Uint8Array, msg: Uint8Array): boolean;
}
