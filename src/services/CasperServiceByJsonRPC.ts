import { BigNumber } from '@ethersproject/bignumber';
import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
import { TypedJSON, jsonMember, jsonObject } from 'typedjson';

import {
  DeployUtil,
  encodeBase16,
  CLPublicKey,
  StoredValue,
  Transfers
} from '..';

import ProviderTransport, {
  SafeEventEmitterProvider
} from './ProviderTransport';
import {
  ValidatorWeight,
  RpcResult,
  RpcRequestProps,
  GetDeployResult,
  JsonBlockHash,
  GetBlockResult,
  GetPeersResult,
  GetStatusResult,
  GetStateRootHashResult,
  DeployResult
} from './types';

export { JSONRPCError } from '@open-rpc/client-js';

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
  @jsonMember(() => ({ constructor: StoredValue, name: 'stored_value' }))
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
  inactive: boolean;
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
      let providerUrl = provider.endsWith('/')
        ? provider.substring(0, provider.length - 1)
        : provider;

      providerUrl = providerUrl.endsWith('/rpc')
        ? providerUrl
        : providerUrl + '/rpc';

      transport = new HTTPTransport(providerUrl);
    } else {
      transport = new ProviderTransport(provider);
    }
    const requestManager = new RequestManager([transport]);
    this.client = new Client(requestManager);
  }

  /**
   * Get information about a deploy using its hexadecimal hash
   * @param deployHashBase16 The base-16 hash of the deploy
   * @param props optional request props
   * @returns A `Promise` that resolves to a `GetDeployResult`
   */
  public async getDeployInfo(
    deployHashBase16: string,
    props?: RpcRequestProps
  ): Promise<GetDeployResult> {
    return await this.client.request(
      {
        method: 'info_get_deploy',
        params: {
          deploy_hash: deployHashBase16
        }
      },
      props?.timeout
    );
  }

  /**
   * Get block information
   * @param blockHashBase16 A hexadecimal string representing the hash of a block
   * @param props optional request props
   * @returns A `Promise` resolving to a `GetBlockResult`
   */
  public async getBlockInfo(
    blockHashBase16: JsonBlockHash,
    props?: RpcRequestProps
  ): Promise<GetBlockResult> {
    return await this.client
      .request(
        {
          method: 'chain_get_block',
          params: {
            block_identifier: {
              Hash: blockHashBase16
            }
          }
        },
        props?.timeout
      )
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
   * @param props optional request props
   * @returns A `Promise` resolving to a `GetBlockResult`
   */
  public async getBlockInfoByHeight(
    height: number,
    props?: RpcRequestProps
  ): Promise<GetBlockResult> {
    return await this.client
      .request(
        {
          method: 'chain_get_block',
          params: {
            block_identifier: {
              Height: height
            }
          }
        },
        props?.timeout
      )
      .then((res: GetBlockResult) => {
        if (res.block !== null && res.block.header.height !== height) {
          throw new Error('Returned block does not have a matching height.');
        }
        return res;
      });
  }

  /**
   * Get the block info of the latest block added
   * @param props optional request props
   * @returns A `Promise` that resolves to a `GetBlockResult`
   */
  public async getLatestBlockInfo(
    props?: RpcRequestProps
  ): Promise<GetBlockResult> {
    return await this.client.request(
      {
        method: 'chain_get_block'
      },
      props?.timeout
    );
  }

  /**
   * Get the attached node's current peers
   * @param props optional request props
   * @returns A `Promise` that resolves to a `GetPeersResult`
   */
  public async getPeers(props?: RpcRequestProps): Promise<GetPeersResult> {
    return await this.client.request(
      {
        method: 'info_get_peers'
      },
      props?.timeout
    );
  }

  /**
   * Get the status of a node
   * @param props optional request props
   * @returns A `Promise` that resolves to a `GetStatusResult`
   */
  public async getStatus(props?: RpcRequestProps): Promise<GetStatusResult> {
    return await this.client.request(
      {
        method: 'info_get_status'
      },
      props?.timeout
    );
  }

  /**
   * Get information on the current validators
   * @param blockHash (optional) blockHash that you want to check
   * @param props optional request props
   * @returns A `Promise` that resolves to a `ValidatorsInfoResult`
   */
  public async getValidatorsInfo(
    blockHash?: string,
    props?: RpcRequestProps
  ): Promise<ValidatorsInfoResult> {
    return await this.client.request(
      {
        method: 'state_get_auction_info',
        params: blockHash
          ? {
              block_identifier: {
                Hash: blockHash
              }
            }
          : []
      },
      props?.timeout
    );
  }

  /**
   * Get information on the network validators of at a certain block height
   * @param blockHeight The block height at which to query the validators' info
   * @param props optional request props
   * @returns A `Promise` that resolves to a `ValidatorsInfoResult`
   */
  public async getValidatorsInfoByBlockHeight(
    blockHeight: number,
    props?: RpcRequestProps
  ): Promise<ValidatorsInfoResult> {
    return await this.client.request(
      {
        method: 'state_get_auction_info',
        params: {
          block_identifier:
            blockHeight >= 0
              ? {
                  Height: blockHeight
                }
              : null
        }
      },
      props?.timeout
    );
  }

  /**
   * Get the reference to an account balance uref by an account's account hash, so it may be cached
   * @param stateRootHash The state root hash at which the main purse URef will be queried
   * @param accountHash The account hash of the account
   * @param props optional request props
   * @returns The account's main purse URef
   */
  public async getAccountBalanceUrefByPublicKeyHash(
    stateRootHash: string,
    accountHash: string,
    props?: RpcRequestProps
  ) {
    const account = await this.getBlockState(
      stateRootHash,
      'account-hash-' + accountHash,
      [],
      props
    ).then(res => res.Account!);
    return account.mainPurse;
  }

  /**
   * Get the reference to an account balance uref by an account's public key, so it may be cached
   * @param stateRootHash The state root hash at which the main purse URef will be queried
   * @param publicKey The public key of the account
   * @param props optional request props
   * @returns The account's main purse URef
   * @see [getAccountBalanceUrefByPublicKeyHash](#L380)
   */
  public async getAccountBalanceUrefByPublicKey(
    stateRootHash: string,
    publicKey: CLPublicKey,
    props?: RpcRequestProps
  ) {
    return this.getAccountBalanceUrefByPublicKeyHash(
      stateRootHash,
      encodeBase16(publicKey.toAccountHash()),
      props
    );
  }

  /**
   * Get the balance of an account using its main purse URef
   * @param stateRootHash The state root hash at which the account balance will be queried
   * @param balanceUref The URef of an account's main purse URef
   * @param props optional request props
   * @returns An account's balance
   */
  public async getAccountBalance(
    stateRootHash: string,
    balanceUref: string,
    props?: RpcRequestProps
  ): Promise<BigNumber> {
    return await this.client
      .request(
        {
          method: 'state_get_balance',
          params: {
            state_root_hash: stateRootHash,
            purse_uref: balanceUref
          }
        },
        props?.timeout
      )
      .then(res => BigNumber.from(res.balance_value));
  }

  /**
   * Returns given purse balance
   * @param purseIdentifierType purse type enum
   * @param purseIdentifier purse identifier
   * @param stateRootHash state root hash at which the block state will be queried
   * @param props optional request props
   * @returns Purse balance
   */
  public async queryBalance(
    purseIdentifierType: PurseIdentifier,
    purseIdentifier: string,
    stateRootHash?: string,
    props?: RpcRequestProps
  ): Promise<BigNumber> {
    return await this.client
      .request(
        {
          method: 'query_balance',
          params: {
            purse_identifier: {
              [purseIdentifierType]: purseIdentifier
            },
            state_identifier: stateRootHash
          }
        },
        props?.timeout
      )
      .then(res => BigNumber.from(res.balance));
  }

  /**
   * Get the state root hash at a specific block hash
   * @param blockHashBase16 The hexadecimal string representation of a block hash
   * @param props optional request props
   * @returns A `Promise` resolving to a state root hash hexadecimal string
   */
  public async getStateRootHash(
    blockHashBase16?: JsonBlockHash,
    props?: RpcRequestProps
  ): Promise<string> {
    return await this.client
      .request(
        {
          method: 'chain_get_state_root_hash',
          params: blockHashBase16 ? [{ Hash: blockHashBase16 }] : []
        },
        props?.timeout
      )
      .then((res: GetStateRootHashResult) => res.state_root_hash);
  }

  /**
   * Get the global block state at a certain state root hash, path, and key
   * @param stateRootHash The state root hash at which the block state will be queried
   * @param key The key at which to query the state
   * @param path An array of a path / paths at which to query the state
   * @param props optional request props
   * @returns The block state at the state root hash, path, and key provided, as a `StoredValue`
   */
  public async getBlockState(
    stateRootHash: string,
    key: string,
    path: string[],
    props?: RpcRequestProps
  ): Promise<StoredValue> {
    const res = await this.client.request(
      {
        method: 'state_get_item',
        params: {
          state_root_hash: stateRootHash,
          key,
          path
        }
      },
      props?.timeout
    );
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
   * @param props optional request props
   * @remarks A deploy must not exceed 1 megabyte
   */
  public async deploy(
    signedDeploy: DeployUtil.Deploy,
    props?: RpcRequestProps & {
      /**
       * Throws error for unsigned deploy if true
       * @default false
       */
      checkApproval?: boolean;
    }
  ): Promise<DeployResult> {
    await this.checkDeploySize(signedDeploy);

    const { checkApproval = false } = props ?? {};
    if (checkApproval && signedDeploy.approvals.length == 0) {
      throw new Error('Required signed deploy');
    }

    return await this.client.request(
      {
        method: 'account_put_deploy',
        params: DeployUtil.deployToJson(signedDeploy)
      },
      props?.timeout
    );
  }

  /**
   * Wait for deploy to be confirmed on-chain
   * @param signedDeploy deploy signed by the deployer
   * @param timeout optional parameter for timeout
   * @returns GetDepoyResult
   */
  public async waitForDeploy(signedDeploy: DeployUtil.Deploy, timeout = 60000) {
    const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };
    const timer = setTimeout(() => {
      throw new Error('Timeout');
    }, timeout);
    while (true) {
      const deploy = await this.getDeployInfo(encodeBase16(signedDeploy.hash));
      if (deploy.execution_results.length > 0) {
        clearTimeout(timer);
        return deploy;
      } else {
        await sleep(400);
      }
    }
  }

  // TODO: Update Doc
  public async speculativeDeploy(
    signedDeploy: DeployUtil.Deploy,
    blockIdentifier?: string,
    props?: RpcRequestProps
  ) {
    await this.checkDeploySize(signedDeploy);

    const deploy = DeployUtil.deployToJson(signedDeploy);

    return await this.client.request(
      {
        method: 'speculative_exec',
        params: blockIdentifier
          ? { ...deploy, block_identifier: { Hash: blockIdentifier } }
          : { ...deploy }
      },
      props?.timeout
    );
  }
  /**
   * Retrieves all transfers for a block from the network
   * @param blockHash Hexadecimal block hash. If not provided, the last block added to the chain, known as the given node, will be used
   * @param props optional request props
   * @returns A `Promise` resolving to a `Transfers` containing block transfers
   */
  public async getBlockTransfers(
    blockHash?: string,
    props?: RpcRequestProps
  ): Promise<Transfers> {
    const res = await this.client.request(
      {
        method: 'chain_get_block_transfers',
        params: {
          block_identifier: blockHash
            ? {
                Hash: blockHash
              }
            : null
        }
      },
      props?.timeout
    );
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
   * @param props optional request props
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraInfoBySwitchBlock(
    blockHash?: string,
    props?: RpcRequestProps
  ): Promise<EraSummary> {
    const res = await this.client.request(
      {
        method: 'chain_get_era_info_by_switch_block',
        params: {
          block_identifier: blockHash
            ? {
                Hash: blockHash
              }
            : null
        }
      },
      props?.timeout
    );
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
   * @param props optional request props
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraInfoBySwitchBlockHeight(
    height: number,
    props?: RpcRequestProps
  ): Promise<EraSummary> {
    const res = await this.client.request(
      {
        method: 'chain_get_era_info_by_switch_block',
        params: {
          block_identifier: {
            Height: height
          }
        }
      },
      props?.timeout
    );
    if (res.error) {
      return res;
    } else {
      const serializer = new TypedJSON(EraSummary);
      const storedValue = serializer.parse(res.era_summary)!;
      return storedValue;
    }
  }

  /**
   * Retrieve era summary information by block hash (if provided) or most recently added block
   * @param blockHash Hexadecimal block hash. If not provided, the last block added to the chain, known as the given node, will be used
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraSummary(blockHash?: string): Promise<EraSummary> {
    const res = await this.client.request({
      method: 'chain_get_era_summary',
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
   * Retrieve era summary information by block height (if provided) or most recently added block
   * @param blockHeight The height of the switch block
   * @returns A `Promise` resolving to an `EraSummary` containing the era information
   */
  public async getEraSummaryByBlockHeight(
    blockHeight?: number
  ): Promise<EraSummary> {
    const res = await this.client.request({
      method: 'chain_get_era_summary',
      params: {
        block_identifier:
          blockHeight !== undefined && blockHeight >= 0
            ? {
                Height: blockHeight
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
   * Get a dictionary item by its URef
   * @param stateRootHash The state root hash at which the item will be queried
   * @param dictionaryItemKey The key at which the item is stored
   * @param seedUref The seed URef of the dictionary
   * @param opts.rawData Returns rawData if true, otherwise return parsed data
   * @param props optional request props
   * @returns A `Promise` resolving to a `StoredValue` containing the item
   */
  public async getDictionaryItemByURef(
    stateRootHash: string,
    dictionaryItemKey: string,
    seedUref: string,
    props?: RpcRequestProps & { rawData?: boolean }
  ): Promise<StoredValue> {
    const rawData = props?.rawData ?? false;
    const res = await this.client.request(
      {
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
      },
      props?.timeout
    );
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
   * @param opts.rawData Returns rawData if true, otherwise return parsed data
   * @param props optional request props
   * @returns A `Promise` resolving to a `StoredValue` containing the item
   */
  public async getDictionaryItemByName(
    stateRootHash: string,
    contractHash: string,
    dictionaryName: string,
    dictionaryItemKey: string,
    props?: RpcRequestProps & { rawData?: boolean }
  ): Promise<StoredValue> {
    const rawData = props?.rawData ?? false;

    const res = await this.client.request(
      {
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
      },
      props?.timeout
    );
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
