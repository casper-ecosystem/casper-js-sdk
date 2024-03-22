/**
 * Used to represent account keypairs
 * @packageDocumentation
 */

import * as fs from 'fs';

import * as ed25519 from '@noble/ed25519';
import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { hmac } from '@noble/hashes/hmac';
import KeyEncoder from 'key-encoder';

import { decodeBase64, encodeBase16, encodeBase64 } from '../index';
import { CLPublicKey } from './CLValue';
import { byteHash } from './ByteConverters';
import { SignatureAlgorithm } from './types';

export { SignatureAlgorithm } from './types';

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));
secp256k1.utils.hmacSha256Sync = (k, ...m) =>
  hmac(sha256, k, secp256k1.utils.concatBytes(...m));

const keyEncoder = new KeyEncoder('secp256k1');

const ED25519_PEM_SECRET_KEY_TAG = 'PRIVATE KEY';
const ED25519_PEM_PUBLIC_KEY_TAG = 'PUBLIC KEY';

export interface SignKeyPair {
  publicKey: Uint8Array; // Array with 32-byte public key
  secretKey: Uint8Array; // Array with 32-byte secret key
}

export const getKeysFromHexPrivKey = (
  key: string,
  variant: SignatureAlgorithm
): AsymmetricKey => {
  const rawPrivKeyBytes = decodeBase64(key);
  let keyPair: AsymmetricKey;

  if (variant === SignatureAlgorithm.Secp256K1) {
    const privKey = Secp256K1.parsePrivateKey(rawPrivKeyBytes);
    const pubKey = Secp256K1.privateToPublicKey(privKey);
    keyPair = new Secp256K1(pubKey, privKey);
    return keyPair;
  }

  if (variant === SignatureAlgorithm.Ed25519) {
    const privKey = Ed25519.parsePrivateKey(rawPrivKeyBytes);
    const pubKey = Ed25519.privateToPublicKey(privKey);
    keyPair = Ed25519.parseKeyPair(pubKey, privKey);
    return keyPair;
  }

  throw Error('Unsupported key type');
};

/**
 * Gets the blake2b hash of the provided public key
 * @param signatureAlgorithm The signature algorithm of the key. Currently supported are Ed25519 and Secp256k1
 * @param publicKey The public key as a byte array
 * @returns A blake2b hash of the public key
 */
function accountHashHelper(
  signatureAlgorithm: SignatureAlgorithm,
  publicKey: Uint8Array
) {
  const separator = Buffer.from([0]);
  const prefix = Buffer.concat([Buffer.from(signatureAlgorithm), separator]);

  if (publicKey.length === 0) {
    return Buffer.from([]);
  } else {
    return byteHash(Buffer.concat([prefix, Buffer.from(publicKey)]));
  }
}

