import { CLValue } from '../lib';

/** RPC request props interface */
export interface RpcRequestProps {
  timeout?: number;
}

/** RPC result interface */
export interface RpcResult {
  api_version: string;
}

/** Node peer interface */
export interface Peer {
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

interface NextUpgrade {
  activation_point: number | string;
  protocol_version: string;
}

type NodeState = 'FastSyncing' | 'SyncingToGenesis' | 'Participating';

/** Result interface for a get-status call */
export interface GetStatusResult extends GetPeersResult {
  api_version: string;
  build_version: string;
  chainspec_name: string;
  last_added_block_info: LastAddedBlockInfo | null;
  next_upgrade: NextUpgrade | null;
  /** @added casper-node 1.5 */
  node_state: NodeState;
  our_public_signing_key: string | null;
  round_length: number | null;
  /** @deprecated */
  starting_state_root_hash: string;
  uptime: string;
}

export interface GetChainSpecResult extends RpcResult {
  chainspec_bytes: {
    chainspec_bytes: string;
    maybe_genesis_accounts_bytes: string | null;
    maybe_global_state_bytes: string | null;
  };
}

/** Result interface for a get-state-root-hash call */
export interface GetStateRootHashResult extends RpcResult {
  state_root_hash: string;
}

export type WriteCLValue = {
  cl_type: any;
  bytes: string;
  parsed: any;
};

export type WriteDeployInfo = {
  gas: string;
  from: string;
  source: string;
  transfers: string[];
  deploy_hash: string;
};

export type WriteTransfer = {
  id: number;
  /** to account hash, `null` if the target is URef */
  to: string | null;
  gas: string;
  /** from account hash */
  from: string;
  amount: string;
  /** source uref */
  source: string;
  /** target uref */
  target: string;
  deploy_hash: string;
};

export type AddKey = {
  key: string;
  name: string;
};

export type TransformValue =
  | 'Identity'
  | 'WriteContractWasm'
  | 'WriteContract'
  | 'WriteContractPackage'
  | {
      WriteCLValue: WriteCLValue;
    }
  | { WriteDeployInfo: WriteDeployInfo }
  | { WriteTransfer: WriteTransfer }
  | { AddUInt512: string }
  | { AddKeys: AddKey[] };

interface Transform {
  key: string;
  transform: TransformValue;
}

interface Effect {
  transforms: Transform[];
}

/** Result interface for an execution result body */
interface ExecutionResultBody {
  cost: number;
  error_message?: string | null;
  transfers: string[];
  effect: Effect;
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

export interface BlockIdentifier {
  Hash?: string;
  Height?: number;
}

export interface SpeculativeExecutionResult extends RpcResult {
  block_hash: string;
  execution_result: ExecutionResult;
}

/** Result interface for a get-block call */
export interface GetBlockResult extends RpcResult {
  block: JsonBlock | null;
}

/** Result interface for a account_put_deploy call */
export interface DeployResult extends RpcResult {
  deploy_hash: string;
}

export type JsonBlockHash = string;
export type JsonDeployHash = string;

/** JSON system transaction interface */
export interface JsonSystemTransaction {
  Slash?: string;
  Reward?: Record<string, number>;
}

/** JSON deploy header interface that acts as a schema for JSON deploy headers */
interface JsonDeployHeader {
  account: string;
  timestamp: string;
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
export interface JsonExecutableDeployItem {
  ModuleBytes?: JsonModuleBytes;
  StoredContractByHash?: JsonStoredContractByHash;
  StoredContractByName?: JsonStoredContractByName;
  StoredVersionedContractByName?: JsonStoredVersionedContractByName;
  StoredVersionedContractByHash?: JsonStoredVersionedContractByHash;
  Transfer?: JsonBasicExecutionDeployItemInternal;
}

/** Interface for JSON represented approvals */
export interface JsonApproval {
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
  timestamp: string;
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
