import { KeyAlgorithm, PrivateKey, PublicKey } from '../types/keypair';
import { Conversions } from '../types';
import KeyEncoder from 'key-encoder';
import * as fs from 'fs';
import { CLPublicKey } from "./deprecated-clPublicKey";

/**
 * @deprecated use {@link KeyAlgorithm} instead
 * @enum
 */
export enum SignatureAlgorithm {
  Ed25519 = 'ed25519',
  Secp256K1 = 'secp256k1'
}

const keyEncoder = new KeyEncoder('secp256k1');

const mapSignatureAlgorithmToKeyAlgorithm: Record<
  SignatureAlgorithm,
  KeyAlgorithm
> = {
  [SignatureAlgorithm.Ed25519]: KeyAlgorithm.ED25519,
  [SignatureAlgorithm.Secp256K1]: KeyAlgorithm.SECP256K1
};

const ED25519_PEM_SECRET_KEY_TAG = 'PRIVATE KEY';
const ED25519_PEM_PUBLIC_KEY_TAG = 'PUBLIC KEY';

/** @deprecated */
export interface SignKeyPair {
  publicKey: Uint8Array; // Array with 32-byte public key
  secretKey: Uint8Array; // Array with 32-byte secret key
}

/** @deprecated */
export const getKeysFromHexPrivKey = (
  key: string,
  variant: SignatureAlgorithm
): AsymmetricKey => {
  const privateKey = PrivateKey.fromHex(
    key,
    mapSignatureAlgorithmToKeyAlgorithm[variant]
  );

  let keyPair: AsymmetricKey;

  if (variant === SignatureAlgorithm.Secp256K1) {
    keyPair = new Secp256K1(privateKey.toBytes(), privateKey.publicKey.bytes());
    return keyPair;
  }

  if (variant === SignatureAlgorithm.Ed25519) {
    keyPair = new Ed25519({
      publicKey: privateKey.publicKey.bytes(),
      secretKey: privateKey.toBytes()
    });
    return keyPair;
  }

  throw Error('Unsupported key type');
};

/**
 * @deprecated
 * Reads in a base64 private key, ignoring the header: `-----BEGIN PUBLIC KEY-----`
 * and footer: `-----END PUBLIC KEY-----`
 * @param {string} content A .pem private key string with a header and footer
 * @returns A base64 private key as a `Uint8Array`
 * @remarks
 * If the provided base64 `content` string does not include a header/footer,
 * it will pass through this function unaffected
 * @example
 * Example PEM:
 *
 * ```
 * -----BEGIN PUBLIC KEY-----\r\n
 * MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEj1fgdbpNbt06EY/8C+wbBXq6VvG+vCVD\r\n
 * Nl74LvVAmXfpdzCWFKbdrnIlX3EFDxkd9qpk35F/kLcqV3rDn/u3dg==\r\n
 * -----END PUBLIC KEY-----\r\n
 * ```
 */
export function readBase64WithPEM(content: string): Uint8Array {
  const base64 = content
    // there are two kinks of line-endings, CRLF(\r\n) and LF(\n)
    // we need handle both
    .split(/\r?\n/)
    .filter(x => !x.startsWith('---'))
    .join('')
    // remove the line-endings in the end of content
    .trim();
  return Conversions.decodeBase64(base64);
}

/** @deprecated  use {@link PublicKey.verifySignature} instead */
export const validateSignature = (
  msg: Uint8Array,
  signature: Uint8Array,
  pk: CLPublicKey
): boolean => {
  return pk.pk.verifySignature(msg, signature);
};

/** @deprecated use {@link PrivateKey} and {@link PublicKey} instead */
export abstract class AsymmetricKey {
  public readonly publicKey: CLPublicKey;
  public readonly privateKey: Uint8Array;
  protected readonly _privateKey: PrivateKey;
  public readonly signatureAlgorithm: SignatureAlgorithm;

