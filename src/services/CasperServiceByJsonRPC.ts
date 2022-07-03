import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
import { TypedJSON, jsonMember, jsonObject } from 'typedjson';
import { DeployUtil, encodeBase16, CLPublicKey } from '..';
import { deployToJson } from '../lib/DeployUtil';
import { StoredValue, Transfers } from '../lib/StoredValue';
import { BigNumber } from '@ethersproject/bignumber';
import ProviderTransport, {
  SafeEventEmitterProvider
} from './ProviderTransport';

interface RpcResult {
  api_version: string;
}

interface Peer {
  node_id: string;
  address: string;
}

export interface GetPeersResult extends RpcResult {
  peers: Peer[];
}

interface LastAddedBlockInfo {
  hash: string;
  timestamp: string;
  era_id: number;
  height: number;
  state_root_hash: string;
  creator: string;
}

export interface GetStatusResult extends GetPeersResult {
  last_added_block_info: LastAddedBlockInfo;
  build_version: string;
}

export interface GetStateRootHashResult extends RpcResult {
  state_root_hash: string;
}

interface ExecutionResultBody {
  cost: number;
  error_message?: string | null;
  transfers: string[];
}

export interface ExecutionResult {
  Success?: ExecutionResultBody;
  Failure?: ExecutionResultBody;
}

export interface JsonExecutionResult {
  block_hash: JsonBlockHash;
  result: ExecutionResult;
}

export interface GetDeployResult extends RpcResult {
  deploy: JsonDeploy;
  execution_results: JsonExecutionResult[];
}

export interface GetBlockResult extends RpcResult {
  block: JsonBlock | null;
}

type JsonBlockHash = string;
type JsonDeployHash = string;

export interface JsonSystemTransaction {
  Slash?: string;
  Reward?: Record<string, number>;
}

interface JsonDeployHeader {
  account: string;
  timestamp: number;
  ttl: number;
  gas_price: number;
  body_hash: string;
  dependencies: JsonDeployHash[];
  chain_name: string;
}

// TODO: Empty interface
// eslint-disable-next-line
interface JsonExecutableDeployItem {}

interface JsonApproval {
  signer: string;
  signature: string;
}

export interface JsonDeploy {
  hash: JsonDeployHash;
  header: JsonDeployHeader;
  payment: JsonExecutableDeployItem;
  session: JsonExecutableDeployItem;
  approvals: JsonApproval[];
}

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

export interface JsonBlock {
  hash: JsonBlockHash;
  header: JsonHeader;
  proofs: string[];
}

export interface BidInfo {
  bonding_purse: string;
  staked_amount: string;
  delegation_rate: number;
  funds_locked: null | string;
}

export interface ValidatorWeight {
  public_key: string;
  weight: string;
}

export enum PurseIdentifier {
  MainPurseUnderPublicKey = 'main_purse_under_public_key',
  MainPurseUnderAccountHash = 'main_purse_under_account_hash',
  PurseUref = 'purse_uref'
}

@jsonObject
export class EraSummary {
  @jsonMember({ constructor: String, name: 'block_hash' })
  blockHash: string;

  @jsonMember({ constructor: Number, name: 'era_id' })
  eraId: number;

  @jsonMember({ constructor: StoredValue, name: 'stored_value' })
  StoredValue: StoredValue;

  @jsonMember({ constructor: String, name: 'state_root_hash' })
  stateRootHash: string;
}

export interface EraValidators {
  era_id: number;
  validator_weights: ValidatorWeight[];
}

export interface Bid {
  bonding_purse: string;
  staked_amount: string;
  delegation_rate: number;
  reward: string;
  delegators: Delegators[];
}

export interface Delegators {
  bonding_purse: string;
  delegatee: string;
  staked_amount: string;
  public_key: string;
}

export interface DelegatorInfo {
  bonding_purse: string;
  delegatee: string;
  reward: string;
  staked_amount: string;
}

export interface ValidatorBid {
  public_key: string;
  bid: Bid;
}

export interface AuctionState {
  state_root_hash: string;
  block_height: number;
  era_validators: EraValidators[];
  bids: ValidatorBid[];
}

export interface ValidatorsInfoResult extends RpcResult {
  api_version: string;
  auction_state: AuctionState;
}

export class CasperServiceByJsonRPC {
  protected client: Client;

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
   * Get information about a single deploy by hash.
   *
   * @param deployHashBase16
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

  public async getLatestBlockInfo(): Promise<GetBlockResult> {
    return await this.client.request({
      method: 'chain_get_block'
    });
  }

  public async getPeers(): Promise<GetPeersResult> {
    return await this.client.request({
      method: 'info_get_peers'
    });
  }

  public async getStatus(): Promise<GetStatusResult> {
    return await this.client.request({
      method: 'info_get_status'
    });
  }

  public async getValidatorsInfo(): Promise<ValidatorsInfoResult> {
    return await this.client.request({
      method: 'state_get_auction_info'
    });
  }

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
   * Get the reference to the balance so we can cache it.
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
   * Get the reference to the balance so we can cache it.
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

  public async getStateRootHash(
    blockHashBase16?: JsonBlockHash
  ): Promise<string> {
    return await this.client
      .request({
        method: 'chain_get_state_root_hash',
        params: {
          block_hash: blockHashBase16 || null
        }
      })
      .then((res: GetStateRootHashResult) => res.state_root_hash);
  }

  /**
   * get global state item
   * @param stateRootHash
   * @param key
   * @param path
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

  public async deploy(signedDeploy: DeployUtil.Deploy) {
    const oneMegaByte = 1048576;
    const size = DeployUtil.deploySizeInBytes(signedDeploy);
    if (size > oneMegaByte) {
      throw Error(
        `Deploy can not be send, because it's too large: ${size} bytes. ` +
          `Max size is 1 megabyte.`
      );
    }

    return await this.client.request({
      method: 'account_put_deploy',
      params: deployToJson(signedDeploy)
    });
  }

  /**
   * Retrieves all transfers for a block from the network
   * @param blockIdentifier Hex-encoded block hash or height of the block. If not given, the last block added to the chain as known at the given node will be used. If not provided it will retrieve by latest block.
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
   * Retrieve era information by block hash.
   * @param blockIdentifier Hex-encoded block hash or height of the block. If not given, the last block added to the chain as known at the given node will be used. If not provided it will retrieve by latest block.
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
   * Retrieve era information by block height
   * @param blockHeight
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
   * get dictionary item by URef
   * @param stateRootHash
   * @param dictionaryItemKey
   * @param seedUref
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
   * get dictionary item by name
   * @param stateRootHash
   * @param dictionaryItemKey
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
