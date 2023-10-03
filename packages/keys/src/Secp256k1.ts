/**
 * Used to represent account keypairs
 * @packageDocumentation
 */

import * as fs from 'node:fs';

import { encodeBase16, SignatureAlgorithm } from '@casper-js-sdk/types';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
import KeyEncoder from 'key-encoder';

import { AsymmetricKey } from './AsymmetricKey';
import { accountHashHelper } from './utils';

secp256k1.utils.hmacSha256Sync = (k, ...m) =>
  hmac(sha256, k, secp256k1.utils.concatBytes(...m));

const keyEncoder = new KeyEncoder('secp256k1');

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
