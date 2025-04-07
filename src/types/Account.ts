import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { AccountHash, URef } from './key';
import { NamedKey } from './NamedKey';

/**
 * Represents an associated key for an account, linking an `AccountHash`
 * with a weight that determines its permission level.
 */
@jsonObject
export class AssociatedKey {
  /**
   * The account hash associated with this key, uniquely identifying the account.
   */
  @jsonMember({
    name: 'account_hash',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  accountHash: AccountHash;

  /**
   * The weight assigned to this key, which determines the key’s authority level.
   */
  @jsonMember({
    name: 'weight',
    constructor: Number
  })
  weight: number;
}

/**
 * Represents action thresholds for an account, specifying minimum weights
 * required for deployment and key management actions.
 */
@jsonObject
export class ActionThresholds {
  /**
   * The threshold for performing deployment actions, represented as a weight.
   */
  @jsonMember({
    name: 'deployment',
    constructor: Number
  })
  deployment: number;

  /**
   * The threshold for performing key management actions, represented as a weight.
   */
  @jsonMember({
    name: 'key_management',
    constructor: Number
  })
  keyManagement: number;
}

/**
 * Represents an account in the blockchain, containing account details such as
 * associated keys, named keys, main purse, and action thresholds.
 */
@jsonObject
export class Account {
  /**
   * The account hash for this account, which serves as a unique identifier.
   */
  @jsonMember({
    name: 'account_hash',
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON(),
    constructor: AccountHash
  })
  accountHash: AccountHash;

  /**
   * The named keys associated with this account, mapping key names to `URef` values.
   * TODO: Is it could be any type of keys or certain types?
   */
  @jsonArrayMember(NamedKey, {
    name: 'named_keys'
  })
  namedKeys: NamedKey[];

  /**
   * The main purse associated with this account, represented as a `URef`.
   */
  @jsonMember({
    name: 'main_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  mainPurse: URef;

  /**
   * The list of associated keys for this account, each with an `AccountHash` and weight.
   */
  @jsonArrayMember(AssociatedKey, { name: 'associated_keys' })
  associatedKeys: AssociatedKey[];

  /**
   * The action thresholds for this account, setting required weights for specific actions.
   */
  @jsonMember({ name: 'action_thresholds', constructor: ActionThresholds })
  actionThresholds: ActionThresholds;
}
