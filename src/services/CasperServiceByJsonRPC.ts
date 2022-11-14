import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
import { TypedJSON, jsonMember, jsonObject } from 'typedjson';
import { DeployUtil, encodeBase16, CLPublicKey, CLValue } from '..';
import { deployToJson } from '../lib/DeployUtil';
import { StoredValue, Transfers } from '../lib/StoredValue';
import { BigNumber } from '@ethersproject/bignumber';
import ProviderTransport, {
  SafeEventEmitterProvider
} from './ProviderTransport';

/** RPC result interface */
interface RpcResult {
  api_version: string;
}

/** Node peer interface */
interface Peer {
  node_id: string;
  address: string;
}

/** A peers result interface defining `peers` as an array of `Peer`s */
export interface GetPeersResult extends RpcResult {
  peers: Peer[];
}

/** Interface for information on the most recently appended block on the network */
interface LastAddedBlockInfo {
  hash: string;
  timestamp: string;
  era_id: number;
  height: number;
  state_root_hash: string;
  creator: string;
}

/** Result interface for a get-status call */
export interface GetStatusResult extends GetPeersResult {
  last_added_block_info: LastAddedBlockInfo;
  build_version: string;
}

/** Result interface for a get-state-root-hash call */
export interface GetStateRootHashResult extends RpcResult {
  state_root_hash: string;
}

/** Result interface for an execution result body */
interface ExecutionResultBody {
  cost: number;
  error_message?: string | null;
  transfers: string[];
}

/** Result interface for an execution result */
export interface ExecutionResult {
  Success?: ExecutionResultBody;
  Failure?: ExecutionResultBody;
}

/** Result interface for a JSON execution result */
export interface JsonExecutionResult {
  block_hash: JsonBlockHash;
  result: ExecutionResult;
}

/** Result interface for a get-deploy call */
export interface GetDeployResult extends RpcResult {
  deploy: JsonDeploy;
  execution_results: JsonExecutionResult[];
}

/** Result interface for a get-block call */
export interface GetBlockResult extends RpcResult {
  block: JsonBlock | null;
}

type JsonBlockHash = string;
type JsonDeployHash = string;

/** JSON system transaction interface */
export interface JsonSystemTransaction {
  Slash?: string;
  Reward?: Record<string, number>;
}

/** JSON deploy header interface that acts as a schema for JSON deploy headers */
interface JsonDeployHeader {
  account: string;
  timestamp: number;
  ttl: number;
  gas_price: number;
  body_hash: string;
  dependencies: JsonDeployHash[];
  chain_name: string;
}

interface JsonBasicExecutionDeployItemInternal {
  args: Map<string, CLValue>;
}

interface JsonModuleBytes extends JsonBasicExecutionDeployItemInternal {
  module_bytes: string;
}

interface JsonStoredContract extends JsonBasicExecutionDeployItemInternal {
  entry_point: string;
}

interface JsonStoredContractByHash extends JsonStoredContract {
  hash: string;
}

interface JsonStoredContractByName extends JsonStoredContract {
  name: string;
}

interface JsonStoredVersionedContractByName extends JsonStoredContractByName {
  version: number | null;
}

interface JsonStoredVersionedContractByHash extends JsonStoredContractByHash {
  version: number | null;
}

/** Interface describing a JSON ExecutableDeployItem */
interface JsonExecutableDeployItem {
  ModuleBytes?: JsonModuleBytes;
  StoredContractByHash?: JsonStoredContractByHash;
  StoredContractByName?: JsonStoredContractByName;
  StoredVersionedContractByName?: JsonStoredVersionedContractByName;
  StoredVersionedContractByHash?: JsonStoredVersionedContractByHash;
  Transfer?: JsonBasicExecutionDeployItemInternal;
}

/** Interface for JSON represented approvals */
interface JsonApproval {
  signer: string;
  signature: string;
}

/** Interface describing a JSON represented deploy */
export interface JsonDeploy {
  hash: JsonDeployHash;
  header: JsonDeployHeader;
  payment: JsonExecutableDeployItem;
  session: JsonExecutableDeployItem;
  approvals: JsonApproval[];
}