  /**
   * @deprecated use {@link PrivateKey} and {@link PublicKey} instead
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
    this._privateKey = PrivateKey.fromHex(
      Conversions.encodeBase16(privateKey),
      mapSignatureAlgorithmToKeyAlgorithm[signatureAlgorithm]
    );
    this.signatureAlgorithm = signatureAlgorithm;
  }

  /**
   * @deprecated use {@link PublicKey}.accountHash().toBytes() instead
   * Computes the blake2b account hash of the public key
   * @returns The account hash as a byte array
   */
  public accountHash(): Uint8Array {
    return this.publicKey.pk.accountHash().toBytes();
  }

  /**
   * @deprecated use {@link PublicKey}.toHex() instead
   * Gets the hexadecimal public key of the account
   * @param {boolean} checksummed Indicates whether the public key should be checksummed, default: `true`
   * @returns The public key of the `AsymmetricKey` as a hexadecimal string
   */
  public accountHex(checksummed = true): string {
    return this.publicKey.pk.toHex(checksummed);
  }

  /**
   * @deprecated
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

  /**
   * @deprecated
   * Export the public key encoded as a .pem
   */
  public abstract exportPublicKeyInPem(): string;

  /**
   * @deprecated use {@link PrivateKey.toPem}
   * Export the private key encoded as a .pem
   */
  public abstract exportPrivateKeyInPem(): string;

  /**
   * @deprecated use {@link PrivateKey.sign}
   * Sign a message using this `AsymmetricKey`'s private key
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns A byte array containing the signed message
   */
  public abstract sign(msg: Uint8Array): Uint8Array;

  /**
   * @deprecated use {@link PublicKey.verifySignature}
   * Validate the signature by comparing it to the provided message
   * @param {Uint8Array} signature The signature as a byte array
   * @param {Uint8Array} msg The original message to be validated
   * @returns `true` if the signature is valid, `false` otherwise
   */
  public abstract verify(signature: Uint8Array, msg: Uint8Array): boolean;
}

/**
 * @deprecated
 * Ed25519 variant of `AsymmetricKey`
 * @remarks
 * Based on SignatureAlgorithm.scala
 * @see [Documentation](https://docs.casper.network/concepts/accounts-and-keys/#eddsa-keys)
 */
export class Ed25519 extends AsymmetricKey {
  /**
   * @deprecated
   * Constructs a new Ed25519 object from a `SignKeyPair`
   * @param {SignKeyPair} keyPair An object containing the keys "publicKey" and "secretKey" with corresponding `ByteArray` values
   */
  constructor(keyPair: SignKeyPair) {
    if (keyPair.secretKey.length != 32) {
      console.warn(
        `You're using private key from old version, please use newly formatted key with 32 bytes length.`
      );
    }

    super(
      keyPair.publicKey,
      Ed25519.parsePrivateKey(keyPair.secretKey),
      SignatureAlgorithm.Ed25519
    );
  }

  /**
   * @deprecated use {@link PrivateKey}.generate(KeyAlgorithm.ED25519)
   * Generates a new Ed25519 key pair
   * @returns A new `Ed25519` object
   */
  public static new() {
    const privateKey = PrivateKey.generate(KeyAlgorithm.ED25519);
    const publicKey = privateKey.publicKey;
    return new Ed25519({
      secretKey: privateKey.toBytes(),
      publicKey: publicKey.bytes()
    });
  }

  /**
   * @deprecated use {@link PublicKey}.accountHash().toHex()
   * Generate the accountHex for the Ed25519 public key
   * @param publicKey
   */
  public static accountHex(publicKey: Uint8Array): string {
    return PublicKey.fromBytes(publicKey)
      .result.accountHash()
      .toHex();
  }

  /**
   * @deprecated
   * Parse the key pair from a public key file and the corresponding private key file
   * @param {string} publicKeyPath Path of public key file
   * @param {string} privateKeyPath Path of private key file
   * @returns A new `AsymmetricKey`
   */
  public static parseKeyFiles(
    publicKeyPath: string,
    privateKeyPath: string
  ): AsymmetricKey {
    const publicKey = Ed25519.parsePublicKeyFile(publicKeyPath);
    const privateKey = Ed25519.parsePrivateKeyFile(privateKeyPath);
    return new Ed25519({
      publicKey,
      secretKey: privateKey
    });
  }

