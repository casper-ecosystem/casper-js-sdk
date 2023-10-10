/**
 * Used to represent account keypairs
 * @packageDocumentation
 */

import * as fs from 'node:fs';

import {
  encodeBase16,
  encodeBase64,
  SignatureAlgorithm
} from '@casper-js-sdk/types';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

import { AsymmetricKey } from './AsymmetricKey';
import { accountHashHelper } from './utils';

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

const ED25519_PEM_SECRET_KEY_TAG = 'PRIVATE KEY';
const ED25519_PEM_PUBLIC_KEY_TAG = 'PUBLIC KEY';

/**
 * Ed25519 key pair
 * @deprecated use public and private key instead
 */
export interface SignKeyPair {
  publicKey: Uint8Array; // Array with 32-byte public key
  secretKey: Uint8Array; // Array with 32-byte secret key
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
   * @param {Uint8Array | SignKeyPair} _publicKeyOrKeyPair A Ed25519 public key or old key pair
   * @param {Uint8Array} _privateKey A Ed25519 private key, can be omitted if `_publicKeyOrKeyPair` is a `SignKeyPair`
   */
  constructor(
    _publicKeyOrKeyPair: Uint8Array | SignKeyPair,
    _privateKey?: Uint8Array
  ) {
    const publicKey =
      _publicKeyOrKeyPair instanceof Uint8Array
        ? _publicKeyOrKeyPair
        : _publicKeyOrKeyPair.publicKey;
    const privateKey =
      _publicKeyOrKeyPair instanceof Uint8Array
        ? _privateKey
        : _publicKeyOrKeyPair.secretKey;

    if (!privateKey) {
      throw new Error('private key is required');
    }
    if (privateKey.length != 32) {
      console.warn(
        `You're using private key from old version, please use newly formatted key with 32 bytes length.`
      );
    }
    super(
      publicKey,
      Ed25519.parsePrivateKey(privateKey),
      SignatureAlgorithm.Ed25519
    );
  }

  /**
   * Generates a new Ed25519 key pair
   * @returns A new `Ed25519` object
   */
  public static new(): Ed25519 {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = Ed25519.privateToPublicKey(privateKey);
    return new Ed25519(publicKey, privateKey);
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
  ): Ed25519 {
    const publicKey = Ed25519.parsePublicKeyFile(publicKeyPath);
    const privateKey = Ed25519.parsePrivateKeyFile(privateKeyPath);
    return new Ed25519(publicKey, privateKey);
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
    const keyPair = new Ed25519(
      Ed25519.parsePublicKey(publicKey),
      Ed25519.parsePrivateKey(privateKey)
    );

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
   * Read the Base64 content of a file, ignoring PEM frames
   * @param {string} path The path to the PEM file
   * @returns The result of {@link Ed25519.readBase64WithPEM} after reading in the content as a `string` with `fs`
   */
  private static readBase64File(path: string): Uint8Array {
    const content = fs.readFileSync(path).toString();
    return this.readBase64WithPEM(content);
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