/** Interface describing a JSON represented deploy header */
export interface JsonHeader {
  parent_hash: string;
  state_root_hash: string;
  body_hash: string;
  deploy_hashes: string[];
  random_bit: boolean;
  switch_block: boolean;
  timestamp: number;
  system_transactions: JsonSystemTransaction[];
  era_id: number;
  height: number;
  proposer: string;
  protocol_version: string;
}

/** Interface describing JSON represented block related information */
export interface JsonBlock {
  hash: JsonBlockHash;
  header: JsonHeader;
  proofs: string[];
}

/** Interface describing auction bidding information */
export interface BidInfo {
  bonding_purse: string;
  staked_amount: string;
  delegation_rate: number;
  funds_locked: null | string;
}

/** Interface describing the weight of a validator by its public key */
export interface ValidatorWeight {
  public_key: string;
  weight: string;
}

export enum PurseIdentifier {
  MainPurseUnderPublicKey = 'main_purse_under_public_key',
  MainPurseUnderAccountHash = 'main_purse_under_account_hash',
  PurseUref = 'purse_uref'
}

/** Object to represent era specific information */
@jsonObject
export class EraSummary {
  /** The hash of the block when the era was encountered */
  @jsonMember({ constructor: String, name: 'block_hash' })
  blockHash: string;

  /** The id of the era */
  @jsonMember({ constructor: Number, name: 'era_id' })
  eraId: number;

  /** A `StoredValue` */
  @jsonMember({ constructor: StoredValue, name: 'stored_value' })
  StoredValue: StoredValue;

  /** The state root hash when the era was encountered */
  @jsonMember({ constructor: String, name: 'state_root_hash' })
  stateRootHash: string;
}

/** Interface describing the validators at a certain era */
export interface EraValidators {
  era_id: number;
  validator_weights: ValidatorWeight[];
}

/** Interface describing a validator auction bid */
export interface Bid {
  bonding_purse: string;
  staked_amount: string;
  delegation_rate: number;
  reward: string;
  delegators: Delegators[];
}

/** Interface describing a delegator */
export interface Delegators {
  bonding_purse: string;
  delegatee: string;
  staked_amount: string;
  public_key: string;
}

/** Interface describing a delegator's information */
export interface DelegatorInfo {
  bonding_purse: string;
  delegatee: string;
  reward: string;
  staked_amount: string;
}

/** Interface describing a validator's auction bid */
export interface ValidatorBid {
  public_key: string;
  bid: Bid;
}

/** Interface describing the state of a validator auction */
export interface AuctionState {
  state_root_hash: string;
  block_height: number;
  era_validators: EraValidators[];
  bids: ValidatorBid[];
}

/** Result interface describing validator information */
export interface ValidatorsInfoResult extends RpcResult {
  api_version: string;
  auction_state: AuctionState;
}

/** JSON RPC service for interacting with Casper nodes */
export class CasperServiceByJsonRPC {
  /** JSON RPC client */
  protected client: Client;

  /**
   * Constructor for building a `CasperServiceByJsonRPC`
   * @param provider A provider uri
   */
  constructor(provider: string | SafeEventEmitterProvider) {
    let transport: HTTPTransport | ProviderTransport;
    if (typeof provider === 'string') {
      transport = new HTTPTransport(provider);
    } else {
      transport = new ProviderTransport(provider);
    }
    const requestManager = new RequestManager([transport]);
    this.client = new Client(requestManager);
  }

  /**
   * Get information about a deploy using its hexadecimal hash
   * @param deployHashBase16 The base-16 hash of the deploy
   * @returns A `Promise` that resolves to a `GetDeployResult`
   */
  public async getDeployInfo(
    deployHashBase16: string
  ): Promise<GetDeployResult> {
    return await this.client.request({
      method: 'info_get_deploy',
      params: {
        deploy_hash: deployHashBase16
      }
    });
  }

