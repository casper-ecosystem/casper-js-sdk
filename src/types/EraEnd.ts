import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  jsonMapMember
} from 'typedjson';
import { PublicKey } from './keypair';
import { ValidatorWeightEraEnd } from './ValidatorWeight';
import { CLValueUInt512 } from './clvalue';
import { deserializeRewards, serializeRewards } from './SerializationUtils';

/**
 * Class representing the rewards associated with a validator in a given era.
 */
@jsonObject
export class EraReward {
  /**
   * The public key of the validator receiving the reward.
   */
  @jsonMember({
    name: 'validator',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public validator: PublicKey;

  /**
   * The amount of reward given to the validator.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * Constructs an `EraReward` instance.
   *
   * @param validator The public key of the validator.
   * @param amount The reward amount.
   */
  constructor(validator: PublicKey, amount: CLValueUInt512) {
    this.validator = validator;
    this.amount = amount;
  }
}

/**
 * Class representing the era report containing information about equivocators, inactive validators, and rewards.
 */
@jsonObject
export class EraReport {
  /**
   * List of validators that have been found to equivocate during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'equivocators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public equivocators: PublicKey[];

  /**
   * List of inactive validators during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'inactive_validators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public inactiveValidators: PublicKey[];

  /**
   * List of rewards distributed to validators during the era.
   */
  @jsonArrayMember(EraReward, { name: 'rewards' })
  public rewards: EraReward[];

  /**
   * Constructs an `EraReport` instance.
   *
   * @param equivocators The list of equivocators.
   * @param inactiveValidators The list of inactive validators.
   * @param rewards The list of rewards distributed to validators.
   */
  constructor(
    equivocators: PublicKey[] = [],
    inactiveValidators: PublicKey[] = [],
    rewards: EraReward[] = []
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.rewards = rewards;
  }
}

/**
 * Class representing the details of an era's end, version 2. It includes information like equivocations, inactive validators, and rewards.
 */
@jsonObject
export class EraEndV2 {
  /**
   * List of validators that have been found to equivocate during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'equivocators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public equivocators: PublicKey[];

  /**
   * List of inactive validators during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'inactive_validators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public inactiveValidators: PublicKey[];

  /**
   * List of validator weights for the next era.
   */
  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  /**
   * A map of rewards for each validator, identified by their public key, in the next era.
   */
  @jsonMapMember(String, Array, {
    name: 'rewards',
    serializer: (map: Map<string, CLValueUInt512[]>) => serializeRewards(map),
    deserializer: deserializeRewards
  })
  public rewards: Map<string, CLValueUInt512[]>;

  /**
   * The gas price for the next era.
   */
  @jsonMember({ name: 'next_era_gas_price', constructor: Number })
  public nextEraGasPrice: number;

  /**
   * Constructs an `EraEndV2` instance.
   *
   * @param equivocators The list of equivocators.
   * @param inactiveValidators The list of inactive validators.
   * @param nextEraValidatorWeights The validator weights for the next era.
   * @param rewards The map of rewards for each validator in the next era.
   * @param nextEraGasPrice The gas price for the next era.
   */
  constructor(
    equivocators: PublicKey[],
    inactiveValidators: PublicKey[],
    nextEraValidatorWeights: ValidatorWeightEraEnd[],
    rewards: Map<string, CLValueUInt512[]>,
    nextEraGasPrice: number
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
    this.rewards = rewards;
    this.nextEraGasPrice = nextEraGasPrice;
  }
}

/**
 * Class representing the details of an era's end, version 1.
 */
@jsonObject
export class EraEndV1 {
  /**
   * The era report containing equivocators, inactive validators, and rewards.
   */
  @jsonMember({ name: 'era_report', constructor: EraReport })
  public eraReport: EraReport;

  /**
   * The list of validator weights for the next era.
   */
  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  /**
   * Constructs an `EraEndV1` instance.
   *
   * @param eraReport The era report.
   * @param nextEraValidatorWeights The validator weights for the next era.
   */
  constructor(
    eraReport: EraReport,
    nextEraValidatorWeights: ValidatorWeightEraEnd[]
  ) {
    this.eraReport = eraReport;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
  }
}

/**
 * A class that represents the end of an era with a unified structure.
 */
@jsonObject
export class EraEnd {
  /**
   * List of validators that have been found to equivocate during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'equivocators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public equivocators: PublicKey[];

  /**
   * List of inactive validators during the era.
   */
  @jsonArrayMember(PublicKey, {
    name: 'inactive_validators',
    serializer: (value: PublicKey[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => PublicKey.fromJSON(it))
  })
  public inactiveValidators: PublicKey[];

  /**
   * List of validator weights for the next era.
   */
  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  /**
   * A map of rewards for each validator, identified by their public key.
   */
  @jsonMapMember(String, CLValueUInt512, {
    name: 'rewards',
    deserializer: deserializeRewards,
    serializer: (map: Map<string, CLValueUInt512[]>) => serializeRewards(map)
  })
  public rewards: Map<string, CLValueUInt512[]>;

  /**
   * The gas price for the next era.
   */
  @jsonMember({ name: 'next_era_gas_price', constructor: Number })
  public nextEraGasPrice: number;

  /**
   * Constructs an `EraEnd` instance.
   *
   * @param equivocators The list of equivocators.
   * @param inactiveValidators The list of inactive validators.
   * @param nextEraValidatorWeights The validator weights for the next era.
   * @param rewards The map of rewards for each validator.
   * @param nextEraGasPrice The gas price for the next era.
   */
  constructor(
    equivocators: PublicKey[] = [],
    inactiveValidators: PublicKey[] = [],
    nextEraValidatorWeights: ValidatorWeightEraEnd[] = [],
    rewards: Map<string, CLValueUInt512[]> = new Map(),
    nextEraGasPrice = 1
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
    this.rewards = rewards;
    this.nextEraGasPrice = nextEraGasPrice;
  }

  /**
   * Converts an `EraEndV2` instance to `EraEnd`.
   *
   * @param eraEnd The `EraEndV2` instance.
   * @returns A new `EraEnd` instance, or `null` if the `EraEndV2` is `null`.
   */
  static fromV2(eraEnd: EraEndV2 | null): EraEnd | null {
    if (!eraEnd) return null;
    const result = new EraEnd();
    result.nextEraGasPrice = eraEnd.nextEraGasPrice;
    result.equivocators = eraEnd.equivocators;
    result.inactiveValidators = eraEnd.inactiveValidators;
    result.nextEraValidatorWeights = eraEnd.nextEraValidatorWeights;
    result.rewards = eraEnd.rewards;
    return result;
  }

  /**
   * Converts an `EraEndV1` instance to `EraEnd`.
   *
   * @param eraEnd The `EraEndV1` instance.
   * @returns A new `EraEnd` instance, or `null` if the `EraEndV1` is `null`.
   */
  static fromV1(eraEnd: EraEndV1 | null): EraEnd | null {
    if (!eraEnd) return null;

    const rewardsMap = new Map<string, CLValueUInt512[]>();
    for (const reward of eraEnd.eraReport.rewards) {
      const validatorHex = reward.validator.toHex();
      if (!rewardsMap.has(validatorHex)) {
        rewardsMap.set(validatorHex, []);
      }
      rewardsMap.get(validatorHex)?.push(reward.amount);
    }

    const result = new EraEnd();
    result.nextEraGasPrice = 1;
    result.equivocators = eraEnd.eraReport.equivocators;
    result.inactiveValidators = eraEnd.eraReport.inactiveValidators;
    result.nextEraValidatorWeights = eraEnd.nextEraValidatorWeights;
    result.rewards = rewardsMap;

    return result;
  }
}
