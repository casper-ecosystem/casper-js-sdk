import { concat } from '@ethersproject/bytes';

import { PublicKey } from './PublicKey';
import { PrivateKey as Ed25519PrivateKey } from './ed25519/PrivateKey';
import { PrivateKey as Secp256k1PrivateKey } from './secp256k1/PrivateKey';
import { KeyAlgorithm } from './Algorithm';

/**
 * Interface representing the structure and methods of a private key, including
 * functions to retrieve public key bytes, sign messages, and export to PEM format.
 */
export interface PrivateKeyInternal {
  /** Retrieves the public key bytes. */
  publicKeyBytes(): Uint8Array;
  toBytes(): Uint8Array;

  /**
   * Signs a message using the private key.
   * @param message - The message to sign.
   * @returns The signature bytes.
   */
  sign(message: Uint8Array): Uint8Array;

  /** Converts the private key to PEM format. */
  toPem(): string;
}

/**
 * Represents a private key with associated public key and cryptographic algorithm.
 * Provides methods for signing messages, exporting to PEM, and generating public keys.
 */
export class PrivateKey {
  /** The cryptographic algorithm used for the key. */
  private alg: KeyAlgorithm;

  /** The public key associated with this private key. */
  private pub: PublicKey;

  /** The internal private key implementation. */
  private priv: PrivateKeyInternal;

  /**
   * Creates an instance of PrivateKey.
   * @param alg - The cryptographic algorithm.
   * @param pub - The associated public key.
   * @param priv - The private key implementation.
   */
  constructor(alg: KeyAlgorithm, pub: PublicKey, priv: PrivateKeyInternal) {
    this.alg = alg;
    this.pub = pub;
    this.priv = priv;
  }

  toBytes(): Uint8Array {
    return this.priv.toBytes();
  }

  /**
   * Gets the public key associated with this private key.
   * @returns The associated PublicKey instance.
   */
  public get publicKey(): PublicKey {
    return this.pub;
  }

  /**
   * Exports the private key to PEM format.
   * @returns A PEM-encoded string of the private key.
   */
  public toPem(): string {
    return this.priv.toPem();
  }

  /**
   * Signs a message using the private key.
   * @param msg - The message to sign.
   * @returns The signature bytes.
   */
  public sign(msg: Uint8Array): Uint8Array {
    return this.priv.sign(msg);
  }

  /**
   * Signs a message using the private key and includes the algorithm byte in the signature.
   * @param msg - The message to sign.
   * @returns The signature bytes with the algorithm byte.
   */
  public signAndAddAlgorithmBytes(msg: Uint8Array): Uint8Array {
    const signature = this.priv.sign(msg);
    const algBytes = Uint8Array.of(this.alg);
    return concat([algBytes, signature]);
  }

  /**
   * Signs a message without including the algorithm byte.
   * @param msg - The message to sign.
   * @returns A promise resolving to the raw signature bytes.
   */
  public async rawSign(msg: Uint8Array): Promise<Uint8Array> {
    return this.priv.sign(msg);
  }

  /**
   * Generates a new private key with the specified algorithm.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A new PrivateKey instance.
   */
  public static generate(algorithm: KeyAlgorithm): PrivateKey {
    const priv = PrivateKeyFactory.createPrivateKey(algorithm);
    const pubBytes = priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }

  /**
   * Creates a private key from a PEM-encoded string.
   * @param content - The PEM-encoded string.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A PrivateKey instance.
   */
  public static fromPem(content: string, algorithm: KeyAlgorithm): PrivateKey {
    const priv = PrivateKeyFactory.createPrivateKeyFromPem(content, algorithm);
    const pubBytes = priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }

  /**
   * Creates a private key from a hexadecimal string.
   * @param key - The hexadecimal string of the private key.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A PrivateKey instance.
   */
  public static fromHex(key: string, algorithm: KeyAlgorithm): PrivateKey {
    const priv = PrivateKeyFactory.createPrivateKeyFromHex(key, algorithm);
    const pubBytes = priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }
}

/**
 * Factory class for creating instances of PrivateKeyInternal using different formats and algorithms.
 * This utility class allows generating, importing, and creating private keys with specific cryptographic algorithms.
 */
class PrivateKeyFactory {
  /**
   * Creates a new private key using the specified algorithm.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static createPrivateKey(algorithm: KeyAlgorithm): PrivateKeyInternal {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.generate();
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.generate();
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }

  /**
   * Creates a PrivateKeyInternal instance from a PEM-encoded string.
   * @param content - The PEM-encoded string.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static createPrivateKeyFromPem(
    content: string,
    algorithm: KeyAlgorithm
  ): PrivateKeyInternal {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.fromPem(content);
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.fromPem(content);
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }

  /**
   * Creates a PrivateKeyInternal instance from a hexadecimal string.
   * @param key - The hexadecimal string of the private key.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static createPrivateKeyFromHex(
    key: string,
    algorithm: KeyAlgorithm
  ): PrivateKeyInternal {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.fromHex(key);
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.fromHex(key);
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }
}
