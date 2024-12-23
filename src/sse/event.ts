import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';

import {
  Effect,
  ExecutionResult,
  ExecutionResultV1,
  Deploy,
  Transaction,
  TransactionHash,
  TransactionWrapper,
  Block,
  BlockV1,
  BlockWrapper,
  InitiatorAddr,
  Message,
  HexBytes,
  Timestamp,
  PublicKey,
  Hash,
  Transform
} from '../types';

export enum EventType {
  APIVersionEventType = 1,
  BlockAddedEventType,
  DeployProcessedEventType,
  DeployAcceptedEventType,
  DeployExpiredEventType,
  TransactionProcessedEventType,
  TransactionAcceptedEventType,
  TransactionExpiredEventType,
  EventIDEventType,
  FinalitySignatureType,
  StepEventType,
  FaultEventType,
  ShutdownType
}

export const AllEventsNames: { [key in EventType]: string } = {
  [EventType.APIVersionEventType]: 'ApiVersion',
  [EventType.BlockAddedEventType]: 'BlockAdded',
  [EventType.DeployProcessedEventType]: 'DeployProcessed',
  [EventType.DeployAcceptedEventType]: 'DeployAccepted',
  [EventType.DeployExpiredEventType]: 'DeployExpired',
  [EventType.TransactionProcessedEventType]: 'TransactionProcessed',
  [EventType.TransactionAcceptedEventType]: 'TransactionAccepted',
  [EventType.TransactionExpiredEventType]: 'TransactionExpired',
  [EventType.EventIDEventType]: 'EventID',
  [EventType.FinalitySignatureType]: 'FinalitySignature',
  [EventType.StepEventType]: 'Step',
  [EventType.FaultEventType]: 'Fault',
  [EventType.ShutdownType]: 'Shutdown'
};

export type EventData = string;

@jsonObject
export class RawEvent {
  @jsonMember({ name: 'EventType', constructor: Number })
  eventType: EventType;

  @jsonMember({ name: 'Data', constructor: String })
  data: EventData;

  @jsonMember({ name: 'EventID', constructor: Number })
  eventID: number;

  constructor(eventType: EventType, data: EventData, eventID: number) {
    this.eventType = eventType;
    this.data = data;
    this.eventID = eventID;
  }

  private parseEvent<T>(
    type: new (params: any) => T,
    parser?: (data: any) => T | Error
  ): T {
    const serializer = new TypedJSON(type);
    const parsed = parser ? parser(this.data) : serializer.parse(this.data);
    if (!parsed) throw new Error('Error parsing event data');
    return parsed;
  }

  parseAsAPIVersionEvent(): APIVersionEvent {
    return this.parseEvent(APIVersionEvent);
  }

  parseAsDeployProcessedEvent(): DeployProcessedEvent {
    return this.parseEvent(DeployProcessedEvent);
  }

  parseAsBlockAddedEvent(): BlockAddedEvent {
    return this.parseEvent(BlockAddedEvent, BlockAddedEvent.fromJSON);
  }

  parseAsDeployAcceptedEvent(): DeployAcceptedEvent {
    return this.parseEvent(DeployAcceptedEvent);
  }

  parseAsFinalitySignatureEvent(): FinalitySignatureEvent {
    return this.parseEvent(
      FinalitySignatureEvent,
      FinalitySignatureEvent.deserialize
    );
  }

  parseAsTransactionExpiredEvent(): TransactionExpiredEvent {
    return this.parseEvent(
      TransactionExpiredEvent,
      TransactionExpiredEvent.deserialize
    );
  }

  parseAsTransactionProcessedEvent(): TransactionProcessedEvent {
    return this.parseEvent(
      TransactionProcessedEvent,
      TransactionProcessedEvent.fromJSON
    );
  }

  parseAsTransactionAcceptedEvent(): TransactionAcceptedEvent {
    return this.parseEvent(
      TransactionAcceptedEvent,
      TransactionAcceptedEvent.fromJSON
    );
  }

  parseAsFaultEvent(): FaultEvent {
    return this.parseEvent(FaultEvent);
  }

  parseAsStepEvent(): StepEvent {
    return this.parseEvent(StepEvent);
  }
}

@jsonObject
export class APIVersionEvent {
  @jsonMember(String, { name: 'ApiVersion' })
  apiVersion: string;

  constructor(apiVersion: string) {
    this.apiVersion = apiVersion;
  }
}