  /**
   * @deprecated use {@link PublicKey}.accountHash().toBytes() instead
   * Generates the account hash of a Ed25519 public key
   * @param {Uint8Array} publicKey An Ed25519 public key
   * @returns The blake2b account hash of the public key
   */
  public static accountHash(publicKey: Uint8Array): Uint8Array {
    return PublicKey.fromBytes(publicKey)
      .result.accountHash()
      .toBytes();
  }

  /**
   * @deprecated
   * Construct a keypair from a public key and corresponding private key
   * @param {Uint8Array} publicKey The public key of an Ed25519 account
   * @param {Uint8Array} privateKey The private key of the same Ed25519 account
   * @returns A new `Ed25519` keypair
   */
  public static parseKeyPair(
    publicKey: Uint8Array,
    privateKey: Uint8Array
  ): Ed25519 {
    const keyPair = new Ed25519({
      publicKey: PublicKey.fromBytes(publicKey).result.bytes(),
      secretKey: PrivateKey.fromHex(
        Conversions.encodeBase16(privateKey),
        KeyAlgorithm.ED25519
      ).toBytes()
    });

    return keyPair;
  }

  /** @deprecated */
  public static parsePrivateKeyFile(path: string): Uint8Array {
    return Ed25519.parsePrivateKey(Ed25519.readBase64File(path));
  }

  /**
   * @deprecated
   * Parses a file containing an Ed25519 public key
   * @param {string} path The path to the public key file
   * @returns A `Uint8Array` typed representation of the public key
   * @see {@link Ed25519.parsePublicKey}
   */
  public static parsePublicKeyFile(path: string): Uint8Array {
    return Ed25519.parsePublicKey(Ed25519.readBase64File(path));
  }

  /**
   * @deprecated
   * Parses a byte array containing an Ed25519 private key
   * @param {Uint8Array} bytes A private key as a byte array
   * @returns A validated byte array containing the provided Ed25519 private key
   * @see {@link Ed25519.parseKey}
   */
  public static parsePrivateKey(bytes: Uint8Array) {
    return Ed25519.parseKey(bytes, 0, 32);
  }

  /**
   * @deprecated
   * Parses a byte array containing an Ed25519 public key
   * @param {Uint8Array} bytes A public key in bytes
   * @returns A validated byte array containing the provided Ed25519 public key
   * @see {@link Ed25519.parseKey}
   */
  public static parsePublicKey(bytes: Uint8Array) {
    return Ed25519.parseKey(bytes, 32, 64);
  }

  /**
   * @deprecated
   * Calls global {@link readBase64WithPEM} and returns the result
   * @param {string} content A .pem private key string with a header and footer
   * @returns The result of global `readBase64WithPEM`
   * @see {@link readBase64WithPEM}
   */
  public static readBase64WithPEM(content: string) {
    return readBase64WithPEM(content);
  }

  /**
   * @deprecated
   * Read the Base64 content of a file, ignoring PEM frames
   * @param {string} path The path to the PEM file
   * @returns The result of {@link Ed25519.readBase64WithPEM} after reading in the content as a `string` with `fs`
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return Ed25519.readBase64WithPEM(content);
  }

  /**
   * @deprecated
   * Parses and validates a key in a certain range "from" to "to"
   * @param {Uint8Array} bytes The key to be parsed and validated
   * @param {number} from The starting index from which to parse the key
   * @param {number} to The ending index from which to parse the key
   * @returns The parsed key
   * @throws `Error` if the key is of an unexpected length
   */
  private static parseKey(bytes: Uint8Array, from: number, to: number) {
    const len = bytes.length;
    // prettier-ignore
    const key =
      (len === 32) ? bytes :
        (len === 64) ? Buffer.from(bytes).slice(from, to) :
          (len > 32 && len < 64) ? Buffer.from(bytes).slice(len % 32) :
            null;
    if (key == null || key.length !== 32) {
      throw Error(`Unexpected key length: ${len}`);
    }
    return key;
  }

