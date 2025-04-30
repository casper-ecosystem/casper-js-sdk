import {
  jsonObject,
  jsonMember,
  TypedJSON,
  jsonArrayMember,
  AnyT
} from 'typedjson';
import { BigNumber } from '@ethersproject/bignumber';

import { Hash, TransferHash, Key } from './key';
import { InitiatorAddr } from './InitiatorAddr';
import { Transfer } from './Transfer';
import { Transform, TransformKey } from './Transform';
import { TransactionHash } from './Transaction';

/**
 * Represents an operation performed during a transaction.
 */
@jsonObject
export class Operation {
  /**
   * The key associated with the operation.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  public key: Key;

  /**
   * The type of the operation (e.g., "Write", "Transfer").
   */
  @jsonMember({ name: 'kind', constructor: String })
  public kind: string;
}

/**
 * Represents the effect of a transaction, including the operations and transformations.
 */
@jsonObject
export class Effect {
  /**
   * The operations performed as part of this effect.
   */
  @jsonArrayMember(Operation, {
    name: 'operations'
  })
  public operations: Operation[] = [];

  /**
   * The transformations applied as part of this effect.
   */
  @jsonArrayMember(TransformKey, {
    name: 'transforms'
  })
  public transforms: TransformKey[] = [];
}

/**
 * Contains the result of a transaction's execution, including the effect and related transfers.
 */
@jsonObject
export class ExecutionResultStatusData {
  /**
   * The effect of the transaction execution, including operations and transformations.
   */
  @jsonMember({
    name: 'effect',
    constructor: Effect
  })
  public effect: Effect;

  /**
   * The transfers that were part of the transaction execution.
   */
  @jsonArrayMember(TransferHash, {
    name: 'transfers',
    serializer: (value: TransferHash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => TransferHash.fromJSON(it))
  })
  public transfers: TransferHash[] = [];

  /**
   * The cost of the transaction execution.
   */
  @jsonMember({
    name: 'cost',
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => BigNumber.from(value).toString()
  })
  public cost: number;

  /**
   * The error message, if any, generated during the transaction execution.
   */
  @jsonMember({ name: 'error_message', constructor: String })
  public errorMessage: string;
}

/**
 * Represents version 2 of the execution result, containing more detailed information.
 */
