import { jsonMember, jsonObject } from 'typedjson';
import { EntityAddr } from './EntityAddr';
import { PrefixName } from './PrefixName';
import { IResultWithBytes } from '../clvalue';

/**
 * Represents a named key address, which is identified by a base entity address and a unique name.
 * The name is represented in bytes to allow for efficient encoding and decoding.
 */
@jsonObject
export class NamedKeyAddr {
  /**
   * The base address of the entity to which this key belongs.
   */
  @jsonMember({ name: 'BaseAddr', constructor: EntityAddr })
  baseAddr: EntityAddr;

  /**
   * The bytes representing the name associated with the address.
   * Expected to be a 32-byte array for validity.
   */
  @jsonMember({ name: 'NameBytes', constructor: Uint8Array })
  nameBytes: Uint8Array;

  /**
   * Creates an instance of NamedKeyAddr.
   * @param baseAddr - The base address of the entity.
   * @param nameBytes - The 32-byte array representing the name associated with the address.
   */
  constructor(baseAddr: EntityAddr, nameBytes: Uint8Array) {
    this.baseAddr = baseAddr;
    this.nameBytes = nameBytes;
  }

  /**
   * Creates a NamedKeyAddr instance from a string representation, parsing the base address and name bytes.
   * The string should follow the expected prefixed format used by the system.
   * @param source - The string representation of the NamedKeyAddr.
   * @returns A new NamedKeyAddr instance.
   * @throws Error if the nameBytes length is not exactly 32 bytes.
   */
  static fromString(source: string): NamedKeyAddr {
    const nameBytesData = source.substring(source.lastIndexOf('-') + 1);
    const baseAddrSource = source
      .substring(0, source.lastIndexOf('-'))
      .replace(PrefixName.AddressableEntity, '');

    const nameBytes = Buffer.from(nameBytesData, 'hex');
    if (nameBytes.length !== 32) {
      throw new Error('Invalid NameBytes length, expected 32 bytes.');
    }

    const baseAddr = EntityAddr.fromPrefixedString(baseAddrSource);
    return new NamedKeyAddr(baseAddr, nameBytes);
  }

  /**
   * Converts the NamedKeyAddr instance to a standardized prefixed string format.
   * This format includes the base address and the name bytes, represented in hexadecimal.
   * @returns A prefixed string representation of the NamedKeyAddr.
   */
  toPrefixedString(): string {
    return `${
      PrefixName.NamedKey
    }${this.baseAddr.toPrefixedString()}-${Buffer.from(this.nameBytes).toString(
      'hex'
    )}`;
  }

  /**
   * Serializes the NamedKeyAddr to a JSON-compatible string.
   * Primarily used for exchanging data in JSON format.
   * @returns A JSON-compatible string representation of the NamedKeyAddr.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Constructs a NamedKeyAddr instance from a byte array representation.
   * The byte array should contain the base address followed by the name bytes.
   * @param bytes - The byte array representing the NamedKeyAddr.
   * @returns An `IResultWithBytes` object containing the NamedKeyAddr instance and any remaining bytes.
   * @throws Error if the byte array does not contain at least 32 bytes for the name.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<NamedKeyAddr> {
    const baseAddr = EntityAddr.fromBytes(bytes);

    if (bytes.length < 32) {
      throw new Error('Insufficient bytes for NameBytes; expected 32 bytes.');
    }
    const nameBytes = bytes.slice(0, 32);
    return {
      result: new NamedKeyAddr(baseAddr?.result, nameBytes),
      bytes: baseAddr?.bytes
    };
  }

  /**
   * Converts the NamedKeyAddr to a byte array for efficient storage or transmission.
   * The byte array includes the base address followed by the 32-byte name.
   * @returns A Uint8Array representing the NamedKeyAddr.
   */
  toBytes(): Uint8Array {
    return Buffer.concat([this.baseAddr.toBytes(), this.nameBytes]);
  }
}
