import {
  AnyT,
  jsonArrayMember,
  jsonMember,
  jsonObject,
  TypedJSON
} from 'typedjson';
import { IDValue } from './id_value';
import { RpcError } from './error';
import {
  Account,
  AddressableEntity,
  AuctionState,
  AuctionStateV1,
  AuctionStateV2,
  Block,
  BlockHeader,
  BlockHeaderV1,
  BlockV1,
  BlockWithSignatures,
  CLValueUInt512,
  Deploy,
  DeployExecutionInfo,
  DeployExecutionResult,
  EntryPointValue,
  EraSummary,
  ExecutionInfo,
  ExecutionResultV1,
  Hash,
  InitiatorAddr,
  MinimalBlockInfo,
  NamedKey,
  PublicKey,
  SpeculativeExecutionResult,
  StoredValue,
  Timestamp,
  Transaction,
  TransactionHash,
  TransactionWrapper,
  Transfer
} from '../types';

@jsonObject
export class RpcResponse {
  @jsonMember({ name: 'jsonrpc', constructor: String })
  version: string;

  @jsonMember({
    constructor: IDValue,
    name: 'id',
    deserializer: json => {
      if (!json) return;
      return IDValue.fromJSON(json);
    }
  })
  id?: IDValue;

  @jsonMember({ name: 'result', constructor: AnyT })
  result: any;

  @jsonMember({ name: 'error', constructor: RpcError, preserveNull: true })
  error?: RpcError;
}

@jsonObject
export class StateGetAuctionInfoResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'auction_state', constructor: AuctionState })
  auctionState: AuctionState;

  rawJSON?: any;
}

@jsonObject
export class StateGetAuctionInfoV1Result {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'auction_state', constructor: AuctionStateV1 })
  auctionState: AuctionStateV1;

  rawJSON?: any;
}

@jsonObject
export class StateGetAuctionInfoV2Result {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'auction_state', constructor: AuctionStateV2 })
  auctionState: AuctionStateV2;

  rawJSON?: any;
}

@jsonObject
export class StateGetBalanceResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'balance_value',
    constructor: CLValueUInt512,
    deserializer: (json: string) => CLValueUInt512.fromJSON(json),
    serializer: (value: CLValueUInt512) => value.toJSON()
  })
  balanceValue: CLValueUInt512;

  public rawJSON: any;

  public toQueryBalanceResult() {
    const queryBalanceResult = new QueryBalanceResult();

    queryBalanceResult.apiVersion = this.apiVersion;
    queryBalanceResult.balance = this.balanceValue;

    return queryBalanceResult;
  }
}

@jsonObject
export class StateGetAccountInfo {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'account', constructor: Account })
  account: Account;

  public rawJSON: any;
}

@jsonObject
export class RpcAddressableEntity {
  @jsonMember({ name: 'entity', constructor: AddressableEntity })
  entity: AddressableEntity;

  @jsonArrayMember(NamedKey, { name: 'named_keys' })
  namedKeys: NamedKey[];

  @jsonArrayMember(EntryPointValue, { name: 'entry_points' })
  entryPoints?: EntryPointValue[];
}

@jsonObject
export class EntityOrAccount {
  @jsonMember({
    name: 'AddressableEntity',
    constructor: RpcAddressableEntity
  })
  addressableEntity?: RpcAddressableEntity;

  @jsonMember({
    name: 'LegacyAccount',
    constructor: Account
  })
  legacyAccount?: Account;
}

@jsonObject
export class StateGetEntityResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'entity', constructor: EntityOrAccount })
  entity: EntityOrAccount;

  @jsonMember({ name: 'merkle_proof', constructor: AnyT })
  merkleProof: any;

  public rawJSON: any;
}

@jsonObject
export class ChainGetBlockResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'block_with_signatures',
    constructor: BlockWithSignatures
  })
  blockWithSignatures?: BlockWithSignatures;

  @jsonMember({ name: 'block', constructor: BlockV1 })
  blockV1?: BlockV1;

  public rawJSON?: any;
}