/**
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
  return decodeBase64(base64);
}

export const validateSignature = (
  msg: Uint8Array,
  signature: Uint8Array,
  pk: CLPublicKey
): boolean => {
  if (pk.isEd25519()) {
    return ed25519.sync.verify(signature, msg, pk.value());
  }
  if (pk.isSecp256K1()) {
    return secp256k1.verify(signature, sha256(Buffer.from(msg)), pk.value());
  }
  throw Error('Unsupported PublicKey type');
};

/** Public/private keypair object for representing an account */
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
   * Computes the blake2b account hash of the public key
   * @returns The account hash as a byte array
   */
  public accountHash(): Uint8Array {
    return this.publicKey.toAccountHash();
  }

  /**
   * Gets the hexadecimal public key of the account
   * @param {boolean} checksummed Indicates whether the public key should be checksummed, default: `true`
   * @returns The public key of the `AsymmetricKey` as a hexadecimal string
   */
  public accountHex(checksummed = true): string {
    return this.publicKey.toHex(checksummed);
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

/**
 * Ed25519 variant of `AsymmetricKey`
 * @remarks
 * Based on SignatureAlgorithm.scala
 * @see [Documentation](https://docs.casper.network/concepts/accounts-and-keys/#eddsa-keys)
 */
export class Ed25519 extends AsymmetricKey {
  /**
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
   * Generates a new Ed25519 key pair
   * @returns A new `Ed25519` object
   */
  public static new() {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.sync.getPublicKey(privateKey);
    return new Ed25519({
      secretKey: privateKey,
      publicKey
    });
  }

  /**
   * Generate the accountHex for the Ed25519 public key
   * @param publicKey
   */
  public static accountHex(publicKey: Uint8Array): string {
    return '01' + encodeBase16(publicKey);
  }

  /**
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
   * Generates the account hash of a Ed25519 public key
   * @param {Uint8Array} publicKey An Ed25519 public key
   * @returns The blake2b account hash of the public key
   */
  public static accountHash(publicKey: Uint8Array): Uint8Array {
    return accountHashHelper(SignatureAlgorithm.Ed25519, publicKey);
  }

  /**
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
      publicKey: Ed25519.parsePublicKey(publicKey),
      secretKey: Ed25519.parsePrivateKey(privateKey)
    });

    if (
      encodeBase64(Ed25519.privateToPublicKey(keyPair.privateKey)) !==
      encodeBase64(keyPair.publicKey.value())
    ) {
      throw Error('Invalid key pairs');
    }

    return keyPair;
  }

  public static parsePrivateKeyFile(path: string): Uint8Array {
    return Ed25519.parsePrivateKey(Ed25519.readBase64File(path));
  }

  /**
   * Parses a file containing an Ed25519 public key
   * @param {string} path The path to the public key file
   * @returns A `Uint8Array` typed representation of the public key
   * @see {@link Ed25519.parsePublicKey}
   */
  public static parsePublicKeyFile(path: string): Uint8Array {
    return Ed25519.parsePublicKey(Ed25519.readBase64File(path));
  }

  /**
   * Parses a byte array containing an Ed25519 private key
   * @param {Uint8Array} bytes A private key as a byte array
   * @returns A validated byte array containing the provided Ed25519 private key
   * @see {@link Ed25519.parseKey}
   */
  public static parsePrivateKey(bytes: Uint8Array) {
    return Ed25519.parseKey(bytes, 0, 32);
  }

  /**
   * Parses a byte array containing an Ed25519 public key
   * @param {Uint8Array} bytes A public key in bytes
   * @returns A validated byte array containing the provided Ed25519 public key
   * @see {@link Ed25519.parseKey}
   */
  public static parsePublicKey(bytes: Uint8Array) {
    return Ed25519.parseKey(bytes, 32, 64);
  }

  /**
   * Calls global {@link readBase64WithPEM} and returns the result
   * @param {string} content A .pem private key string with a header and footer
   * @returns The result of global `readBase64WithPEM`
   * @see {@link readBase64WithPEM}
   */
  public static readBase64WithPEM(content: string) {
    return readBase64WithPEM(content);
  }

  /**
   * Read the Base64 content of a file, ignoring PEM frames
   * @param {string} path The path to the PEM file
   * @returns The result of {@link Ed25519.readBase64WithPEM} after reading in the content as a `string` with `fs`
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return Ed25519.readBase64WithPEM(content);
  }

  /**
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
   * Convert this instance's private key to PEM format
   * @returns A PEM compliant string containing this instance's private key
   * @see {@link AsymmetricKey.toPem}
   */
  public exportPrivateKeyInPem() {
    // prettier-ignore
    const derPrefix = Buffer.from([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
    const encoded = encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.privateKey)])
    );

    return this.toPem(ED25519_PEM_SECRET_KEY_TAG, encoded);
  }

  /**
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   * @see {@link AsymmetricKey.toPem}
   */
  public exportPublicKeyInPem() {
    // prettier-ignore
    const derPrefix = Buffer.from([48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0]);
    const encoded = encodeBase64(
      Buffer.concat([derPrefix, Buffer.from(this.publicKey.value())])
    );
    return this.toPem(ED25519_PEM_PUBLIC_KEY_TAG, encoded);
  }

  /**
   * Sign a message by using this instance's keypair
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns `Uint8Array` typed signature of the provided `msg`
   */
  public sign(msg: Uint8Array): Uint8Array {
    return ed25519.sync.sign(msg, this.privateKey);
  }

  /**
   * Verifies a signature given the signature and the original message
   * @param {Uint8Array} signature The signed message as a byte array
   * @param {Uint8Array} msg The original message as a byte array
   * @returns 'true' if the message if valid, `false` otherwise
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return ed25519.sync.verify(signature, msg, this.publicKey.value());
  }

  /**
   * Derive a public key from private key or seed phrase
   * @param {Uint8Array} privateKey The private key or seed phrase from which to derive the public key
   * @returns A `Uint8Array` public key generated deterministically from the provided private key or seed phrase
   * @remarks Both secret keys and seed phrases may be used to derive the public key
   */
  public static privateToPublicKey(privateKey: Uint8Array): Uint8Array {
    return ed25519.sync.getPublicKey(privateKey);
  }

  /**
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
 * Secp256k1 variant of `AsymmetricKey`
 * @privateRemarks
 * Orignated from [Secp256k1](https://en.bitcoin.it/wiki/Secp256k1) to support Ethereum keys on the Casper.
 * @see [Documentation](https://docs.casper.network/concepts/accounts-and-keys/#ethereum-keys)
 */
export class Secp256K1 extends AsymmetricKey {
  /**
   * Constructs a new Secp256K1 object from a public key and a private key
   * @param {Uint8Array} publicKey A secp256k1 public key
   * @param {Uint8Array} privateKey A secp256k1 private key
   */
  constructor(publicKey: Uint8Array, privateKey: Uint8Array) {
    super(publicKey, privateKey, SignatureAlgorithm.Secp256K1);
  }

