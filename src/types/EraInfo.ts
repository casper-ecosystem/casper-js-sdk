import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';
import { DelegationKind } from './Bid';

/**
 * Class representing the allocation of seigniorage to a delegator.
 */
@jsonObject
export class DelegatorAllocation {
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

  /**
   * The public key of the validator associated with the delegator's allocation.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The amount of seigniorage allocated to the delegator.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  /**
   * Constructs a `DelegatorAllocation` instance.
   *
   * @param delegatorKind Kinds of delegation bids.
   * @param validatorPublicKey The public key of the associated validator.
   * @param amount The amount of seigniorage allocated to the delegator.
   */
  constructor(
    delegatorKind: DelegationKind,
    validatorPublicKey: PublicKey,
    amount: CLValueUInt512
  ) {
    this.delegatorKind = delegatorKind;
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

/**
 * Class representing the allocation of seigniorage to a validator.
 */
@jsonObject
export class ValidatorAllocation {
  /**
   * The public key of the validator receiving the allocation.
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
   * The amount of seigniorage allocated to the validator.
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
   * Constructs a `ValidatorAllocation` instance.
   *
   * @param validatorPublicKey The public key of the validator.
   * @param amount The amount of seigniorage allocated to the validator.
   */
  constructor(validatorPublicKey: PublicKey, amount: CLValueUInt512) {
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

/**
 * Represents the JSON structure when the key "Delegator" is present.
 */
@jsonObject
export class DelegatorData {
  @jsonMember({
    name: 'delegator_public_key',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  delegatorPublicKey?: PublicKey;

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

  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;
}

/**
 * Temporary helper class to match the overall JSON structure.
 * The JSON may contain one of the following keys:
 * - "Validator" (a ValidatorAllocation)
 * - "DelegatorKind" (a DelegatorAllocation)
 * - "Delegator" (a DelegatorData, which will be converted to a DelegatorAllocation)
 */
@jsonObject
class TempSeigniorageAllocation {
  @jsonMember({ name: 'Validator', constructor: ValidatorAllocation })
  validator?: ValidatorAllocation;

  @jsonMember({ name: 'DelegatorKind', constructor: DelegatorAllocation })
  delegatorKind?: DelegatorAllocation;

  @jsonMember({ name: 'Delegator', constructor: DelegatorData })
  delegator?: DelegatorData;
}

/**
 * Class representing the seigniorage allocation for a validator and delegator.
 */
@jsonObject
export class SeigniorageAllocation {
  /**
   * The allocation for a validator.
   */
  @jsonMember({ name: 'Validator', constructor: ValidatorAllocation })
  validator?: ValidatorAllocation;

  /**
   * The allocation for a delegator.
   */
  @jsonMember({ name: 'DelegatorKind', constructor: DelegatorAllocation })
  delegator?: DelegatorAllocation;

  /**
   * Constructs a `SeigniorageAllocation` instance.
   *
   * @param validator The validator allocation.
   * @param delegator The delegator allocation.
   */
  constructor(
    validator?: ValidatorAllocation,
    delegator?: DelegatorAllocation
  ) {
    this.validator = validator;
    this.delegator = delegator;
  }

  /**
   * Custom deserialization from a JSON.
   *
   * The JSON is expected to have one of the following structures:
   * - A "Delegator" key with an object containing "delegator_public_key", "validator_public_key", and "amount".
   * - A "Validator" key with an object matching ValidatorAllocation.
   * - A "DelegatorKind" key with an object matching DelegatorAllocation.
   *
   * @param json A JSON.
   * @returns A new SeigniorageAllocation instance.
   * @throws Error if the JSON is empty, invalid, or does not match any expected structure.
   */
  public static fromJSON(json: any): SeigniorageAllocation {
    if (!json) {
      throw new Error(`Invalid JSON for SeigniorageAllocation: ${json}`);
    }

    const allocation = new SeigniorageAllocation();

    // 2.x nests a `delegator_kind` object under the same `Delegator` key that
    // 1.x used for a flat `delegator_public_key`, so the shape has to pick the
    // reader — on the key name alone a 2.x payload parses to an undefined key.
    if (json?.Delegator?.delegator_kind) {
      const parsed = new TypedJSON(DelegatorAllocation).parse(json.Delegator);
      if (!parsed) {
        throw new Error('Failed to parse Delegator seigniorage allocation');
      }
      allocation.delegator = parsed;
      return allocation;
    }

    const temp = new TypedJSON(TempSeigniorageAllocation).parse(json);
    if (!temp) {
      throw new Error('Failed to parse JSON');
    }

    if (temp?.delegator) {
      const delegatorKind = new DelegationKind();
      delegatorKind.publicKey = temp?.delegator?.delegatorPublicKey;
      allocation.delegator = new DelegatorAllocation(
        delegatorKind,
        temp?.delegator?.validatorPublicKey,
        temp?.delegator?.amount
      );
    } else if (temp.validator) {
      allocation.validator = temp.validator;
    } else if (temp.delegatorKind) {
      allocation.delegator = temp.delegatorKind;
    } else {
      throw new Error('incorrect SeigniorageAllocation format structure');
    }

    return allocation;
  }
}

/**
 * Class representing information about an era, including seigniorage allocations.
 */
@jsonObject
export class EraInfo {
  /**
   * A list of seigniorage allocations for validators and delegators in the era.
   */
  @jsonArrayMember(SeigniorageAllocation, {
    name: 'seigniorage_allocations',
    deserializer: json => {
      if (!json) return;
      return json.map((it: SeigniorageAllocation) =>
        SeigniorageAllocation.fromJSON(it)
      );
    }
  })
  seigniorageAllocations: SeigniorageAllocation[];

  /**
   * Constructs an `EraInfo` instance.
   *
   * @param seigniorageAllocations The list of seigniorage allocations for validators and delegators.
   */
  constructor(seigniorageAllocations: SeigniorageAllocation[] = []) {
    this.seigniorageAllocations = seigniorageAllocations;
  }
}