  /**
   * Get block information
   * @param blockHashBase16 A hexadecimal string representing the hash of a block
   * @returns A `Promise` resolving to a `GetBlockResult`
   */
  public async getBlockInfo(
    blockHashBase16: JsonBlockHash
  ): Promise<GetBlockResult> {
    return await this.client
      .request({
        method: 'chain_get_block',
        params: {
          block_identifier: {
            Hash: blockHashBase16
          }
        }
      })
      .then((res: GetBlockResult) => {
        if (
          res.block !== null &&
          res.block.hash.toLowerCase() !== blockHashBase16.toLowerCase()
        ) {
          throw new Error('Returned block does not have a matching hash.');
        }
        return res;
      });
  }

  /**
   * Get block info at a provided block height
   * @param height The block height at which to gather the block info
   * @returns A `Promise` resolving to a `GetBlockResult`
   */
  public async getBlockInfoByHeight(height: number): Promise<GetBlockResult> {
    return await this.client
      .request({
        method: 'chain_get_block',
        params: {
          block_identifier: {
            Height: height
          }
        }
      })
      .then((res: GetBlockResult) => {
        if (res.block !== null && res.block.header.height !== height) {
          throw new Error('Returned block does not have a matching height.');
        }
        return res;
      });
  }

  /**
   * Get the block info of the latest block added
   * @returns A `Promise` that resolves to a `GetBlockResult`
   */
  public async getLatestBlockInfo(): Promise<GetBlockResult> {
    return await this.client.request({
      method: 'chain_get_block'
    });
  }

  /**
   * Get the attached node's current peers
   * @returns A `Promise` that resolves to a `GetPeersResult`
   */
  public async getPeers(): Promise<GetPeersResult> {
    return await this.client.request({
      method: 'info_get_peers'
    });
  }

  /**
   * Get the status of a node
   * @returns A `Promise` that resolves to a `GetStatusResult`
   */
  public async getStatus(): Promise<GetStatusResult> {
    return await this.client.request({
      method: 'info_get_status'
    });
  }

  /**
   * Get information on the current validators
   * @param blockHash (optional) blockHash that you want to check
   * @returns A `Promise` that resolves to a `ValidatorsInfoResult`
   */
  public async getValidatorsInfo(
    blockHash?: string
  ): Promise<ValidatorsInfoResult> {
    return await this.client.request({
      method: 'state_get_auction_info',
      params: blockHash
        ? {
            block_identifier: {
              Hash: blockHash
            }
          }
        : []
    });
  }

  /**
   * Get information on the network validators of at a certain block height
   * @param blockHeight The block height at which to query the validators' info
   * @returns A `Promise` that resolves to a `ValidatorsInfoResult`
   */
  public async getValidatorsInfoByBlockHeight(
    blockHeight: number
  ): Promise<ValidatorsInfoResult> {
    return await this.client.request({
      method: 'state_get_auction_info',
      params: {
        block_identifier:
          blockHeight >= 0
            ? {
                Height: blockHeight
              }
            : null
      }
    });
  }

  /**
   * Get the reference to an account balance uref by an account's account hash, so it may be cached
   * @param stateRootHash The state root hash at which the main purse URef will be queried
   * @param accountHash The account hash of the account
   * @returns The account's main purse URef
   */
  public async getAccountBalanceUrefByPublicKeyHash(
    stateRootHash: string,
    accountHash: string
  ) {
    const account = await this.getBlockState(
      stateRootHash,
      'account-hash-' + accountHash,
      []
    ).then(res => res.Account!);
    return account.mainPurse;
  }

  /**
   * Get the reference to an account balance uref by an account's public key, so it may be cached
   * @param stateRootHash The state root hash at which the main purse URef will be queried
   * @param publicKey The public key of the account
   * @returns The account's main purse URef
   * @see [getAccountBalanceUrefByPublicKeyHash](#L380)
   */
  public async getAccountBalanceUrefByPublicKey(
    stateRootHash: string,
    publicKey: CLPublicKey
  ) {
    return this.getAccountBalanceUrefByPublicKeyHash(
      stateRootHash,
      encodeBase16(publicKey.toAccountHash())
    );
  }