@jsonObject
export class ExecutionResultV2 {
  /**
   * The address of the initiator of the execution.
   */
  @jsonMember({
    name: 'initiator',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiator: InitiatorAddr;

  /**
   * The error message, if any, generated during the execution.
   */
  @jsonMember({
    name: 'error_message',
    constructor: String,
    preserveNull: true
  })
  public errorMessage?: string;

  /**
   * The execution limit for the transaction.
   */
  @jsonMember({
    name: 'limit',
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => {
      if (!value) return;
      return BigNumber.from(value).toString();
    }
  })
  public limit: number;

  /**
   * The amount of resources consumed during the transaction execution.
   */
  @jsonMember({
    name: 'consumed',
    constructor: Number,
    deserializer: json => BigNumber.from(json).toNumber(),
    serializer: value => BigNumber.from(value).toString()
  })
  public consumed: number;

  @jsonMember({
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => {
      if (!value) return;
      return BigNumber.from(value).toString();
    }
  })
  public refund: number;

  /**
   * The gas price of the era.
   */
  @jsonMember({
    constructor: Number,
    name: 'current_price'
  })
  public currentPrice: number;

  /**
   * The cost associated with the transaction execution.
   */
  @jsonMember({
    name: 'cost',
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => {
      if (!value) return;
      return BigNumber.from(value).toString();
    }
  })
  public cost: number;

  /**
   * The payment made for the transaction, if any.
   */
  @jsonMember({ name: 'payment', constructor: AnyT })
  public payment?: any;

  /**
   * The transfers included in the transaction execution.
   */
  @jsonArrayMember(Transfer, {
    name: 'transfers',
    deserializer: (json: any) => json.map((it: string) => Transfer.fromJSON(it))
  })
  public transfers: Transfer[] = [];

  /**
   * The estimated size of the transaction execution.
   */
  @jsonMember({ name: 'size_estimate', constructor: Number })
  public sizeEstimate: number;

  /**
   * The effects applied during the transaction execution.
   */
  @jsonArrayMember(Transform, {
    name: 'effects'
  })
  public effects: Transform[] = [];
}

/**
 * Represents version 1 of the execution result, containing basic information on success or failure.
 */
@jsonObject
export class ExecutionResultV1 {
  /**
   * The status data for a successful execution.
   */
  @jsonMember({
    name: 'Success',
    constructor: ExecutionResultStatusData
  })
  public success?: ExecutionResultStatusData;

  /**
   * The status data for a failed execution.
   */
  @jsonMember({
    name: 'Failure',
    constructor: ExecutionResultStatusData
  })
  public failure?: ExecutionResultStatusData;
}

/**
 * Contains the block hash and execution result of a deploy execution.
 */
@jsonObject
export class DeployExecutionResult {
  /**
   * The block hash where the deploy was executed.
   */
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public blockHash: Hash;

  /**
   * The execution result for the deploy.
   */
  @jsonMember({
    name: 'result',
    constructor: ExecutionResultV1
  })
  public result: ExecutionResultV1;
}

/**
 * Represents the result of a transaction execution, which includes the initiator, cost, transfers, and effects.
 */
@jsonObject
export class ExecutionResult {
  /**
   * The address of the initiator of the execution.
   */
  @jsonMember({
    constructor: InitiatorAddr,
    deserializer: json => {
      if (!json) return;
      return InitiatorAddr.fromJSON(json);
    },
    serializer: (value: InitiatorAddr) => value.toJSON()
  })
  public initiator: InitiatorAddr;

  /**
   * The error message, if any, generated during the execution.
   */
  @jsonMember({
    name: 'error_message',
    constructor: String,
    preserveNull: true
  })
  public errorMessage?: string;

  /**
   * The error message, if any, generated during the execution.
   */
  @jsonMember({
    name: 'error',
    constructor: String,
    preserveNull: true
  })
  public error?: string;

  /**
   * The execution limit for the transaction.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => BigNumber.from(value).toString()
  })
  public limit: number;

  /**
   * The amount of resources consumed during the transaction execution.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => {
      if (!value) return;
      return BigNumber.from(value).toString();
    }
  })
  public consumed: number;

  @jsonMember({
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => {
      if (!value) return;
      return BigNumber.from(value).toString();
    }
  })
  public refund: number;

  @jsonMember({
    constructor: AnyT
  })
  public messages: any[];

  /**
   * The gas price of the era.
   */
  @jsonMember({
    constructor: Number,
    name: 'current_price'
  })
  public currentPrice: number;

  /**
   * The cost associated with the transaction execution.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => {
      if (!json) return;
      return BigNumber.from(json).toNumber();
    },
    serializer: value => BigNumber.from(value).toString()
  })
  public cost: number;

  /**
   * The payment made for the transaction, if any.
   */
  @jsonMember({ constructor: AnyT })
  public payment?: any;

  /**
   * The transfers included in the transaction execution.
   */
  @jsonArrayMember(Transfer, {
    name: 'transfers',
    deserializer: (json: any) => json.map((it: string) => Transfer.fromJSON(it))
  })
  public transfers: Transfer[] = [];

  /**
   * The estimated size of the transaction execution.
   */
  @jsonMember({ constructor: Number })
  public sizeEstimate: number;

  /**
   * The effects applied during the transaction execution.
   */
  @jsonArrayMember(Transform, {
    name: 'effects'
  })
  public effects: Transform[] = [];

  /**
   * The original execution result in version 1 format, if applicable.
   */
  public originExecutionResultV1?: ExecutionResultV1;

  /**
   * The original execution result in version 2 format, if applicable.
   */
  public originExecutionResultV2?: ExecutionResultV2;

  /**
   * Deserializes an `ExecutionResult` from JSON data.
   * Supports both version 1 and version 2 formats.
   *
   * @param data The JSON data representing the execution result.
   * @returns The deserialized `ExecutionResult`.
   * @throws Error if the data format is invalid or unknown.
   */
  public static fromJSON(data: any): ExecutionResult {
    if (data?.Version2) {
      const executionResultV2 = TypedJSON.parse(
        data.Version2,
        ExecutionResultV2
      );

      if (executionResultV2) {
        const executionResult = new ExecutionResult();
        executionResult.initiator = executionResultV2.initiator;
        executionResult.errorMessage = executionResultV2.errorMessage;
        executionResult.limit = executionResultV2.limit;
        executionResult.consumed = executionResultV2.consumed;
        executionResult.cost = executionResultV2.cost;
        executionResult.payment = executionResultV2.payment;
        executionResult.transfers = executionResultV2.transfers;
        executionResult.sizeEstimate = executionResultV2.sizeEstimate;
        executionResult.effects = executionResultV2.effects;
        executionResult.currentPrice = executionResultV2?.currentPrice;
        executionResult.refund = executionResultV2?.refund;
        executionResult.originExecutionResultV2 = executionResultV2;
        return executionResult;
      }
    } else if (data?.Version1) {
      const executionResultV1 = TypedJSON.parse(
        data.Version1,
        ExecutionResultV1
      );
      if (executionResultV1) {
        return ExecutionResult.fromV1(executionResultV1);
      }
    }

    throw new Error('Incorrect RPC response structure');
  }

  /**
   * Creates an `ExecutionResult` from version 1 of the execution result.
   *
   * @param v1 The version 1 execution result.
   * @returns The `ExecutionResult` created from version 1 data.
   */
  public static fromV1(v1: ExecutionResultV1): ExecutionResult {
    const result = new ExecutionResult();
    const transforms: Transform[] = [];
    const transfers: Transfer[] = [];

    if (v1.success) {
      for (const transform of v1.success.effect.transforms) {
        transforms.push(new Transform(transform.key, transform.transform));

        if (!transform.transform.isWriteTransfer()) {
          continue;
        }

        const writeTransfer = transform.transform.parseAsWriteTransfer();

        if (!writeTransfer) {
          continue;
        }

        const transfer = new Transfer();
        transfer.amount = writeTransfer.amount;
        transfer.transactionHash = TransactionHash.fromDeployHash(
          writeTransfer?.deployHash
        );
        transfer.from = new InitiatorAddr(undefined, writeTransfer.from);
        transfer.gas = writeTransfer.gas;
        transfer.id = writeTransfer.id;
        transfer.source = writeTransfer.source;
        transfer.target = writeTransfer.target;
        transfer.to = writeTransfer.to;

        transfers.push(transfer);
      }

      result.limit = 0; // limit is unknown field for V1 Deploy

      // In ExecutionResultV1, the 'v1.Success.Cost' field actually represents the amount of consumed gas.
      // However, in version 1.X, there is no distinction between 'cost' and 'consumed_gas'.
      //
      // For example, for failed deploys without execution results, 'cost' is reported as 0,
      // but the penalty charge (which is a cost) is reflected in the execution effects.
      //
      // In version V2, 'Consumed' and 'Cost' are explicitly separated.
      // So to maintain backward compatibility for V1, 'v1.Success.Cost' is used for both 'Consumed' and 'Cost'.
      result.consumed = v1.success.cost;
      result.cost = v1.success.cost;
      result.payment = null;
      result.transfers = transfers;
      result.effects = transforms;
      result.refund = 0;
      result.currentPrice = 1;
      result.originExecutionResultV1 = v1;

      return result;
    }

    if (v1.failure) {
      for (const transform of v1.failure.effect.transforms) {
        // TODO: we should convert old Transform to new format
        transforms.push(new Transform(transform.key, transform.transform));
      }

      result.errorMessage = v1.failure.errorMessage;
      result.consumed = v1.failure.cost;
      result.effects = transforms;
      result.originExecutionResultV1 = v1;

      return result;
    }

    throw new Error('Invalid ExecutionResultV1 structure');
  }

  /**
   * Converts an `ExecutionResult` instance to a plain JSON object.
   *
   * This method serializes an `ExecutionResult` object into a plain JSON structure
   * using the `TypedJSON` serializer. It allows for easy conversion of the
   * `ExecutionResult` to a JSON-compatible format that can be used for logging,
   * transmission over the network, or storage.
   *
   * @param executionResult - The `ExecutionResult` instance to be converted into a plain JSON object.
   *
   * @returns A plain JSON object representing the `ExecutionResult`.
   *
   */
  public static toJSON(executionResult: ExecutionResult) {
    const serializer = new TypedJSON(ExecutionResult);
    return serializer.toPlainJson(executionResult);
  }
}

/**
 * Represents execution information about a deploy, including the block hash, height, and execution result.
 */
@jsonObject
export class ExecutionInfo {
  /**
   * The block hash where the deploy was executed.
   */
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public blockHash: Hash;

  /**
   * The block height at the time the deploy was executed.
   */
  @jsonMember({ name: 'block_height', constructor: Number })
  public blockHeight: number;

  /**
   * The execution result associated with the deploy.
   */
  @jsonMember({
    name: 'execution_result',
    constructor: ExecutionResult,
    deserializer: json => {
      if (!json) return;
      return ExecutionResult.fromJSON(json);
    }
  })
  public executionResult: ExecutionResult;

  constructor(
    blockHash: Hash,
    blockHeight: number,
    executionResult: ExecutionResult
  ) {
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
    this.executionResult = executionResult;
  }

  public static fromV1(
    results: DeployExecutionResult[],
    height?: number
  ): ExecutionInfo {
    if (results.length === 0) {
      throw new Error('Missing ExecutionInfo.fromV1 results');
    }

    const result = results[0];
    const blockHeight = height ?? 0;

    return new ExecutionInfo(
      result.blockHash,
      blockHeight,
      ExecutionResult.fromV1(result.result)
    );
  }
}

/**
 * Represents execution information for a deploy, including the block hash, height, and execution result.
 */
@jsonObject
export class DeployExecutionInfo {
  /**
   * The block hash where the deploy was executed.
   */
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public blockHash: Hash;

  /**
   * The block height at the time the deploy was executed.
   */
  @jsonMember({ name: 'block_height', constructor: Number })
  public blockHeight: number;

  /**
   * The execution result associated with the deploy.
   */
  @jsonMember({
    name: 'execution_result',
    constructor: ExecutionResult,
    deserializer: json => {
      if (!json) return;
      return ExecutionResult.fromJSON(json);
    }
  })
  public executionResult: ExecutionResult;

  /**
   * Creates a `DeployExecutionInfo` instance from version 1 data.
   *
   * @param results The results of the deploy execution.
   * @param height The block height, if available.
   * @returns The `DeployExecutionInfo` instance created from version 1 data.
   */
  public static fromV1(
    results: DeployExecutionResult[],
    height?: number
  ): DeployExecutionInfo {
    if (results.length === 0) {
      return new DeployExecutionInfo();
    }

    const result = results[0];
    const blockHeight = height ?? 0;

    const deployExecutionInfo = new DeployExecutionInfo();
    deployExecutionInfo.blockHash = result.blockHash;
    deployExecutionInfo.blockHeight = blockHeight;
    deployExecutionInfo.executionResult = ExecutionResult.fromV1(result.result);

    return deployExecutionInfo;
  }
}