  /**
   * @deprecated
   * Convert this instance's private key to PEM format
   * @returns A PEM compliant string containing this instance's private key
   * @see {@link AsymmetricKey.toPem}
   */
  public exportPrivateKeyInPem() {
    // prettier-ignore
    const derPrefix = Buffer.from([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
    const encoded = Conversions.encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.privateKey)])
    );

    return this.toPem(ED25519_PEM_SECRET_KEY_TAG, encoded);
  }

  /**
   * @deprecated
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   * @see {@link AsymmetricKey.toPem}
   */
  public exportPublicKeyInPem() {
    // prettier-ignore
    const derPrefix = Buffer.from([48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0]);
    const encoded = Conversions.encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.publicKey.bytes())])
    );
    return this.toPem(ED25519_PEM_PUBLIC_KEY_TAG, encoded);
  }

  /**
   * @deprecated
   * Sign a message by using this instance's keypair
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns `Uint8Array` typed signature of the provided `msg`
   */
  public sign(msg: Uint8Array): Uint8Array {
    return this._privateKey.sign(msg);
  }

  /**
   * @deprecated
   * Verifies a signature given the signature and the original message
   * @param {Uint8Array} signature The signed message as a byte array
   * @param {Uint8Array} msg The original message as a byte array
   * @returns 'true' if the message if valid, `false` otherwise
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return this.publicKey.pk.verifySignature(msg, signature);
  }

  /**
   * @deprecated
   * Derive a public key from private key or seed phrase
   * @param {Uint8Array} privateKey The private key or seed phrase from which to derive the public key
   * @returns A `Uint8Array` public key generated deterministically from the provided private key or seed phrase
   * @remarks Both secret keys and seed phrases may be used to derive the public key
   */
  public static privateToPublicKey(privateKey: Uint8Array): Uint8Array {
    return PrivateKey.fromHex(
      Conversions.encodeBase16(privateKey),
      KeyAlgorithm.ED25519
    ).publicKey.bytes();
  }

  /**
   * @deprecated
   * Restore Ed25519 keyPair from private key file
   * @param {string} privateKeyPath The path to the private key file
   * @returns An Ed25519 `AsymmetricKey`
   * @see {@link Ed25519.parsePrivateKeyFile}
   * @see {@link Ed25519.privateToPublicKey}
   * @see {@link Ed25519.parseKeyPair}
   */
  public static loadKeyPairFromPrivateFile(privateKeyPath: string) {
    const privateKey = Ed25519.parsePrivateKeyFile(privateKeyPath);
    const publicKey = Ed25519.privateToPublicKey(privateKey);
    return Ed25519.parseKeyPair(publicKey, privateKey);
  }
}

/**
 * @deprecated
 * Secp256k1 variant of `AsymmetricKey`
 * @privateRemarks
 * Orignated from [Secp256k1](https://en.bitcoin.it/wiki/Secp256k1) to support Ethereum keys on the Casper.
 * @see [Documentation](https://docs.casper.network/concepts/accounts-and-keys/#ethereum-keys)
 */
export class Secp256K1 extends AsymmetricKey {
  /**
   * @deprecated
   * Constructs a new Secp256K1 object from a public key and a private key
   * @param {Uint8Array} publicKey A secp256k1 public key
   * @param {Uint8Array} privateKey A secp256k1 private key
   */
  constructor(publicKey: Uint8Array, privateKey: Uint8Array) {
    super(publicKey, privateKey, SignatureAlgorithm.Secp256K1);
  }

  /**
   * @deprecated
   * Generate a new pseudorandom Secp256k1 key pair
   * @returns A new `Secp256K1` object
   */
  public static new() {
    const privateKey = PrivateKey.generate(KeyAlgorithm.SECP256K1);
    const publicKey = privateKey.publicKey;
    return new Secp256K1(publicKey.bytes(), privateKey.toBytes());
  }