@jsonObject
export class ChainGetBlockResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public apiVersion: string;

  @jsonMember({ constructor: Block })
  public block: Block;

  public rawJSON?: any;

  public static fromJSON(data: any): ChainGetBlockResult {
    const serializer = new TypedJSON(ChainGetBlockResult);
    const parsedResult = serializer.parse(data);

    if (!parsedResult) throw new Error('Failed to parse ChainGetBlockResult');

    parsedResult.rawJSON = data;

    return parsedResult;
  }

  public static newChainGetBlockResultFromV1Compatible(
    result: ChainGetBlockResultV1Compatible,
    rawJSON: any
  ): ChainGetBlockResult {
    const chainGetBlockResult = new ChainGetBlockResult();
    chainGetBlockResult.apiVersion = result.apiVersion;
    chainGetBlockResult.rawJSON = rawJSON;

    if (result.blockV1) {
      chainGetBlockResult.block = Block.newBlockFromBlockV1(result.blockV1);
    } else if (result.blockWithSignatures) {
      chainGetBlockResult.block = Block.newBlockFromBlockWrapper(
        result.blockWithSignatures.block,
        result.blockWithSignatures.proofs
      );
    } else {
      throw new Error('Incorrect RPC response structure');
    }

    return chainGetBlockResult;
  }
}

@jsonObject
export class ChainGetBlockTransfersResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public version: string;

  @jsonMember({ name: 'block_hash', constructor: String })
  public blockHash: string;

  @jsonArrayMember(Transfer, {
    name: 'transfers',
    deserializer: (json: any) => json.map((it: string) => Transfer.fromJSON(it))
  })
  public transfers: Transfer[];

  public rawJSON?: any;
}

@jsonObject
export class ChainGetEraSummaryResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public version: string;

  @jsonMember({ name: 'era_summary', constructor: EraSummary })
  public eraSummary: EraSummary;

  public rawJSON?: any;
}

@jsonObject
export class InfoGetDeployResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'deploy', constructor: Deploy })
  deploy: Deploy;

  @jsonMember({ name: 'execution_info', constructor: DeployExecutionInfo })
  executionInfo?: DeployExecutionInfo;

  // Legacy execution results V1
  @jsonArrayMember(DeployExecutionResult, {
    name: 'execution_results',
    preserveNull: true
  })
  executionResultsV1?: DeployExecutionResult[];

  rawJSON: any;

  /**
   * Converts the deployment result into a transaction result.
   * It prefers the newer executionInfo format if available,
   * otherwise falls back to legacy execution results.
   */
  toInfoGetTransactionResult(): InfoGetTransactionResult {
    let executionInfo: ExecutionInfo | undefined = undefined;

    if (this.executionInfo) {
      executionInfo = new ExecutionInfo(
        this.executionInfo.blockHash,
        this.executionInfo.blockHeight,
        this.executionInfo.executionResult
      );
    } else if (this?.executionResultsV1?.length) {
      executionInfo = ExecutionInfo.fromV1(this.executionResultsV1);
    }

    return new InfoGetTransactionResult(
      this.apiVersion,
      Deploy.newTransactionFromDeploy(this.deploy),
      executionInfo,
      this.rawJSON
    );
  }
}

@jsonObject
export class InfoGetTransactionResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    constructor: Transaction,
    deserializer: json => {
      if (!json) return;
      return Transaction.fromJSON(json);
    }
  })
  transaction: Transaction;

  @jsonMember({
    name: 'execution_info',
    constructor: ExecutionInfo,
    preserveNull: true
  })
  executionInfo?: ExecutionInfo;

  public rawJSON: any;

  constructor(
    apiVersion: string,
    transaction: Transaction,
    executionInfo?: ExecutionInfo,
    rawJSON = ''
  ) {
    this.apiVersion = apiVersion;
    this.transaction = transaction;
    this.executionInfo = executionInfo;
    this.rawJSON = rawJSON;
  }

  static fromJSON(json: any): InfoGetTransactionResult | null {
    const serializer = new TypedJSON(InfoGetTransactionResultV1Compatible);
    const temp = serializer.parse(json);

    if (temp) {
      return InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        temp,
        json
      );
    }

    const transactionResultSerializer = new TypedJSON(InfoGetTransactionResult);
    return transactionResultSerializer.parse(json) ?? null;
  }
}