  /**
   * Get the balance of an account using its main purse URef
   * @param stateRootHash The state root hash at which the account balance will be queried
   * @param balanceUref The URef of an account's main purse URef
   * @returns An account's balance
   */
  public async getAccountBalance(
    stateRootHash: string,
    balanceUref: string
  ): Promise<BigNumber> {
    return await this.client
      .request({
        method: 'state_get_balance',
        params: {
          state_root_hash: stateRootHash,
          purse_uref: balanceUref
        }
      })
      .then(res => BigNumber.from(res.balance_value));
  }

  // TODO: Add docs
  public async queryBalance(
    purseIdentifierType: PurseIdentifier,
    purseIdentifier: string,
    stateRootHash?: string
  ): Promise<BigNumber> {
    return await this.client
      .request({
        method: 'query_balance',
        params: {
          purse_identifier: {
            [purseIdentifierType]: purseIdentifier
          },
          state_identifier: stateRootHash
        }
      })
      .then(res => BigNumber.from(res.balance));
  }

  /**
   * Get the state root hash at a specific block hash
   * @param blockHashBase16 The hexadecimal string representation of a block hash
   * @returns A `Promise` resolving to a state root hash hexadecimal string
   */
  public async getStateRootHash(
    blockHashBase16?: JsonBlockHash
  ): Promise<string> {
    return await this.client
      .request({
        method: 'chain_get_state_root_hash',
        params: blockHashBase16 ? { block_identifier: blockHashBase16 } : []
      })
      .then((res: GetStateRootHashResult) => res.state_root_hash);
  }

  /**
   * Get the global block state at a certain state root hash, path, and key
   * @param stateRootHash The state root hash at which the block state will be queried
   * @param key The key at which to query the state
   * @param path An array of a path / paths at which to query the state
   * @returns The block state at the state root hash, path, and key provided, as a `StoredValue`
   */
  public async getBlockState(
    stateRootHash: string,
    key: string,
    path: string[]
  ): Promise<StoredValue> {
    const res = await this.client.request({
      method: 'state_get_item',
      params: {
        state_root_hash: stateRootHash,
        key,
        path
      }
    });
    if (res.error) {
      return res;
    } else {
      const storedValueJson = res.stored_value;
      const serializer = new TypedJSON(StoredValue);
      const storedValue = serializer.parse(storedValueJson)!;
      return storedValue;
    }
  }

  public async checkDeploySize(deploy: DeployUtil.Deploy) {
    const oneMegaByte = 1048576;
    const size = DeployUtil.deploySizeInBytes(deploy);
    if (size > oneMegaByte) {
      throw Error(
        `Deploy can not be send, because it's too large: ${size} bytes. ` +
          `Max size is 1 megabyte.`
      );
    }
  }

  /**
   * Deploys a provided signed deploy
   * @param signedDeploy A signed `Deploy` object to be sent to a node
   * @remarks A deploy must not exceed 1 megabyte
   */
  public async deploy(signedDeploy: DeployUtil.Deploy) {
    await this.checkDeploySize(signedDeploy);

    return await this.client.request({
      method: 'account_put_deploy',
      params: deployToJson(signedDeploy)
    });
  }

  public async speculativeDeploy(
    signedDeploy: DeployUtil.Deploy,
    blockIdentifier?: string
  ) {
    await this.checkDeploySize(signedDeploy);

    const deploy = deployToJson(signedDeploy);

    return await this.client.request({
      method: 'speculative_exec',
      params: blockIdentifier
        ? { ...deploy, block_identifier: { Hash: blockIdentifier } }
        : { ...deploy }
    });
  }
  /**
   * Retrieves all transfers for a block from the network
   * @param blockHash Hexadecimal block hash. If not provided, the last block added to the chain, known as the given node, will be used
   * @returns A `Promise` resolving to a `Transfers` containing block transfers
   */
  public async getBlockTransfers(blockHash?: string): Promise<Transfers> {
    const res = await this.client.request({
      method: 'chain_get_block_transfers',
      params: {
        block_identifier: blockHash
          ? {
              Hash: blockHash
            }
          : null
      }
    });
    if (res.error) {
      return res;
    } else {
      const serializer = new TypedJSON(Transfers);
      const storedValue = serializer.parse(res)!;
      return storedValue;
    }
  }