  /**
   * @deprecated
   * Parse the key pair from a public key file and the corresponding private key file
   * @param {string} publicKeyPath Path of public key file
   * @param {string} privateKeyPath Path of private key file
   * @returns A new `Secp256K1` object
   */
  public static parseKeyFiles(
    publicKeyPath: string,
    privateKeyPath: string
  ): AsymmetricKey {
    const publicKey = Secp256K1.parsePublicKeyFile(publicKeyPath);
    const privateKey = Secp256K1.parsePrivateKeyFile(privateKeyPath);
    return new Secp256K1(publicKey, privateKey);
  }

  /**
   * @deprecated use {@link PublicKey}.accountHash().toBytes() instead
   * Generates the account hash of a secp256k1 public key
   * @param {Uint8Array} publicKey A secp256k1 public key
   * @returns The blake2b account hash of the public key
   */
  public static accountHash(publicKey: Uint8Array): Uint8Array {
    return PublicKey.fromBytes(publicKey).result.bytes();
  }

  /**
   * @deprecated
   * Converts a `Uint8Array` public key to hexadecimal format
   * @param publicKey
   * @remarks
   * The returned public key hex will be prefixed with a "02" to indicate that it is of the secp256k1 variety
   */
  public static accountHex(publicKey: Uint8Array): string {
    return PublicKey.fromBytes(publicKey).result.toHex();
  }

  /**
   * @deprecated
   * Construct a keypair from a public key and corresponding private key
   * @param {Uint8Array} publicKey The public key of a secp256k1 account
   * @param {Uint8Array} privateKey The private key of the same secp256k1 account
   * @returns A new `AsymmetricKey` keypair
   */
  public static parseKeyPair(
    publicKey: Uint8Array,
    privateKey: Uint8Array,
    originalFormat: 'raw' | 'der'
  ): AsymmetricKey {
    const publ = Secp256K1.parsePublicKey(publicKey, originalFormat);
    const priv = Secp256K1.parsePrivateKey(privateKey, originalFormat);
    // nacl expects that the private key will contain both.
    return new Secp256K1(publ, priv);
  }

