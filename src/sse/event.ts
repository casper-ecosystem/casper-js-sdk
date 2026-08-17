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

export enum EventName {
  APIVersionEventType = 'ApiVersion',
  BlockAddedEventType = 'BlockAdded',
  DeployProcessedEventType = 'DeployProcessed',
  DeployAcceptedEventType = 'DeployAccepted',
  DeployExpiredEventType = 'DeployExpired',
  TransactionProcessedEventType = 'TransactionProcessed',
  TransactionAcceptedEventType = 'TransactionAccepted',
  TransactionExpiredEventType = 'TransactionExpired',
  EventIDEventType = 'EventID',
  FinalitySignatureType = 'FinalitySignature',
  StepEventType = 'Step',
  FaultEventType = 'Fault',
  ShutdownType = 'Shutdown'
}

@jsonObject
export class RawEvent {
  @jsonMember({ name: 'type', constructor: String })
  eventType: string;

  @jsonMember({ name: 'data', constructor: String })
  data: string;

  @jsonMember({ name: 'lastEventId', constructor: String })
  lastEventId: string;

  constructor(eventType: string, data: string, lastEventId: string) {
    this.eventType = eventType;
    this.data = data;
    this.lastEventId = lastEventId;
  }

  private parseEvent<T>(
    type: new (params: any) => T,
    parser?: (data: any) => T
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
    return this.parseEvent(BlockAddedEvent, data =>
      BlockAddedEvent.fromJSON(data)
    );
  }

  parseAsDeployAcceptedEvent(): DeployAcceptedEvent {
    return this.parseEvent(DeployAcceptedEvent);
  }

  parseAsFinalitySignatureEvent(): FinalitySignatureEvent {
    return this.parseEvent(FinalitySignatureEvent, data =>
      FinalitySignatureEvent.fromJSON(data)
    );
  }

  parseAsTransactionExpiredEvent(): TransactionExpiredEvent {
    return this.parseEvent(TransactionExpiredEvent, data =>
      TransactionExpiredEvent.fromJSON(data)
    );
  }

  parseAsTransactionProcessedEvent(): TransactionProcessedEvent {
    return this.parseEvent(TransactionProcessedEvent, data =>
      TransactionProcessedEvent.fromJSON(data)
    );
  }