@jsonObject
export class BlockAdded {
  @jsonMember({ name: 'block_hash', constructor: String })
  blockHash: string;

  @jsonMember({ name: 'block', constructor: Block })
  block: Block;

  constructor(blockHash: string, block: Block) {
    this.blockHash = blockHash;
    this.block = block;
  }
}

@jsonObject
export class BlockAddedEvent {
  @jsonMember({ name: 'BlockAdded', constructor: BlockAdded })
  BlockAdded: BlockAdded;

  constructor(blockAdded: BlockAdded) {
    this.BlockAdded = blockAdded;
  }

  static fromJSON(data: any): BlockAddedEvent {
    const parsedData = JSON.parse(data);

    if (!parsedData) {
      throw new Error('Parse JSON on null or undefined data');
    }

    if (parsedData.BlockAdded && parsedData.BlockAdded.block) {
      const { blockHash } = parsedData.BlockAdded;
      const blockWrapper = parsedData.BlockAdded.block;

      if (blockWrapper.BlockV1 || blockWrapper.BlockV2) {
        return new BlockAddedEvent({
          blockHash: blockHash,
          block: Block.newBlockFromBlockWrapper(blockWrapper, [])
        });
      }
    }

    if (parsedData.BlockAdded) {
      const v1Event = parsedData;

      return new BlockAddedEvent({
        blockHash: v1Event.BlockAdded.blockHash,
        block: Block.newBlockFromBlockV1(v1Event.BlockAdded.block)
      });
    }

    throw new Error('Invalid JSON structure for BlockAddedEvent');
  }
}

@jsonObject
export class BlockAddedV1 {
  @jsonMember({ name: 'block_hash', constructor: String })
  blockHash: string;

  @jsonMember({ name: 'block', constructor: BlockV1 })
  block: BlockV1;

  constructor(blockHash: string, block: BlockV1) {
    this.blockHash = blockHash;
    this.block = block;
  }
}

@jsonObject
export class BlockAddedEventV1 {
  @jsonMember({ name: 'BlockAdded', constructor: BlockAddedV1 })
  BlockAdded: BlockAddedV1;

  constructor(blockAdded: BlockAddedV1) {
    this.BlockAdded = blockAdded;
  }
}

@jsonObject
export class BlockAddedWrapper {
  @jsonMember({ name: 'block_hash', constructor: String })
  blockHash: string;

  @jsonMember({ name: 'block', constructor: BlockWrapper })
  block: BlockWrapper;

  constructor(blockHash: string, block: BlockWrapper) {
    this.blockHash = blockHash;
    this.block = block;
  }
}

@jsonObject
export class BlockAddedEventWrapper {
  @jsonMember({ name: 'BlockAdded', constructor: BlockAddedWrapper })
  BlockAdded: BlockAddedWrapper;

  constructor(blockAdded: BlockAddedWrapper) {
    this.BlockAdded = blockAdded;
  }
}

@jsonObject
export class DeployProcessedPayload {
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  deployHash: Hash;

  @jsonMember({
    name: 'account',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  account: PublicKey;

  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => {
      if (!json) return;
      return Timestamp.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  timestamp: Timestamp;

  @jsonMember({ name: 'ttl', constructor: String })
  ttl: string;

  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ name: 'execution_result', constructor: ExecutionResultV1 })
  executionResult: ExecutionResultV1;
}

@jsonObject
export class DeployProcessedEvent {
  @jsonMember({
    name: 'DeployProcessed',
    constructor: DeployProcessedPayload
  })
  deployProcessed: DeployProcessedPayload;
}

@jsonObject
export class DeployAcceptedEvent {
  @jsonMember({ name: 'DeployAccepted', constructor: Deploy })
  deployAccepted: Deploy;
}

@jsonObject
export class DeployExpiredPayload {
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  deployHash: Hash;
}

@jsonObject
export class DeployExpiredEvent {
  @jsonMember({
    constructor: DeployExpiredPayload,
    name: 'DeployExpired'
  })
  deployExpired: DeployExpiredPayload;
}

@jsonObject
export class TransactionAcceptedPayload {
  @jsonMember({ name: 'transaction', constructor: Transaction })
  transaction: Transaction;
}

@jsonObject
export class TransactionAcceptedEvent {
  @jsonMember({
    constructor: TransactionAcceptedPayload,
    name: 'TransactionAccepted'
  })
  transactionAcceptedPayload: TransactionAcceptedPayload;