  /**
   * @deprecated
   * Parses a file containing a secp256k1 private key
   * @param {string} path The path to the private key file
   * @returns A `Uint8Array` typed representation of the private key
   * @see {@link Secp256K1.parsePrivateKey}
   */
  public static parsePrivateKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePrivateKey(Secp256K1.readBase64File(path));
  }

  /**
   * @deprecated
   * Parses a file containing a secp256k1 public key
   * @param {string} path The path to the public key file
   * @returns A `Uint8Array` typed representation of the private key
   * @see {@link Secp256K1.parsePublicKey}
   */
  public static parsePublicKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePublicKey(Secp256K1.readBase64File(path));
  }

  /**
   * @deprecated
   * Parses a byte array containing an Ed25519 public key
   * @param {Uint8Array} bytes A public key in bytes
   * @param {string} [originalFormat=der] The original format of the private key.
   * Options are "der" or "raw", meaning "derived" or "raw", indicating a seed phrase and
   * a raw private key respectively.
   * @returns A validated byte array containing the provided Ed25519 public key
   * @privateRemarks Validate that "der" means derived and "raw" means a raw public key
   */
  public static parsePublicKey(
    bytes: Uint8Array,
    originalFormat: 'der' | 'raw' = 'der'
  ) {
    let rawKeyHex: string;
    if (originalFormat === 'der') {
      rawKeyHex = keyEncoder.encodePublic(Buffer.from(bytes), 'der', 'raw');
    } else {
      rawKeyHex = Conversions.encodeBase16(bytes);
    }

    const publicKey = Uint8Array.from(Buffer.from(rawKeyHex, 'hex'));

    return publicKey;
  }

  /**
   * @deprecated
   * Parses a byte array containing a secp256k1 private key
   * @param {Uint8Array} bytes A private key as a byte array
   * @param {string} [originalFormat=der] The original format of the private key.
   * Options are "der" or "raw", meaning "derived" or "raw", indicating a seed phrase and
   * a raw private key respectively.
   * @returns A validated byte array containing the provided secp256k1 private key
   * @privateRemarks Validate that "der" means derived and "raw" means a raw private key
   */
  public static parsePrivateKey(
    bytes: Uint8Array,
    originalFormat: 'der' | 'raw' = 'der'
  ) {
    let rawKeyHex: string;
    if (originalFormat === 'der') {
      rawKeyHex = keyEncoder.encodePrivate(Buffer.from(bytes), 'der', 'raw');
    } else {
      rawKeyHex = Conversions.encodeBase16(bytes);
    }

    const privateKey = Buffer.from(rawKeyHex, 'hex');
    return privateKey;
  }

  /**
   * @deprecated
   * Calls global {@link readBase64WithPEM} and returns the result
   * @param {string} content A .pem private key string with a header and footer
   * @returns The result of global `readBase64WithPEM`
   * @see {@link readBase64WithPEM}
   */
  public static readBase64WithPEM(content: string) {
    return readBase64WithPEM(content);
  }

  /**
   * @deprecated
   * Read the Base64 content of a file, ignoring PEM frames
   * @param {string} path The path to the PEM file
   * @returns The result of {@link Secp256K1.readBase64WithPEM} after reading in the content as a `string` with `fs`
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return Secp256K1.readBase64WithPEM(content);
  }

  /**
   * @deprecated
   * Convert this instance's private key to PEM format
   * @returns A PEM compliant string containing this instance's private key
   */
  public exportPrivateKeyInPem(): string {
    return keyEncoder.encodePrivate(
      Conversions.encodeBase16(this.privateKey),
      'raw',
      'pem'
    );
  }

  /**
   * @deprecated
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   */
  public exportPublicKeyInPem(): string {
    return keyEncoder.encodePublic(
      Conversions.encodeBase16(this.publicKey.bytes()),
      'raw',
      'pem'
    );
  }

  /**
   * @deprecated
   * Sign a message by using this instance's keypair
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns `Uint8Array` typed signature of the provided `msg`
   * @see [secp256k1.ecdsaSign](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#ecdsasignmessage-uint8array-privatekey-uint8array--data-noncefn---data-uint8array-noncefn-message-uint8array-privatekey-uint8array-algo-null-data-uint8array-counter-number--uint8array----output-uint8array--len-number--uint8array--signature-uint8array-recid-number-)
   */
  public sign(msg: Uint8Array): Uint8Array {
    return this._privateKey.sign(msg);
  }

  /**
   * @deprecated
   * Verifies a signature given the signature and the original message
   * @param {Uint8Array} signature The signed message as a byte array
   * @param {Uint8Array} msg The original message as a byte array
   * @see [secp256k1.ecdsaVerify](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#ecdsaverifysignature-uint8array-message-uint8array-publickey-uint8array-boolean)
   * @returns 'true' if the message if valid, `false` otherwise
   * @privateRemarks Need to document return and return type
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return this.publicKey.pk.verifySignature(msg, signature);
  }

  /**
   * @deprecated
   * Derive a public key from private key
   * @param {Uint8Array} privateKey The private key from which to derive the public key
   * @returns A `Uint8Array` public key generated deterministically from the provided private key
   * @see [secp256k1.publicKeyCreate](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#publickeycreateprivatekey-uint8array-compressed-boolean--true-output-uint8array--len-number--uint8array--len--new-uint8arraylen-uint8array)
   */
  public static privateToPublicKey(privateKey: Uint8Array): Uint8Array {
    return PrivateKey.fromHex(
      Conversions.encodeBase16(privateKey),
      KeyAlgorithm.SECP256K1
    ).publicKey.bytes();
  }

  /**
   * @deprecated
   * Restore secp256k1 keyPair from private key file
   * @param {string} privateKeyPath The path to the private key file
   * @returns A secp256k1 `AsymmetricKey`
   * @see {@link Secp256K1.parsePrivateKeyFile}
   * @see {@link Secp256K1.privateToPublicKey}
   * @see {@link Secp256K1.parseKeyPair}
   */
  public static loadKeyPairFromPrivateFile(privateKeyPath: string) {
    const privateKey = Secp256K1.parsePrivateKeyFile(privateKeyPath);
    const publicKey = Secp256K1.privateToPublicKey(privateKey);
    return Secp256K1.parseKeyPair(publicKey, privateKey, 'raw');
  }
}
