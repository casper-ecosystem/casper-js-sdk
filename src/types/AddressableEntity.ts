import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';
import { AssociatedKey } from './Account';
import { EntryPointV1 } from './EntryPoint';
import { AccountHash, URef } from './key';
import { TransactionRuntime } from './TransactionTarget';

/**
 * Defines different kinds of entities within the system, such as system entities,
 * accounts, and smart contracts. Provides details on each entity type.
 */
@jsonObject
export class EntityKind {
  /**
   * Represents a system entity type, allowing flexible naming of system-specific entities.
   */
  @jsonMember({ name: 'System', constructor: String })
  system?: string;

  /**
   * Represents an account entity, identified by an `AccountHash`.
   */
  @jsonMember({
    name: 'Account',
    constructor: AccountHash,
    deserializer: json => (json ? AccountHash.fromJSON(json) : undefined),
    serializer: value => (value ? value.toJSON() : undefined)
  })
  account?: AccountHash;

  /**
   * Represents a smart contract entity, specified by its transaction runtime version.
   */
  @jsonMember({
    name: 'SmartContract',
    constructor: TransactionRuntime,
    deserializer: json => {
      if (!json) return;
      return TransactionRuntime.fromJSON(json);
    },
    serializer: (value: TransactionRuntime) => value.toJSON()
  })
  smartContract?: TransactionRuntime;
}

/**
 * Defines thresholds for various actions that an entity can perform,
 * with each threshold represented as a weight.
 */
@jsonObject
export class EntityActionThresholds {
  /**
   * The weight required to authorize deployment actions.
   */
  @jsonMember({ name: 'deployment', constructor: Number })
  deployment: number;

  /**
   * The weight required to authorize upgrade management actions.
   */
  @jsonMember({ name: 'upgrade_management', constructor: Number })
  upgradeManagement: number;

  /**
   * The weight required to authorize key management actions.
   */
  @jsonMember({ name: 'key_management', constructor: Number })
  keyManagement: number;
}

/**
 * Represents an addressable entity, which can be a smart contract, account, or system entity.
 * Each entity contains various properties such as action thresholds, associated keys,
 * and message topics.
 */
@jsonObject
export class AddressableEntity {
  /**
   * Specifies the kind of the entity, such as system entity, account, or smart contract.
   */
  @jsonMember({
    name: 'entity_kind',
    constructor: EntityKind
  })
  entityKind: EntityKind;

  /**
   * The unique package hash associated with this entity.
   */
  @jsonMember({ name: 'package_hash', constructor: String })
  packageHash: string;

  /**
   * The bytecode hash associated with this entity, representing its executable code.
   */
  @jsonMember({ name: 'byte_code_hash', constructor: String })
  byteCodeHash: string;

  /**
   * The associated keys for this entity, each with an `AccountHash` and a weight.
   */
  @jsonArrayMember(AssociatedKey, { name: 'associated_keys' })
  associatedKeys: AssociatedKey[];

  /**
   * The action thresholds required for different operations, such as deployment or key management.
   */
  @jsonMember({
    name: 'action_thresholds',
    constructor: EntityActionThresholds
  })
  actionThresholds: EntityActionThresholds;

  /**
   * The main purse associated with this entity, used for managing funds.
   */
  @jsonMember({
    name: 'main_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  mainPurse: URef;

  /**
   * The protocol version in use by this entity.
   */
  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;
}

/**
 * Represents an entry point in a smart contract, with a specific name and configuration.
 */
@jsonObject
export class NamedEntryPoint {
  /**
   * The name of the entry point.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The entry point configuration, specifying the method and parameters.
   */
  @jsonMember({
    name: 'entry_point',
    constructor: EntryPointV1
  })
  entryPoint: EntryPointV1;

  /**
   * Creates a new NamedEntryPoint instance from JSON.
   *
   * This method supports both JSON variants:
   *  - 1.x: { name, args, ret, access, entry_point_type, ... }
   *  - 2.x: { name, entry_point: { name, args, ret, access, entry_point_type, ... } }
   *
   * @param json The raw JSON to parse.
   * @returns A new instance of NamedEntryPoint.
   */
  public static fromJSON(json: any): NamedEntryPoint {
    if (!json) {
      throw new Error('Invalid JSON provided for NamedEntryPoint');
    }

    const normalizedJSON = json.entry_point
      ? json
      : { name: json?.name, entry_point: json };
    const typedJSON = new TypedJSON(NamedEntryPoint);

    const parsed = typedJSON.parse(normalizedJSON);

    if (!parsed) {
      throw new Error('Failed to parse NamedEntryPoint JSON');
    }

    return parsed;
  }
}