  public static fromJSON(data: unknown): TransactionAcceptedEvent | Error {
    try {
      const transactionEvent = TypedJSON.parse(data, TransactionAcceptedEvent);
      if (!transactionEvent) throw new Error('TransactionAcceptedEvent is nil');

      const wrapper = TypedJSON.parse(data, TransactionWrapper);

      if (wrapper?.deploy) {
        transactionEvent.transactionAcceptedPayload = {
          transaction: Deploy.newTransactionFromDeploy(wrapper.deploy)
        };
        return transactionEvent;
      }

      if (wrapper?.transactionV1) {
        transactionEvent.transactionAcceptedPayload = {
          transaction: Transaction.fromTransactionV1(wrapper.transactionV1)
        };
        return transactionEvent;
      }

      const deployEvent = TypedJSON.parse(data, DeployAcceptedEvent);
      if (deployEvent?.deployAccepted) {
        transactionEvent.transactionAcceptedPayload = {
          transaction: Deploy.newTransactionFromDeploy(
            deployEvent.deployAccepted
          )
        };
        return transactionEvent;
      }

      throw new Error('Failed to match any transaction structure');
    } catch (error) {
      return new Error(
        `Error deserializing TransactionAcceptedEvent: ${error}`
      );
    }
  }
}

@jsonObject
export class TransactionExpiredPayload {
  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  transactionHash: TransactionHash;
}

@jsonObject
export class TransactionExpiredEvent {
  @jsonMember({
    name: 'TransactionExpired',
    constructor: TransactionExpiredPayload
  })
  transactionExpiredPayload: TransactionExpiredPayload;

  public static deserialize(data: any): TransactionExpiredEvent | Error {
    try {
      const transactionEvent = TypedJSON.parse(data, TransactionExpiredEvent);
      if (!transactionEvent) throw new Error('TransactionExpiredEvent is nil');

      const payload = transactionEvent.transactionExpiredPayload;

      if (
        payload.transactionHash?.transactionV1 ||
        payload.transactionHash?.deploy
      ) {
        return transactionEvent;
      }

      const deployEvent = TypedJSON.parse(data, DeployExpiredEvent);
      if (deployEvent?.deployExpired) {
        transactionEvent.transactionExpiredPayload = {
          transactionHash: new TransactionHash(
            deployEvent.deployExpired.deployHash
          )
        };
        return transactionEvent;
      }

      throw new Error('Failed to match any transaction structure');
    } catch (error) {
      return new Error(`Error deserializing TransactionExpiredEvent: ${error}`);
    }
  }
}

@jsonObject
export class TransactionProcessedPayload {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  transactionHash: TransactionHash;

  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  initiatorAddr: InitiatorAddr;

  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => {
      if (!json) return;
      return Timestamp.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  timestamp: Timestamp;

  @jsonMember({ name: 'ttl', constructor: String })
  ttl: string;

  @jsonMember({ name: 'execution_result', constructor: ExecutionResult })
  executionResult: ExecutionResult;

  @jsonArrayMember(Message, { name: 'messages' })
  messages: Message[];
}

@jsonObject
export class TransactionProcessedEvent {
  @jsonMember({
    name: 'TransactionProcessed',
    constructor: TransactionProcessedPayload
  })
  transactionProcessedPayload: TransactionProcessedPayload;

  public static fromJSON(data: any): TransactionProcessedEvent | Error {
    try {
      const transactionEvent = TypedJSON.parse(data, TransactionProcessedEvent);
      if (!transactionEvent)
        throw new Error('TransactionProcessedEvent is nil');

      const payload = transactionEvent.transactionProcessedPayload;

      if (
        payload.transactionHash?.transactionV1 ||
        payload.transactionHash?.deploy
      ) {
        return transactionEvent;
      }

      const deployEvent = TypedJSON.parse(data, DeployProcessedEvent);
      if (deployEvent?.deployProcessed) {
        transactionEvent.transactionProcessedPayload = {
          blockHash: deployEvent.deployProcessed.blockHash,
          transactionHash: new TransactionHash(
            deployEvent.deployProcessed.deployHash
          ),
          initiatorAddr: new InitiatorAddr(deployEvent.deployProcessed.account),
          timestamp: deployEvent.deployProcessed.timestamp,
          ttl: deployEvent.deployProcessed.ttl,
          executionResult: ExecutionResult.fromV1(
            deployEvent.deployProcessed.executionResult
          ),
          messages: []
        };
        return transactionEvent;
      }

      throw new Error('Failed to match any transaction structure');
    } catch (error) {
      return new Error(
        `Error deserializing TransactionProcessedEvent: ${error}`
      );
    }
  }
}

@jsonObject
export class FinalitySignatureV1 {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;
}

@jsonObject
export class FinalitySignatureV2 {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ isRequired: false, name: 'block_height', constructor: Number })
  blockHeight?: number;