@jsonObject
export class InfoGetDeployResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ constructor: Deploy })
  deploy: Deploy;

  @jsonArrayMember(DeployExecutionResult, { name: 'execution_results' })
  executionResults: DeployExecutionResult[];

  @jsonMember({
    name: 'block_hash',
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
  blockHash?: Hash;

  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight?: number;

  public rawJSON: any;

  public static fromJSON(
    json: any
  ): InfoGetDeployResultV1Compatible | undefined {
    const serializer = new TypedJSON(InfoGetDeployResultV1Compatible);
    return serializer.parse(json);
  }
}

@jsonObject
export class InfoGetTransactionResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ constructor: TransactionWrapper })
  transaction?: TransactionWrapper;

  @jsonMember({ constructor: Deploy })
  deploy?: Deploy;

  @jsonMember({ constructor: ExecutionInfo, name: 'execution_info' })
  executionInfo?: ExecutionInfo;

  @jsonArrayMember(DeployExecutionResult, { name: 'execution_results' })
  executionResults: DeployExecutionResult[] = [];

  @jsonMember({
    constructor: Hash,
    name: 'block_hash',
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  blockHash?: Hash;

  @jsonMember({ constructor: Number, name: 'block_height' })
  blockHeight?: number;

  rawJSON?: any;

  public static newInfoGetTransactionResultFromV1Compatible(
    parsedResult: InfoGetTransactionResultV1Compatible,
    rawJSON: any
  ): InfoGetTransactionResult {
    if (parsedResult.transaction) {
      if (parsedResult.transaction.transactionV1) {
        return new InfoGetTransactionResult(
          parsedResult.apiVersion,
          Transaction.fromTransactionV1(parsedResult.transaction.transactionV1),
          parsedResult.executionInfo,
          rawJSON
        );
      }

      if (parsedResult.transaction.deploy) {
        const transaction = Deploy.newTransactionFromDeploy(
          parsedResult.transaction.deploy
        );
        const info = new InfoGetTransactionResult(
          parsedResult.apiVersion,
          transaction,
          parsedResult.executionInfo,
          rawJSON
        );

        if (parsedResult.executionResults.length > 0) {
          const executionInfo = ExecutionInfo.fromV1(
            parsedResult.executionResults,
            parsedResult.blockHeight
          );
          executionInfo.executionResult.initiator = new InitiatorAddr(
            parsedResult.deploy!.header.account
          );
          info.executionInfo = executionInfo;
        }
        return info;
      }
    }

    if (parsedResult.deploy) {
      const transaction = Deploy.newTransactionFromDeploy(parsedResult.deploy);
      const info = new InfoGetTransactionResult(
        parsedResult.apiVersion,
        transaction,
        parsedResult.executionInfo,
        rawJSON
      );

      if (parsedResult.executionResults.length > 0) {
        const executionInfo = ExecutionInfo.fromV1(
          parsedResult.executionResults,
          parsedResult.blockHeight
        );
        executionInfo.executionResult.initiator = new InitiatorAddr(
          parsedResult.deploy.header.account
        );
        info.executionInfo = executionInfo;
      }
      return info;
    }
    throw new Error('Incorrect RPC response structure');
  }

  public static fromJSON(
    json: any
  ): InfoGetTransactionResultV1Compatible | undefined {
    const serializer = new TypedJSON(InfoGetTransactionResultV1Compatible);
    return serializer.parse(json);
  }
}

@jsonObject
export class ChainGetEraInfoResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'era_summary', constructor: EraSummary })
  eraSummary: EraSummary;

  public rawJSON: any;
}

@jsonObject
export class StateGetItemResult {
  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON: any;
}

@jsonObject
export class StateGetDictionaryResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'dictionary_key', constructor: String })
  dictionaryKey: string;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON: any;
}