  /**
   * Generate a new pseudorandom Secp256k1 key pair
   * @returns A new `Secp256K1` object
   */
  public static new() {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey, true);
    return new Secp256K1(publicKey, privateKey);
  }

  /**
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
   * Generates the account hash of a secp256k1 public key
   * @param {Uint8Array} publicKey A secp256k1 public key
   * @returns The blake2b account hash of the public key
   */
  public static accountHash(publicKey: Uint8Array): Uint8Array {
    return accountHashHelper(SignatureAlgorithm.Secp256K1, publicKey);
  }

  /**
   * Converts a `Uint8Array` public key to hexadecimal format
   * @param publicKey
   * @remarks
   * The returned public key hex will be prefixed with a "02" to indicate that it is of the secp256k1 variety
   */
  public static accountHex(publicKey: Uint8Array): string {
    return '02' + encodeBase16(publicKey);
  }

  /**
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
   * Parses a file containing a secp256k1 private key
   * @param {string} path The path to the private key file
   * @returns A `Uint8Array` typed representation of the private key
   * @see {@link Secp256K1.parsePrivateKey}
   */
  public static parsePrivateKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePrivateKey(Secp256K1.readBase64File(path));
  }

  /**
   * Parses a file containing a secp256k1 public key
   * @param {string} path The path to the public key file
   * @returns A `Uint8Array` typed representation of the private key
   * @see {@link Secp256K1.parsePublicKey}
   */
  public static parsePublicKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePublicKey(Secp256K1.readBase64File(path));
  }

  /**
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
      rawKeyHex = encodeBase16(bytes);
    }

    const privateKey = Buffer.from(rawKeyHex, 'hex');
    return privateKey;
  }

  /**
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
      rawKeyHex = encodeBase16(bytes);
    }

    const publicKey = Uint8Array.from(Buffer.from(rawKeyHex, 'hex'));
    return publicKey;
  }

  /**
   * Calls global {@link readBase64WithPEM} and returns the result
   * @param {string} content A .pem private key string with a header and footer
   * @returns The result of global `readBase64WithPEM`
   * @see {@link readBase64WithPEM}
   */
  public static readBase64WithPEM(content: string) {
    return readBase64WithPEM(content);
  }

  /**
   * Read the Base64 content of a file, ignoring PEM frames
   * @param {string} path The path to the PEM file
   * @returns The result of {@link Secp256K1.readBase64WithPEM} after reading in the content as a `string` with `fs`
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return Secp256K1.readBase64WithPEM(content);
  }

  /**
   * Convert this instance's private key to PEM format
   * @returns A PEM compliant string containing this instance's private key
   */
  public exportPrivateKeyInPem(): string {
    return keyEncoder.encodePrivate(
      encodeBase16(this.privateKey),
      'raw',
      'pem'
    );
  }

  /**
   * Convert this instance's public key to PEM format
   * @returns A PEM compliant string containing this instance's public key
   */
  public exportPublicKeyInPem(): string {
    return keyEncoder.encodePublic(
      encodeBase16(this.publicKey.value()),
      'raw',
      'pem'
    );
  }

  /**
   * Sign a message by using this instance's keypair
   * @param {Uint8Array} msg The message to be signed, as a byte array
   * @returns `Uint8Array` typed signature of the provided `msg`
   * @see [secp256k1.ecdsaSign](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#ecdsasignmessage-uint8array-privatekey-uint8array--data-noncefn---data-uint8array-noncefn-message-uint8array-privatekey-uint8array-algo-null-data-uint8array-counter-number--uint8array----output-uint8array--len-number--uint8array--signature-uint8array-recid-number-)
   */
  public sign(msg: Uint8Array): Uint8Array {
    const signature = secp256k1.signSync(
      sha256(Buffer.from(msg)),
      this.privateKey,
      {
        der: false
      }
    );
    return signature;
  }

  /**
   * Verifies a signature given the signature and the original message
   * @param {Uint8Array} signature The signed message as a byte array
   * @param {Uint8Array} msg The original message as a byte array
   * @see [secp256k1.ecdsaVerify](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#ecdsaverifysignature-uint8array-message-uint8array-publickey-uint8array-boolean)
   * @returns 'true' if the message if valid, `false` otherwise
   * @privateRemarks Need to document return and return type
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return secp256k1.verify(
      signature,
      sha256(Buffer.from(msg)),
      this.publicKey.value()
    );
  }

  /**
   * Derive a public key from private key
   * @param {Uint8Array} privateKey The private key from which to derive the public key
   * @returns A `Uint8Array` public key generated deterministically from the provided private key
   * @see [secp256k1.publicKeyCreate](https://github.com/cryptocoinjs/secp256k1-node/blob/HEAD/API.md#publickeycreateprivatekey-uint8array-compressed-boolean--true-output-uint8array--len-number--uint8array--len--new-uint8arraylen-uint8array)
   */
  public static privateToPublicKey(privateKey: Uint8Array): Uint8Array {
    return secp256k1.getPublicKey(privateKey, true);
  }

  /**
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
