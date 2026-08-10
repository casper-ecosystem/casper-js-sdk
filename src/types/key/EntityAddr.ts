import { jsonObject, jsonMember } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';
import { PrefixName } from './PrefixName';

/**
 * Enum representing the types of entities within the system.
 */
export enum EntityKindType {
  SystemKind = 0,
  AccountKind = 1,
  SmartContractKind = 2
}

/** Error thrown when the EntityAddr format is invalid. */
export const ErrInvalidEntityAddrFormat = new Error(
  'invalid EntityAddr format'
);

/** Error thrown when the EntityKind is invalid. */
export const ErrInvalidEntityKind = new Error('invalid EntityKind');

/**
 * Represents an entity address in the system. This class supports addresses for three types of entities:
 * system, account, and smart contract. The address type is indicated by either the system, account, or smartContract property being set.
 */
@jsonObject
export class EntityAddr {
  /** The system hash, if this is a system entity. */
  @jsonMember({ constructor: Hash, name: 'System' })
  system?: Hash;

  /** The account hash, if this is an account entity. */
  @jsonMember({ constructor: Hash, name: 'Account' })
  account?: Hash;

  /** The smart contract hash, if this is a smart contract entity. */
  @jsonMember({ constructor: Hash, name: 'SmartContract' })
  smartContract?: Hash;

  /**
   * Creates a new EntityAddr instance.
   * @param system - The hash representing a system entity.
   * @param account - The hash representing an account entity.
   * @param smartContract - The hash representing a smart contract entity.
   */
  constructor(system?: Hash, account?: Hash, smartContract?: Hash) {
    this.system = system;
    this.account = account;
    this.smartContract = smartContract;
  }

  /**
   * Returns a prefixed string representation of the EntityAddr, with different prefixes for each entity type.
   * @returns The prefixed string representation, with "entity-system-", "entity-account-", or "entity-contract-" based on entity type.
   */
  toPrefixedString(): string {
    if (this.system) {
      return `${PrefixName.Entity}system-${this.system.toHex()}`;
    } else if (this.account) {
      return `${PrefixName.Entity}account-${this.account.toHex()}`;
    } else if (this.smartContract) {
      return `${PrefixName.Entity}contract-${this.smartContract.toHex()}`;
    }
    return '';
  }

  /**
   * Creates an EntityAddr from a prefixed string representation.
   * @param source - The prefixed string representation of the EntityAddr.
   * @returns A new EntityAddr instance.
   * @throws {ErrInvalidEntityAddrFormat} If the format is invalid.
   */
  static fromPrefixedString(source: string): EntityAddr {
    source = source.replace(PrefixName.Entity, '');

    if (source.startsWith('system-')) {
      const hash = Hash.fromHex(source.replace('system-', ''));
      return new EntityAddr(hash, undefined, undefined);
    } else if (source.startsWith('account-')) {
      const hash = Hash.fromHex(source.replace('account-', ''));
      return new EntityAddr(undefined, hash, undefined);
    } else if (source.startsWith('contract-')) {
      const hash = Hash.fromHex(source.replace('contract-', ''));
      return new EntityAddr(undefined, undefined, hash);
    }
    throw ErrInvalidEntityAddrFormat;
  }

  /**
   * Converts the EntityAddr to a byte array.
   * The first byte represents the entity type, followed by the bytes of the associated hash.
   * @returns The byte array representation of the EntityAddr.
   * @throws {Error} If the EntityAddr type is unexpected.
   */
  toBytes(): Uint8Array {
    let prefix: number;
    let bytes: Uint8Array;

    if (this.system) {
      prefix = EntityKindType.SystemKind;
      bytes = this.system.toBytes();
    } else if (this.account) {
      prefix = EntityKindType.AccountKind;
      bytes = this.account.toBytes();
    } else if (this.smartContract) {
      prefix = EntityKindType.SmartContractKind;
      bytes = this.smartContract.toBytes();
    } else {
      throw new Error('Unexpected EntityAddr type');
    }

    return concat([Uint8Array.from([prefix]), bytes]);
  }

  /**
   * Creates an EntityAddr from a byte array. The first byte indicates the entity type,
   * and the remaining bytes represent the hash.
   * @param bytes - The byte array.
   * @returns A new EntityAddr instance.
   * @throws {Error} If the buffer is empty or the format is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<EntityAddr> {
    if (bytes.length === 0) {
      throw new Error('Buffer is empty, cannot create EntityAddr.');
    }

    const tag = bytes[0];
    const rem = bytes.subarray(1);
    const entityKindTag = EntityAddr.getEntityKindFromByte(tag);
    const { result: hash, bytes: hashBytes } = Hash.fromBytes(rem);

    switch (entityKindTag) {
      case EntityKindType.SystemKind:
        return {
          result: new EntityAddr(hash, undefined, undefined),
          bytes: hashBytes
        };
      case EntityKindType.AccountKind:
        return {
          result: new EntityAddr(undefined, hash, undefined),
          bytes: hashBytes
        };
      case EntityKindType.SmartContractKind:
        return {
          result: new EntityAddr(undefined, undefined, hash),
          bytes: hashBytes
        };
      default:
        throw new Error('Invalid EntityAddr format.');
    }
  }

  /**
   * Converts a byte to an EntityKind.
   * @param tag - The byte to convert.
   * @returns The corresponding EntityKind.
   * @throws {Error} If the byte doesn't correspond to a valid EntityKind.
   */
  private static getEntityKindFromByte(tag: number): EntityKindType {
    if (tag in EntityKindType) {
      return tag as EntityKindType;
    } else {
      throw new Error('Invalid entity kind tag.');
    }
  }

  /**
   * Creates an EntityAddr from its JSON representation.
   * @param json - The JSON string representation of the EntityAddr.
   * @returns A new EntityAddr instance.
   */
  public static fromJSON(json: string): EntityAddr {
    return this.fromPrefixedString(json);
  }

  /**
   * Converts the EntityAddr to its JSON representation.
   * @returns The JSON string representation of the EntityAddr.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
