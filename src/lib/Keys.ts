/**
 * Used to represent account keypairs
 * @packageDocumentation
 */

import * as fs from 'fs';
import * as nacl from 'tweetnacl-ts';
import { SignKeyPair, SignLength } from 'tweetnacl-ts';
import { decodeBase64 } from 'tweetnacl-util';
import { encodeBase16, encodeBase64 } from '../index';
import { CLPublicKey } from './CLValue';
import { byteHash } from './Contracts';
import eccrypto from 'eccrypto';
import * as secp256k1 from 'ethereum-cryptography/secp256k1';
import KeyEncoder from 'key-encoder';
import { sha256 } from 'ethereum-cryptography/sha256';
import { CasperHDKey } from './CasperHDKey';

const keyEncoder = new KeyEncoder('secp256k1');

const ED25519_PEM_SECRET_KEY_TAG = 'PRIVATE KEY';
const ED25519_PEM_PUBLIC_KEY_TAG = 'PUBLIC KEY';

/**
 * Supported Asymmetric Key algorithms
 * @enum
 */
export enum SignatureAlgorithm {
  Ed25519 = 'ed25519',
  Secp256K1 = 'secp256k1'
}

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
   * @returns The public key of the `AsymmetricKey` as a hexadecimal string
   */
  public accountHex(): string {
    return this.publicKey.toHex();
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
 */
export class Ed25519 extends AsymmetricKey {
  /**
   * Constructs a new Ed25519 object from a `SignKeyPair`
   * @param {SignKeyPair} keyPair An object containing the keys "publicKey" and "secretKey" with corresponding `ByteArray` values
   * @see [SignKeyPair](https://www.npmjs.com/package/tweetnacl-ts#sign_keypair)
   */
  constructor(keyPair: SignKeyPair) {
    super(keyPair.publicKey, keyPair.secretKey, SignatureAlgorithm.Ed25519);
  }

  /**
   * Generates a new Ed25519 key pair
   */
  public static new() {
    return new Ed25519(nacl.sign_keyPair());
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
    // nacl expects that the private key will contain both.
    return new Ed25519({
      publicKey,
      secretKey: Buffer.concat([privateKey, publicKey])
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
   * @returns A new `AsymmetricKey` keypair
   */
  public static parseKeyPair(
    publicKey: Uint8Array,
    privateKey: Uint8Array
  ): AsymmetricKey {
    const publ = Ed25519.parsePublicKey(publicKey);
    const priv = Ed25519.parsePrivateKey(privateKey);
    // nacl expects that the private key will contain both.
    const secr = new Uint8Array(publ.length + priv.length);
    secr.set(priv);
    secr.set(publ, priv.length);
    return new Ed25519({
      publicKey: publ,
      secretKey: secr
    });
  }

  /**
   * Parses a file containing an Ed25519 private key
   * @param {string} path The path to the private key file
   * @returns A `Uint8Array` typed representation of the private key
   * @see {@link Ed25519.parsePrivateKey}
   */
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
   * @param {Uint8Array} bytes A private key in bytes
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
      Buffer.concat([
        derPrefix,
        Buffer.from(Ed25519.parsePrivateKey(this.privateKey))
      ])
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
   * @see [sign_detached](https://www.npmjs.com/package/tweetnacl-ts#sign_detachedmessage-secretkey)
   */
  public sign(msg: Uint8Array): Uint8Array {
    return nacl.sign_detached(msg, this.privateKey);
  }

  /**
   * Verify the signature along with the raw message
   * @param signature
   * @param msg
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return nacl.sign_detached_verify(msg, signature, this.publicKey.value());
  }

  /**
   * Derive public key from private key
   * @param privateKey
   */
  public static privateToPublicKey(privateKey: Uint8Array) {
    if (privateKey.length === SignLength.SecretKey) {
      return nacl.sign_keyPair_fromSecretKey(privateKey).publicKey;
    } else {
      return nacl.sign_keyPair_fromSeed(privateKey).publicKey;
    }
  }

  /**
   * Restore Ed25519 keyPair from private key file
   * @param privateKeyPath
   */
  public static loadKeyPairFromPrivateFile(privateKeyPath: string) {
    const privateKey = Ed25519.parsePrivateKeyFile(privateKeyPath);
    const publicKey = Ed25519.privateToPublicKey(privateKey);
    return Ed25519.parseKeyPair(publicKey, privateKey);
  }
}

export class Secp256K1 extends AsymmetricKey {
  constructor(publicKey: Uint8Array, privateKey: Uint8Array) {
    super(publicKey, privateKey, SignatureAlgorithm.Secp256K1);
  }

  /**
   * Generating a new Secp256K1 key pair
   */
  public static new() {
    const privateKey = eccrypto.generatePrivate();
    const publicKey = Uint8Array.from(eccrypto.getPublicCompressed(privateKey));
    return new Secp256K1(publicKey, privateKey);
  }

  /**
   * Parse the key pair from publicKey file and privateKey file
   * @param publicKeyPath path of public key file
   * @param privateKeyPath path of private key file
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
   * Generate the accountHash for the Secp256K1 public key
   * @param publicKey
   */
  public static accountHash(publicKey: Uint8Array): Uint8Array {
    return accountHashHelper(SignatureAlgorithm.Secp256K1, publicKey);
  }

  /**
   * Generate the accountHex for the Secp256K1 public key
   * @param publicKey
   */
  public static accountHex(publicKey: Uint8Array): string {
    return '02' + encodeBase16(publicKey);
  }

  /**
   * Construct keyPair from public key and private key
   * @param publicKey
   * @param privateKey
   * @param originalFormat the format of the public/private key
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

  public static parsePrivateKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePrivateKey(Secp256K1.readBase64File(path));
  }

  public static parsePublicKeyFile(path: string): Uint8Array {
    return Secp256K1.parsePublicKey(Secp256K1.readBase64File(path));
  }

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

  public static readBase64WithPEM(content: string) {
    return readBase64WithPEM(content);
  }

  /**
   * Read the Base64 content of a file, get rid of PEM frames.
   *
   * @param path the path of file to read from
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return Secp256K1.readBase64WithPEM(content);
  }

  /**
   * Export the private key encoded in pem
   */
  public exportPrivateKeyInPem(): string {
    return keyEncoder.encodePrivate(
      encodeBase16(this.privateKey),
      'raw',
      'pem'
    );
  }

  /**
   * Expect the public key encoded in pem
   */
  public exportPublicKeyInPem(): string {
    return keyEncoder.encodePublic(
      encodeBase16(this.publicKey.value()),
      'raw',
      'pem'
    );
  }

  /**
   * Sign the message by using the keyPair
   * @param msg
   */
  public sign(msg: Uint8Array): Uint8Array {
    const res = secp256k1.ecdsaSign(sha256(Buffer.from(msg)), this.privateKey);
    return res.signature;
  }

  /**
   * Verify the signature along with the raw message
   * @param signature
   * @param msg
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return secp256k1.ecdsaVerify(
      signature,
      sha256(Buffer.from(msg)),
      this.publicKey.value()
    );
  }

  /**
   * Derive public key from private key
   * @param privateKey
   */
  public static privateToPublicKey(privateKey: Uint8Array): Uint8Array {
    return secp256k1.publicKeyCreate(privateKey, true);
  }

  /**
   * Restore Secp256K1 keyPair from private key file
   * @param privateKeyPath a path to file of the private key
   */
  public static loadKeyPairFromPrivateFile(privateKeyPath: string) {
    const privateKey = Secp256K1.parsePrivateKeyFile(privateKeyPath);
    const publicKey = Secp256K1.privateToPublicKey(privateKey);
    return Secp256K1.parseKeyPair(publicKey, privateKey, 'raw');
  }

  /**
   * From hdKey derive a child Secp256K1 key
   * @param hdKey
   * @param index
   */
  public static deriveIndex(hdKey: CasperHDKey, index: number) {
    return hdKey.deriveIndex(index);
  }
}
