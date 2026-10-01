import { jsonObject, jsonMember } from 'typedjson';
import { IResultWithBytes } from '../clvalue';
import { Conversions } from '../Conversions';
import { concat } from '@ethersproject/bytes';

/**
 * Enum representing the access permissions of a URef.
 * These permissions define the allowed actions on the URef, such as read, write, or add.
 */
export enum UrefAccess {
  None = 0,
  Read,
  Write,
  Add,
  ReadWrite,
  ReadAdd,
  AddWrite,
  ReadAddWrite
}

/** Error thrown when the URef format is incorrect. */
export const ErrIncorrectUrefFormat = new Error('incorrect uref format');

/** Prefix for URef strings. */
export const PrefixNameURef = 'uref-';

/** Length of a URef hash in bytes. */
export const ByteHashLen = 32;

/**
 * Represents an Unforgeable Reference (URef) in the system, identified by a unique hash and associated with specific access permissions.
 * A URef is used to control permissions and securely reference data in smart contracts.
 */
@jsonObject
export class URef {
  /** The unique data (hash) associated with the URef, represented as a 32-byte array. */
  @jsonMember(Uint8Array)
  data: Uint8Array;

  /** The access permissions assigned to this URef, defined by the `UrefAccess` enum. */
  @jsonMember({ constructor: Number })
  access: UrefAccess;

  /**
   * Creates an instance of URef.
   * @param data - The data (hash) of the URef, expected to be exactly 32 bytes.
   * @param access - The access permissions for the URef, specified by the `UrefAccess` enum.
   * @throws Error if the data length is not equal to `ByteHashLen` or if the access rights are unsupported.
   */
  constructor(data: Uint8Array, access: UrefAccess) {
    if (data.length !== ByteHashLen) {
      throw new Error(`Invalid URef data length; expected ${ByteHashLen}`);
    }

    if (!Object.values(UrefAccess).includes(access)) {
      throw new Error('Unsupported AccessRights');
    }

    this.data = data;
    this.access = access;
  }

  /**
   * Converts the URef to a byte array representation.
   * This format is useful for serialization or data transfer.
   * @returns A Uint8Array representing the URef, combining its data and access bytes.
   */
  bytes(): Uint8Array {
    const accessBytes = new Uint8Array([this.access]);
    return concat([this.data, accessBytes]);
  }

  /**
   * Converts the URef to a prefixed string representation, following the standard format for URef strings.
   * @returns A string with the URef prefix, data in hex format, and access permissions in hex format.
   */
  toPrefixedString(): string {
    return [PrefixNameURef.replace('-', ''), this.toString()].join('-');
  }

  /**
   * Converts the URef to a string, displaying its data as a hexadecimal string along with the access permissions.
   * @returns A string representation of the URef.
   */
  toString(): string {
    return [
      Conversions.encodeBase16(this.data),
      // This expression is the constant `'00'`, and that `'00'` is part of the
      // rendered format — not padding that can be dropped.
      new Array(3).join('0').slice(-3) + this.access.toString(8)
    ].join('-');
  }

  /**
   * Sets or updates the access permissions for the URef.
   * @param access - The new access permission to set, defined by the `UrefAccess` enum.
   */
  setAccess(access: UrefAccess) {
    this.access = access;
  }

  /**
   * Serializes the URef to a JSON-compatible string format.
   * @returns A JSON string representation of the URef.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a URef from a JSON-compatible string representation.
   * @param data - The JSON string representing the URef.
   * @returns A new URef instance.
   */
  static fromJSON(data: string): URef {
    return URef.fromString(data);
  }

  /**
   * Parses a URef from a prefixed string format, which includes its data and access permissions.
   * @param source - The string containing the URef data, starting with the URef prefix.
   * @returns A new URef instance.
   * @throws ErrIncorrectUrefFormat if the string format does not match the expected URef format.
   */
  static fromString(source: string): URef {
    if (!source.startsWith(`${PrefixNameURef}`)) {
      throw new Error("Prefix is not 'uref-'");
    }

    const parts = source.substring(`${PrefixNameURef}`.length).split('-', 2);

    if (parts.length !== 2) {
      throw ErrIncorrectUrefFormat;
    }
    const data = Conversions.decodeBase16(parts[0]);
    const access = parseInt(parts[1], 8);
    return new URef(data, access as UrefAccess);
  }

  /**
   * Creates a URef from a byte array representation, expecting the hash data and access byte.
   * @param bytes - The byte array containing the URef data and access byte.
   * @returns A new URef instance wrapped in an `IResultWithBytes` object.
   * @throws Error if the byte array length does not match the expected URef structure.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<URef> {
    if (bytes.length !== ByteHashLen + 1) {
      throw new Error('Invalid URef bytes length');
    }
    const data = bytes.subarray(0, ByteHashLen);
    const access = bytes[ByteHashLen];
    return {
      result: new URef(data, access as UrefAccess),
      bytes: bytes.subarray(ByteHashLen + 1)
    };
  }

  /**
   * Returns the byte array representation of the URef, often used for driving values in other contexts.
   * @returns A Uint8Array representing the URef.
   */
  toDriverValue(): Uint8Array {
    return this.bytes();
  }

  /**
   * Creates a URef instance from an ArrayBuffer, extracting the hash data and access byte.
   * @param arrayBuffer - The ArrayBuffer containing the URef data.
   * @returns A new URef instance.
   * @throws Error if the ArrayBuffer size is smaller than expected.
   */
  public static fromBuffer(arrayBuffer: ArrayBuffer): URef {
    const dataView = new DataView(arrayBuffer);

    if (dataView.byteLength < ByteHashLen + 1) {
      throw new Error('ArrayBuffer size is too small');
    }

    const data = new Uint8Array(arrayBuffer.slice(0, ByteHashLen));
    const access = dataView.getUint8(ByteHashLen);

    return new URef(data, access);
  }
}