@jsonObject
export class QueryGlobalStateResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'block_header', constructor: BlockHeader })
  blockHeader?: BlockHeader;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON?: any;
}

@jsonObject
export class InfoGetPeerResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonArrayMember(() => NodePeer, { name: 'peers' })
  peers: NodePeer[];

  rawJSON?: any;
}

@jsonObject
export class NodePeer {
  @jsonMember({ name: 'node_id', constructor: String })
  nodeId: string;

  @jsonMember({ name: 'address', constructor: String })
  address: string;
}

@jsonObject
export class ChainGetStateRootHashResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({
    name: 'state_root_hash',
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
  stateRootHash: Hash;

  rawJSON?: any;
}

export enum ValidatorState {
  Added = 'Added',
  Removed = 'Removed',
  Banned = 'Banned',
  CannotPropose = 'CannotPropose',
  SeenAsFaulty = 'SeenAsFaulty'
}

@jsonObject
export class StatusChanges {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'validator_change', constructor: String })
  validatorState: ValidatorState;

  rawJSON: any;
}

@jsonObject
export class ValidatorChanges {
  @jsonMember({
    name: 'public_key',
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
  publicKey: PublicKey;

  @jsonArrayMember(StatusChanges, { name: 'status_changes' })
  statusChanges: StatusChanges[];

  rawJSON: any;
}

@jsonObject
export class InfoGetValidatorChangesResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonArrayMember(ValidatorChanges, { name: 'changes' })
  changes: ValidatorChanges[];

  rawJSON: any;
}

@jsonObject
export class NodeNextUpgrade {
  @jsonMember({ name: 'activation_point', constructor: Number })
  activationPoint: number;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;
}

@jsonObject
export class BlockSyncStatus {
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    },
    preserveNull: true
  })
  blockHash?: Hash;

  @jsonMember({ name: 'block_height', constructor: Number, preserveNull: true })
  blockHeight?: number;

  @jsonMember({ name: 'acquisition_state', constructor: String })
  acquisitionState?: string;
}

@jsonObject
export class BlockSynchronizerStatus {
  @jsonMember({ name: 'historical', constructor: BlockSyncStatus })
  historical?: BlockSyncStatus;

  @jsonMember({ name: 'forward', constructor: BlockSyncStatus })
  forward?: BlockSyncStatus;
}

