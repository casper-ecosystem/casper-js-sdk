import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';
import { URef } from './key';
import { HexBytes } from './HexBytes';

/**
 * Represents the details of an era where an unbonding request was initiated.
 */
@jsonObject
export class UnbondEra {
  /**
   * The amount of tokens to be unbonded during this era.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  /**
   * The era in which the unbonding request was created.
   */
  @jsonMember({ name: 'era_of_creation', constructor: Number })
  eraOfCreation: number;

  /**
   * The bonding purse associated with the unbonding request.
   */
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  /**
   * The validator public key to re-delegate to.
   */
  @jsonMember({
    name: 'new_validator',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  newValidator: PublicKey;
}

/**
 * Represents the kind of unbonding request, including information about the validator,
 * delegated public key, and delegated purse.
 */
@jsonObject
export class UnbondKind {
  /**
   * The public key of the validator who the tokens are being unbonded from.
   */
  @jsonMember({
    name: 'Validator',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  validator: PublicKey;

  /**
   * The public key of the delegated account involved in the unbonding.
   */
  @jsonMember({
    name: 'DelegatedPublicKey',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  delegatedPublicKey: PublicKey;

  /**
   * The purse associated with the delegation from which tokens will be unbonded.
   */
  @jsonMember({
    name: 'DelegatedPurse',
    constructor: String
  })
  delegatedPurse: string;
}

/**
 * Represents a request to unbond tokens, specifying the validator, unbond kind, and eras.
 */
@jsonObject
export class Unbond {
  /**
   * The public key of the validator from which tokens are being unbonded.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The kind of unbonding request, detailing whether it's from a validator, delegated public key, or delegated purse.
   */
  @jsonMember({
    name: 'unbond_kind',
    constructor: UnbondKind
  })
  unbondKind: UnbondKind;

  /**
   * A list of eras during which unbonding occurred.
   */
  @jsonArrayMember(UnbondEra, { name: 'eras' })
  eras: UnbondEra[];
}

/**
 * Represents a delegation bid, which can be made from either a public key or a purse.
 */
@jsonObject
export class DelegationKind {
  /**
   * A delegation bid made using a public key.
   */
  @jsonMember({
    name: 'PublicKey',
    constructor: PublicKey
  })
  publicKey?: PublicKey;

  /**
   * A delegation bid made using a purse.
   */
  @jsonMember({
    name: 'Purse',
    constructor: URef
  })
  purse?: URef;

  /**
   * Converts the DelegationKind into a hexadecimal string.
   *
   * The method ensures that exactly one of the fields is set. If both or neither
   * are provided, it throws an error.
   *
   *
   * @returns The hexadecimal string representation of the delegation.
   * @throws {Error} If neither or both delegation fields are set.
   */
  toHex(): string {
    const hasPublicKey =
      this.publicKey !== undefined && this.publicKey !== null;
    const hasPurse = this.purse !== undefined && this.purse !== null;

    if (!hasPublicKey && !hasPurse) {
      throw new Error(
        "Invalid DelegationKind: Neither 'publicKey' nor 'purse' is set. One must be provided."
      );
    }

    if (hasPublicKey) {
      return this.publicKey!.toHex();
    } else {
      return this.purse!.toPrefixedString();
    }
  }

  /**
   * Deserializes a JSON object into a DelegationKind instance.
   *
   * This method examines the input JSON. If it contains a `PublicKey` field,
   * it will use that to populate the `publicKey` property. Otherwise, if it
   * contains a `Purse` field, it will decode the hex string, append the default
   * access byte (`7`), and create a URef instance.
   *
   * @param json - The JSON object to deserialize.
   * @returns A new DelegationKind instance reflecting the given JSON.
   * @throws {Error} If the input JSON is null or undefined, or if it does not
   *                 conform to the expected format.
   */
  public static fromJSON(json: any): DelegationKind {
    if (!json) {
      throw new Error(`Invalid JSON for DelegationKind: ${json}`);
    }

    const delegatorKind = new DelegationKind();

    if (json.PublicKey !== undefined && json.PublicKey !== null) {
      delegatorKind.publicKey = PublicKey.fromJSON(json.PublicKey);
    } else if (json.Purse !== undefined && json.Purse !== null) {
      /**
       * Purse is represented not in format at uref-{uref-bytes}-{access}
       * but just a hex bytes
       */
      const urefBytes = HexBytes.fromHex(json.Purse);
      const bytesWithAccess = new Uint8Array(urefBytes.bytes.length + 1);
      bytesWithAccess.set(urefBytes.bytes, 0);
      bytesWithAccess[urefBytes.bytes.length] = 7;
      delegatorKind.purse = URef.fromBytes(bytesWithAccess).result;
    } else {
      throw new Error('unexpected DelegatorKind format');
    }

    return delegatorKind;
  }
}

/**
 * Represents a vesting schedule for staked amounts, including an initial release timestamp and locked amounts.
 */
@jsonObject
export class VestingSchedule {
  /**
   * The initial release timestamp in milliseconds.
   */
  @jsonMember({ name: 'initial_release_timestamp_millis', constructor: Number })
  initialReleaseTimestampMillis: number;

  /**
   * The list of locked amounts associated with this vesting schedule.
   */
  @jsonArrayMember(() => CLValueUInt512, {
    name: 'locked_amounts',
    serializer: (value: CLValueUInt512[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => CLValueUInt512.fromJSON(it))
  })
  lockedAmounts: CLValueUInt512[];
}

/**
 * Represents a bid by a validator, including details about the bonding purse, delegation rate, stake, and vesting schedule.
 */
@jsonObject
export class ValidatorBid {
  /**
   * The public key associated with the validator.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  validatorPublicKey: PublicKey;

  /**
   * The bonding purse associated with the validator.
   */
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  /**
   * The rate at which delegations to this validator are taxed.
   */
  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  /**
   * Indicates whether the validator is currently inactive.
   */
  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  /**
   * The total amount staked by this validator.
   */
  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

  /**
   * Minimum and maximum amounts that can be delegated to this validator.
   */
  @jsonMember({
    name: 'minimum_delegation_amount',
    constructor: BigInt,
    deserializer: json => {
      if (!json) return;
      try {
        return BigInt(json);
      } catch (e) {
        throw new Error(`Could not convert minimum_delegation_amount: ${json}`);
      }
    },
    serializer: value => value?.toString()
  })
  minimumDelegationAmount: bigint;

  @jsonMember({
    name: 'maximum_delegation_amount',
    constructor: BigInt,
    deserializer: json => {
      if (!json) return;
      try {
        return BigInt(json);
      } catch (e) {
        throw new Error(`Could not convert maximum_delegation_amount: ${json}`);
      }
    },
    serializer: value => value?.toString()
  })
  maximumDelegationAmount: bigint;

  /**
   * Number of slots reserved for specific delegators
   */
  @jsonMember({ name: 'reserved_slots', constructor: Number })
  reservedSlots: number;

  /**
   * The vesting schedule for this validator’s stake.
   */
  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

/**
 * Represents a delegator who delegates their stake to a validator.
 */
@jsonObject
export class Delegator {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  bondingPurse: URef;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({
    name: 'delegator_kind',
    constructor: DelegationKind,
    deserializer: json => {
      if (!json) return;
      return DelegationKind.fromJSON(json);
    }
  })
  delegatorKind: DelegationKind;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  validatorPublicKey: PublicKey;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;

  constructor(
    bondingPurse: URef,
    stakedAmount: CLValueUInt512,
    delegatorKind: DelegationKind,
    validatorPublicKey: PublicKey,
    vestingSchedule?: VestingSchedule
  ) {
    this.bondingPurse = bondingPurse;
    this.stakedAmount = stakedAmount;
    this.delegatorKind = delegatorKind;
    this.validatorPublicKey = validatorPublicKey;
    this.vestingSchedule = vestingSchedule;
  }

  /**
   * Creates a `Delegator` instance from a `DelegatorV1` instance.
   * @param v1 - The `DelegatorV1` instance to convert.
   * @returns A new `Delegator` instance.
   */
  static newDelegatorFromDelegatorV1(v1: DelegatorV1): Delegator {
    const delegationKind = new DelegationKind();
    delegationKind.publicKey = v1.publicKey;

    return new Delegator(
      v1.bondingPurse,
      v1.stakedAmount,
      delegationKind,
      v1.delegatee,
      v1.vestingSchedule
    );
  }

  /**
   * Deserializes a `Delegator` instance from JSON.
   * @param json
   */
  static fromJSON(json: any): Delegator[] {
    if (!Array.isArray(json)) {
      throw new Error('Delegators should be an array.');
    }

    if (json.length > 0 && json[0].delegator_public_key != null) {
      return json.map((item: any) => {
        const delegatorJson = item.delegator;
        const serializer = new TypedJSON(Delegator);
        const delegator = serializer.parse(delegatorJson);

        if (!delegator) {
          throw new Error(
            'Failed to deserialize Delegator from wrapped format.'
          );
        }

        return delegator;
      });
    } else {
      return json.map((item: any) => {
        const delegatorV1Serializer = new TypedJSON(DelegatorV1);
        const delegatorV1 = delegatorV1Serializer.parse(item);
        if (!delegatorV1) {
          throw new Error('Failed to deserialize DelegatorV1.');
        }
        return this.newDelegatorFromDelegatorV1(delegatorV1);
      });
    }
  }
}

/**
 * Represents a bid entry, including the bonding purse, delegation rate, inactive status, and vesting schedule.
 */
@jsonObject
export class Bid {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  bondingPurse: URef;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: (value: CLValueUInt512) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  validatorPublicKey: PublicKey;

  @jsonArrayMember(Delegator, {
    name: 'delegators',
    deserializer: json => {
      if (!json) return;
      return Delegator.fromJSON(json);
    }
  })
  delegators: Delegator[];

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

/**
 * Represents a version 1 delegator with basic properties such as bonding purse and stake amount.
 */
@jsonObject
export class DelegatorV1 {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({
    name: 'delegatee',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  delegatee: PublicKey;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

/**
 * Represents a credit in a staking system, tied to a specific era and validator.
 */
@jsonObject
export class Credit {
  /**
   * The era ID associated with this credit.
   */
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  /**
   * The public key of the validator for this credit.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The amount of the credit.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;
}

/**
 * Represents a bridge between validators, including their public keys and the associated era.
 */
@jsonObject
export class Bridge {
  /**
   * The era ID during which this bridge was established.
   */
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  /**
   * The public key of the old validator.
   */
  @jsonMember({
    name: 'old_validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  oldValidatorPublicKey: PublicKey;

  /**
   * The public key of the new validator.
   */
  @jsonMember({
    name: 'new_validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  newValidatorPublicKey: PublicKey;
}

@jsonObject
/**
 * Represents a reservation in the blockchain system, including delegation details and associated public keys.
 */
export class Reservation {
  /**
   * The delegation rate, representing the percentage of rewards allocated to the delegator.
   */
  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  /**
   * The public key of the validator associated with this reservation.
   *
   * This key is used to identify the validator in the blockchain system.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * Kinds of delegation bids.
   */
  @jsonMember({
    name: 'delegator_kind',
    constructor: DelegationKind,
    deserializer: json => {
      if (!json) return;
      return DelegationKind.fromJSON(json);
    }
  })
  delegatorKind: DelegationKind;
}