  /**
   * Retrieve era information at the block hash of a [switch block](https://docs.casperlabs.io/economics/consensus/#entry)
   * @param blockHash Hexadecimal block hash. If not provided, the last block added to the chain, known as the given node, will be used
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraInfoBySwitchBlock(
    blockHash?: string
  ): Promise<EraSummary> {
    const res = await this.client.request({
      method: 'chain_get_era_info_by_switch_block',
      params: {
        block_identifier: blockHash
          ? {
              Hash: blockHash
            }
          : null
      }
    });
    if (res.error) {
      return res;
    } else {
      const serializer = new TypedJSON(EraSummary);
      const storedValue = serializer.parse(res.era_summary)!;
      return storedValue;
    }
  }

  /**
   * Retrieve era information by [switch block](https://docs.casperlabs.io/economics/consensus/#entry) height
   * @param height The height of the switch block
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraInfoBySwitchBlockHeight(
    height: number
  ): Promise<EraSummary> {
    const res = await this.client.request({
      method: 'chain_get_era_info_by_switch_block',
      params: {
        block_identifier: {
          Height: height
        }
      }
    });
    if (res.error) {
      return res;
    } else {
      const serializer = new TypedJSON(EraSummary);
      const storedValue = serializer.parse(res.era_summary)!;
      return storedValue;
    }
  }

  /**
   * Get a dictionary item by its URef
   * @param stateRootHash The state root hash at which the item will be queried
   * @param dictionaryItemKey The key at which the item is stored
   * @param seedUref The seed URef of the dictionary
   * @returns A `Promise` resolving to a `StoredValue` containing the item
   */
  public async getDictionaryItemByURef(
    stateRootHash: string,
    dictionaryItemKey: string,
    seedUref: string,
    { rawData } = { rawData: false }
  ): Promise<StoredValue> {
    const res = await this.client.request({
      method: 'state_get_dictionary_item',
      params: {
        state_root_hash: stateRootHash,
        dictionary_identifier: {
          URef: {
            seed_uref: seedUref,
            dictionary_item_key: dictionaryItemKey
          }
        }
      }
    });
    if (res.error) {
      return res;
    } else {
      const storedValueJson = res.stored_value;
      if (!rawData) {
        const serializer = new TypedJSON(StoredValue);
        return serializer.parse(storedValueJson)!;
      }
      return storedValueJson;
    }
  }

  /**
   * Get a dictionary item by its name from within a contract
   * @param stateRootHash The state root hash at which the item will be queried
   * @param contractHash The contract hash of the contract that stores the queried dictionary
   * @param dictionaryName The name of the dictionary
   * @param dictionaryItemKey The key at which the item is stored
   * @returns A `Promise` resolving to a `StoredValue` containing the item
   */
  public async getDictionaryItemByName(
    stateRootHash: string,
    contractHash: string,
    dictionaryName: string,
    dictionaryItemKey: string,
    { rawData } = { rawData: false }
  ): Promise<StoredValue> {
    const res = await this.client.request({
      method: 'state_get_dictionary_item',
      params: {
        state_root_hash: stateRootHash,
        dictionary_identifier: {
          ContractNamedKey: {
            key: contractHash,
            dictionary_name: dictionaryName,
            dictionary_item_key: dictionaryItemKey
          }
        }
      }
    });
    if (res.error) {
      return res;
    } else {
      const storedValueJson = res.stored_value;
      if (!rawData) {
        const serializer = new TypedJSON(StoredValue);
        return serializer.parse(storedValueJson)!;
      }
      return storedValueJson;
    }
  }
}