@jsonObject
export class InfoGetStatusResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  @jsonMember({ name: 'build_version', constructor: String })
  buildVersion: string;

  @jsonMember({ name: 'chainspec_name', constructor: String })
  chainSpecName: string;

  @jsonMember({ name: 'last_added_block_info', constructor: MinimalBlockInfo })
  lastAddedBlockInfo: MinimalBlockInfo;

  @jsonMember({ name: 'next_upgrade', constructor: NodeNextUpgrade })
  nextUpgrade?: NodeNextUpgrade;

  @jsonMember({ name: 'our_public_signing_key', constructor: String })
  ourPublicSigningKey: string;

  @jsonArrayMember(NodePeer, { name: 'peers' })
  peers: NodePeer[];

  @jsonMember({ name: 'round_length', constructor: String })
  roundLength: string;

  @jsonMember({ name: 'starting_state_root_hash', constructor: String })
  startingStateRootHash: string;

  @jsonMember({ name: 'uptime', constructor: String })
  uptime: string;

  @jsonMember({ name: 'reactor_state', constructor: String })
  reactorState: string;

  @jsonMember({
    name: 'last_progress',
    constructor: Timestamp,
    deserializer: json => {
      if (!json) return;
      return Timestamp.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  lastProgress: Timestamp;

  @jsonMember({
    name: 'latest_switch_block_hash',
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
  latestSwitchBlockHash: Hash;

  @jsonMember({
    name: 'available_block_range',
    constructor: () => ({
      low: jsonMember({ name: 'low', constructor: Number }),
      high: jsonMember({ name: 'high', constructor: Number })
    })
  })
  availableBlockRange: { low: number; high: number };

  @jsonMember({
    name: 'block_sync',
    constructor: BlockSynchronizerStatus
  })
  blockSync: BlockSynchronizerStatus;

  rawJSON: any;
}

@jsonObject
export class PutDeployResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'deploy_hash',
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
  deployHash: Hash;

  rawJSON?: any;
}

@jsonObject
export class PutTransactionResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  transactionHash: TransactionHash;

  rawJSON?: any;
}

@jsonObject
export class SpeculativeExecResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'block_hash',
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
  blockHash?: Hash;

  /**
   * Execution result for Casper v2.0 (speculative execution format).
   */
  executionResult?: SpeculativeExecutionResult;

  /**
   * Execution result for Casper v1.5.x (legacy execution format).
   */
  executionResultV1?: ExecutionResultV1;

  /**
   * Stores the raw json object if version could not be parsed.
   */
  rawJSON?: any;

  /**
   * True if the parsed execution result matches Casper v1.5.x format.
   */
  get isV1(): boolean {
    return !!this.executionResultV1;
  }

  /**
   * True if the parsed execution result matches Casper v2.0 format.
   */
  get isV2(): boolean {
    return !!this.executionResult;
  }

  /**
   * Parses and returns a version-aware SpeculativeExecResult from raw JSON.
   * Supports both Casper v1.5.x and v2.0 formats.
   */
  static fromJSON(json: any): SpeculativeExecResult {
    const result = new SpeculativeExecResult();

    result.apiVersion = json?.version;
    const execJson = json?.result?.execution_result;
    result.rawJSON = json;

    result.blockHash = execJson?.block_hash
      ? Hash.fromHex(execJson.block_hash)
      : undefined;

    if (
      execJson &&
      (execJson.block_hash ||
        execJson.limit !== undefined ||
        execJson.consumed !== undefined)
    ) {
      // Casper v2.0
      result.executionResult = new TypedJSON(SpeculativeExecutionResult).parse(
        execJson
      );
    } else if (execJson && ('Success' in execJson || 'Failure' in execJson)) {
      // Casper v1.5.x
      result.executionResultV1 = new TypedJSON(ExecutionResultV1).parse(
        execJson
      );
    } else {
      console.warn('Unknown execution_result format:', execJson);
    }

    return result;
  }
}

@jsonObject
export class QueryBalanceResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'balance',
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
  balance: CLValueUInt512;

  rawJSON?: any;
}

@jsonObject
export class QueryBalanceDetailsResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'total_balance',
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
  totalBalance: CLValueUInt512;

  @jsonMember({
    name: 'available_balance',
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
  availableBalance: CLValueUInt512;

  @jsonMember({ name: 'total_balance_proof', constructor: String })
  totalBalanceProof: string;

  @jsonArrayMember(() => BalanceHoldWithProof, { name: 'holds' })
  holds: BalanceHoldWithProof[];

  rawJSON?: any;
}

@jsonObject
export class InfoGetRewardResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'reward_amount',
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
  rewardAmount: CLValueUInt512;

  @jsonMember({
    name: 'switch_block_hash',
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
  switchBlockHash: Hash;

  rawJSON?: any;
}

@jsonObject
export class BalanceHoldWithProof {
  @jsonMember({
    name: 'amount',
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
  amount: CLValueUInt512;

  @jsonMember({ name: 'proof', constructor: String })
  proof: string;
}

@jsonObject
class ChainspecBytes {
  @jsonMember({ name: 'chainspec_bytes', constructor: String })
  chainspecBytes?: string;

  @jsonMember({ name: 'maybe_genesis_accounts_bytes', constructor: String })
  maybeGenesisAccountsBytes?: string;

  @jsonMember({ name: 'maybe_global_state_bytes', constructor: String })
  maybeGlobalStateBytes?: string;
}

@jsonObject
export class InfoGetChainspecResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'chainspec_bytes', constructor: ChainspecBytes })
  chainspecBytes: ChainspecBytes;

  rawJSON?: any;
}

@jsonObject
export class QueryGlobalStateResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'block_header', constructor: BlockHeaderV1 })
  blockHeader?: BlockHeaderV1;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;
}
