import { jsonObject } from 'typedjson';
import { IResultWithBytes } from '../clvalue';

/**
 * Represents a cryptographic hash.
 * This class provides methods for creating, manipulating, and comparing hash values.
 */
@jsonObject
export class Hash {
  private hashBytes: Uint8Array;

  /** The fixed length of the hash in bytes. */
  static ByteHashLen = 32;

  /** The fixed length of the hash string representation in hexadecimal characters. */
  static StringHashLen = 64;

  /**
   * Creates a new Hash instance.
   * @param hashBytes - The byte array representing the hash.
   * @throws Error if the byte array length does not match the expected hash length.
   */
  constructor(hashBytes: Uint8Array) {
    if (hashBytes.length !== Hash.ByteHashLen) {
      throw new Error(
        `Invalid hash length, expected ${Hash.ByteHashLen} bytes.`
      );
    }
    this.hashBytes = hashBytes;
  }

  /**
   * Creates a Hash instance from a hexadecimal string.
   * @param source - The hexadecimal string representation of the hash.
   * @returns A new Hash instance.
   * @throws Error if the string length does not match the expected hash length.
   */
  static fromHex(source: string): Hash {
    if (source.length !== Hash.StringHashLen) {
      throw new Error(
        `Invalid string length, expected ${Hash.StringHashLen} characters.`
      );
    }
    const bytes = Uint8Array.from(Buffer.from(source, 'hex'));
    return new Hash(bytes);
  }

  /**
   * Converts the Hash instance to a hexadecimal string.
   * @returns The hexadecimal string representation of the hash.
   */
  toHex(): string {
    return Buffer.from(this.hashBytes).toString('hex');
  }

  /**
   * Converts the Hash instance to a byte array.
   * @returns The byte array representation of the hash.
   */
  toBytes(): Uint8Array {
    return this.hashBytes;
  }

  /**
   * Converts the Hash instance to its JSON representation.
   * @returns The JSON string representation of the hash.
   */
  toJSON(): string {
    return this.toHex();
  }

  /**
   * Creates a Hash instance from its JSON representation.
   * @param json - The JSON string representation of the hash.
   * @returns A new Hash instance.
   */
  static fromJSON(json: string): Hash {
    return Hash.fromHex(json);
  }

  /**
   * Creates a Hash instance from a byte array.
   * @param source - The byte array representing the hash.
   * @returns A result object containing the new Hash instance and the remaining bytes.
   * @throws Error if the byte array length does not match the expected hash length.
   */
  static fromBytes(source: Uint8Array): IResultWithBytes<Hash> {
    if (source.length < Hash.ByteHashLen) {
      throw new Error('Key length is less than 32 bytes.');
    }

    const hashBytes = source.subarray(0, Hash.ByteHashLen);
    return {
      result: new Hash(hashBytes),
      bytes: source.subarray(Hash.ByteHashLen)
    };
  }

  /**
   * Creates a Hash instance from a Buffer.
   * @param buffer - The Buffer containing the hash bytes.
   * @returns A new Hash instance.
   * @throws Error if the buffer length is less than the required hash length.
   */
  static fromBuffer(buffer: Buffer): Hash {
    if (buffer.length < Hash.ByteHashLen) {
      throw new Error('Key length is not equal to 32 bytes.');
    }
    return new Hash(new Uint8Array(buffer.slice(0, Hash.ByteHashLen)));
  }

  /**
   * Creates an array of Hash instances from a byte array.
   * @param byteArray - The byte array containing multiple hash values.
   * @returns An array of Hash instances created from the byte array.
   * @throws Error if the byte array length is not a multiple of the hash length.
   */
  public static createHashArray(byteArray: Uint8Array): Hash[] {
    if (byteArray.length % Hash.ByteHashLen !== 0) {
      throw new Error(
        `Byte array length must be a multiple of ${Hash.ByteHashLen}.`
      );
    }

    const hashes: Hash[] = [];
    for (let i = 0; i < byteArray.length; i += Hash.ByteHashLen) {
      const chunk = byteArray.subarray(i, i + Hash.ByteHashLen);
      hashes.push(new Hash(chunk));
    }

    return hashes;
  }

  /**
   * Compares this Hash instance with another Hash instance for equality.
   * @param other - The other Hash to compare with.
   * @returns True if the hashes are equal, false otherwise.
   */
  equals(other: Hash): boolean {
    if (this.hashBytes.length !== other.hashBytes.length) return false;
    return this.hashBytes.every(
      (byte, index) => byte === other.hashBytes[index]
    );
  }
}