  parseAsTransactionAcceptedEvent(): TransactionAcceptedEvent {
    return this.parseEvent(TransactionAcceptedEvent, data =>
      TransactionAcceptedEvent.fromJSON(data)
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
    if (!data) {
      throw new Error('Parse JSON on null or undefined data');
    }

    const parsedData = JSON.parse(data);

    if (parsedData.BlockAdded && parsedData.BlockAdded.block) {
      const serializer = new TypedJSON(BlockAddedWrapper);
      const blockWrapper = serializer.parse(parsedData.BlockAdded);

      if (blockWrapper?.block.blockV1 || blockWrapper?.block.blockV2) {
        return new BlockAddedEvent({
          blockHash: blockWrapper.blockHash,
          block: Block.newBlockFromBlockWrapper(blockWrapper.block, [])
        });
      }
    }

    const v1EventSerializer = new TypedJSON(BlockAddedV1);
    const parsedV1Event = v1EventSerializer.parse(parsedData.BlockAdded);

    if (parsedV1Event) {
      return new BlockAddedEvent({
        blockHash: parsedV1Event.blockHash,
        block: Block.newBlockFromBlockV1(parsedV1Event.block)
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
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  deployHash: Hash;

  @jsonMember({
    name: 'account',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
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
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
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
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
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
  @jsonMember({
    name: 'transaction',
    constructor: Transaction,
    deserializer: json => {
      if (!json) return;
      return Transaction.fromJSON(json);
    }
  })
  transaction: Transaction;
}

@jsonObject
export class TransactionAcceptedEvent {
  @jsonMember({
    constructor: TransactionAcceptedPayload,
    name: 'TransactionAccepted'
  })
  transactionAcceptedPayload: TransactionAcceptedPayload;

  public static fromJSON(data: any): TransactionAcceptedEvent {
    if (!data || data.TransactionAccepted) {
      throw new Error(
        'Parse JSON on null or undefined data for TransactionAcceptedEvent'
      );
    }

    try {
      const parsed = JSON.parse(data);
      const transactionEvent = new TransactionAcceptedEvent();

      const wrapper = TypedJSON.parse(
        parsed.TransactionAccepted,
        TransactionWrapper
      );

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

      const deployEvent = TypedJSON.parse(
        parsed.TransactionAccepted,
        DeployAcceptedEvent
      );
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
      throw new Error(
        `Error deserializing TransactionAcceptedEvent: ${error}`,
        {
          cause: error
        }
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

  public static fromJSON(data: any): TransactionExpiredEvent {
    if (!data) {
      throw new Error(
        'Parse JSON on null or undefined data for TransactionExpiredEvent'
      );
    }

    try {
      const parsedData = JSON.parse(data);

      const transactionEvent = new TransactionExpiredEvent();
      const transactionExpiredPayload = TypedJSON.parse(
        parsedData.TransactionExpired,
        TransactionExpiredPayload
      );
      if (!transactionExpiredPayload)
        throw new Error('transactionExpiredPayload is nil');

      if (transactionExpiredPayload) {
        transactionEvent.transactionExpiredPayload = transactionExpiredPayload;
      }

      const payload = transactionEvent?.transactionExpiredPayload;

      if (
        payload?.transactionHash?.transactionV1 ||
        payload?.transactionHash?.deploy
      ) {
        return transactionEvent;
      }

      const deployEvent = TypedJSON.parse(
        parsedData.TransactionExpired,
        DeployExpiredEvent
      );
      if (deployEvent?.deployExpired) {
        transactionEvent.transactionExpiredPayload = {
          transactionHash: TransactionHash.fromDeployHash(
            deployEvent.deployExpired.deployHash
          )
        };
        return transactionEvent;
      }

      throw new Error('Failed to match any transaction structure');
    } catch (error) {
      throw new Error(`Error deserializing TransactionExpiredEvent: ${error}`, {
        cause: error
      });
    }
  }
}

@jsonObject
export class TransactionProcessedPayload {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  transactionHash: TransactionHash;

  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => {
      if (!json) return;
      return InitiatorAddr.fromJSON(json);
    },
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

  @jsonMember({
    name: 'execution_result',
    constructor: ExecutionResult,
    deserializer: json => {
      if (!json) return;
      return ExecutionResult.fromJSON(json);
    }
  })
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

  public static fromJSON(data: any): TransactionProcessedEvent {
    if (!data || data.TransactionProcessed) {
      throw new Error(
        'Parse JSON on null or undefined data for TransactionExpiredEvent'
      );
    }

    try {
      const parsedData = JSON.parse(data);
      const transactionEvent = new TransactionProcessedEvent();
      const parsedTransactionPayload = TypedJSON.parse(
        parsedData.TransactionProcessed,
        TransactionProcessedPayload
      );

      if (parsedTransactionPayload) {
        transactionEvent.transactionProcessedPayload = parsedTransactionPayload;
      }

      const payload = transactionEvent.transactionProcessedPayload;

      if (
        payload.transactionHash?.transactionV1 ||
        payload.transactionHash?.deploy
      ) {
        return transactionEvent;
      }

      const deployEvent = TypedJSON.parse(
        parsedData.TransactionProcessed,
        DeployProcessedEvent
      );
      if (deployEvent?.deployProcessed) {
        transactionEvent.transactionProcessedPayload = {
          blockHash: deployEvent.deployProcessed.blockHash,
          transactionHash: TransactionHash.fromDeployHash(
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
      throw new Error(
        `Error deserializing TransactionProcessedEvent: ${error}`,
        { cause: error }
      );
    }
  }
}

@jsonObject
export class FinalitySignatureV1 {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  blockHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => {
      if (!json) return;
      return HexBytes.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

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
}

@jsonObject
export class FinalitySignatureV2 {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
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
    deserializer: json => {
      if (!json) return;
      return HexBytes.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

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
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
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
    deserializer: json => {
      if (!json) return;
      return HexBytes.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  signature: HexBytes;

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

  @jsonMember(FinalitySignatureV1, {
    isRequired: false
  })
  originFinalitySignatureV1?: FinalitySignatureV1;
}

@jsonObject
export class FinalitySignatureEvent {
  @jsonMember({ name: 'FinalitySignature', constructor: FinalitySignature })
  finalitySignature: FinalitySignature;

  public static fromJSON(data: any): FinalitySignatureEvent {
    if (!data || data.FinalitySignature) {
      throw new Error(
        'Parse JSON on null or undefined data for FinalitySignatureEvent'
      );
    }

    try {
      const parsed = JSON.parse(data);
      const wrapped = TypedJSON.parse(
        parsed.FinalitySignature,
        FinalitySignatureWrapper
      );
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
        const v1Event = TypedJSON.parse(
          parsed.FinalitySignature,
          FinalitySignatureV1
        );
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
      throw new Error(`Error deserializing FinalitySignatureEvent: ${error}`, {
        cause: error
      });
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
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

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
  // Capitalised on the wire, like every sibling event and the `EventName` enum.
  // A name that does not match parses to `undefined` without erroring.
  @jsonMember({ name: 'Step', constructor: StepPayload })
  step: StepPayload;
}