  @jsonMember({
    isRequired: false,
    name: 'chain_name_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  chainNameHash?: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;
}

@jsonObject
export class FinalitySignatureWrapper {
  @jsonMember({
    isRequired: false,
    name: 'V1',
    constructor: FinalitySignatureV1
  })
  v1?: FinalitySignatureV1;

  @jsonMember({
    isRequired: false,
    name: 'V2',
    constructor: FinalitySignatureV2
  })
  v2?: FinalitySignatureV2;
}

@jsonObject
export class FinalitySignature {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({
    constructor: Number,
    isRequired: false,
    name: 'block_height'
  })
  blockHeight?: number;

  @jsonMember({
    isRequired: false,
    name: 'chain_name_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  chainNameHash?: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  @jsonMember(FinalitySignatureV1, {
    isRequired: false
  })
  originFinalitySignatureV1?: FinalitySignatureV1;
}

@jsonObject
export class FinalitySignatureWrapperEvent {
  @jsonMember({
    isRequired: false,
    name: 'FinalitySignature',
    constructor: FinalitySignatureV1
  })
  finalitySignatureV1?: FinalitySignatureV1;

  @jsonMember({
    isRequired: false,
    name: 'FinalitySignature',
    constructor: FinalitySignatureV2
  })
  finalitySignatureV2?: FinalitySignatureV2;
}

@jsonObject
export class FinalitySignatureEvent {
  @jsonMember({ name: 'FinalitySignature', constructor: FinalitySignature })
  finalitySignature: FinalitySignature;

  public static deserialize(data: any): FinalitySignatureEvent | Error {
    try {
      const wrapped = TypedJSON.parse(data, FinalitySignatureWrapper);
      if (!wrapped) throw new Error('FinalitySignatureWrapper is nil');

      let finalitySignature: FinalitySignature;
      if (wrapped.v1) {
        finalitySignature = {
          blockHash: wrapped.v1.blockHash,
          eraID: wrapped.v1.eraID,
          signature: wrapped.v1.signature,
          publicKey: wrapped.v1.publicKey,
          originFinalitySignatureV1: wrapped.v1
        };
      } else if (wrapped.v2) {
        finalitySignature = {
          blockHash: wrapped.v2.blockHash,
          blockHeight: wrapped.v2.blockHeight,
          chainNameHash: wrapped.v2.chainNameHash,
          eraID: wrapped.v2.eraID,
          signature: wrapped.v2.signature,
          publicKey: wrapped.v2.publicKey
        };
      } else {
        const v1Event = TypedJSON.parse(data, FinalitySignatureV1);
        if (!v1Event) throw new Error('Failed to parse FinalitySignatureV1');

        finalitySignature = {
          blockHash: v1Event.blockHash,
          eraID: v1Event.eraID,
          signature: v1Event.signature,
          publicKey: v1Event.publicKey,
          originFinalitySignatureV1: v1Event
        };
      }

      return new FinalitySignatureEvent(finalitySignature);
    } catch (error) {
      return new Error(`Error deserializing FinalitySignatureEvent: ${error}`);
    }
  }

  constructor(finalitySignature: FinalitySignature) {
    this.finalitySignature = finalitySignature;
  }
}

@jsonObject
export class FaultPayload {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  timestamp: Timestamp;
}

@jsonObject
export class FaultEvent {
  @jsonMember({ name: 'Fault', constructor: FaultPayload })
  fault: FaultPayload;
}

@jsonObject
export class StepPayload {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'execution_effect', constructor: Effect })
  executionEffect: Effect;

  @jsonArrayMember(() => Transform, { name: 'execution_effects' })
  executionEffects: Transform[];
}

@jsonObject
export class StepEvent {
  @jsonMember({ name: 'step', constructor: StepPayload })
  step: StepPayload;
}
