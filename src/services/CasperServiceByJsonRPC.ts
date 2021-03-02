import Client, { HTTPTransport, RequestManager } from 'rpc-client-js';
import { DeployUtil, encodeBase16, PublicKey } from '..';
import { deployToJson } from '../lib/DeployUtil';
import { TypedJSON } from 'typedjson';
import { StoredValue } from '../lib/StoredValue';
import { BigNumber } from '@ethersproject/bignumber';

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

interface ExecutionResult {
  cost: number;
  error_message: string | null;
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

// todo(abner)
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
  delegator: DelegatorInfo;
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

export interface ValidatorsInfoResult extends RpcResult {
  state_root_hash: string;
  block_height: number;
  era_validators: EraValidators[];
  bids: ValidatorBid[];
}

export class CasperServiceByJsonRPC {
  private client: Client;

  constructor(url: string) {
    const transport = new HTTPTransport(url);
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
    return await this.client.request({
      method: 'chain_get_block',
      params: {
        block_hash: blockHashBase16
      }
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
    publicKey: PublicKey
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

  public async getStateRootHash(
    blockHashBase16: JsonBlockHash
  ): Promise<string> {
    return await this.client
      .request({
        method: 'chain_get_state_root_hash',
        params: {
          block_hash: blockHashBase16
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
    return await this.client.request({
      method: 'account_put_deploy',
      params: deployToJson(signedDeploy)
    });
  }
}
