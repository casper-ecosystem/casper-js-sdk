import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { CLValue, CLType, CLValueParsers, matchTypeToCLType } from './CLValue';

@jsonObject
class NamedKey {
  @jsonMember({ constructor: String })
  public name: string;
  @jsonMember({ constructor: String })
  public key: string;
}

@jsonObject
class AssociatedKey {
  @jsonMember({ name: 'account_hash', constructor: String })
  public accountHash: string;
  @jsonMember({ constructor: Number })
  public weight: number;
}

@jsonObject
class ActionThresholds {
  @jsonMember({ constructor: Number })
  public deployment: number;

  @jsonMember({ name: 'key_management', constructor: Number })
  public keyManagement: number;
}

/**
 * Structure representing a user's account, stored in global state.
 */
@jsonObject
class AccountJson {
  public accountHash(): string {
    return this._accountHash;
  }

  @jsonMember({ name: 'account_hash', constructor: String })
  private _accountHash: string;
  @jsonArrayMember(NamedKey, { name: 'named_keys' })
  public namedKeys: NamedKey[];
  @jsonMember({ name: 'main_purse', constructor: String })
  public mainPurse: string;
  @jsonArrayMember(AssociatedKey, { name: 'associated_keys' })
  public associatedKeys: AssociatedKey[];
  @jsonMember({ name: 'action_thresholds', constructor: ActionThresholds })
  public actionThresholds: ActionThresholds;
}

@jsonObject
export class TransferJson {
  // Deploy that created the transfer
  @jsonMember({ name: 'deploy_hash', constructor: String })
  public deployHash: string;

  // Account from which transfer was executed
  @jsonMember({ constructor: String })
  public from: string;

  // Source purse
  @jsonMember({ constructor: String })
  public source: string;

  // Target purse
  @jsonMember({ constructor: String })
  public target: string;

  // Transfer amount
  @jsonMember({ constructor: String })
  public amount: string;

  // Gas
  @jsonMember({ constructor: String })
  public gas: string;

  // User-defined id
  @jsonMember({ constructor: Number, preserveNull: true })
  public id: number | null;
}

@jsonObject
export class Transfers {
  @jsonArrayMember(TransferJson)
  transfers: TransferJson[];
}

@jsonObject
export class DeployInfoJson {
  // The relevant Deploy.
  @jsonMember({ name: 'deploy_hash', constructor: String })
  public deployHash: string;

  // Transfers performed by the Deploy.
  @jsonArrayMember(String)
  public transfers: string[];

  // Account identifier of the creator of the Deploy.
  @jsonMember({ constructor: String })
  public from: string;
  // Source purse used for payment of the Deploy.
  @jsonMember({ constructor: String })
  public source: string;

  // Gas cost of executing the Deploy.
  @jsonMember({ constructor: String })
  public gas: string;
}

/**
 * Info about a seigniorage allocation for a validator
 */
@jsonObject
class Validator {
  // Validator's public key
  @jsonMember({ name: 'validator_public_key', constructor: String })
  public validatorPublicKey: string;

  // Allocated amount
  @jsonMember({ constructor: String })
  public amount: string;
}

/**
 * Info about a seigniorage allocation for a delegator
 */
@jsonObject
class Delegator {
  // Delegator's public key
  @jsonMember({ name: 'delegator_public_key', constructor: String })
  public delegatorPublicKey: string;

  // Validator's public key
  @jsonMember({ name: 'validator_public_key', constructor: String })
  public validatorPublicKey: string;

  // Allocated amount
  @jsonMember({ constructor: String })
  public amount: string;
}

/**
 * Information about a seigniorage allocation
 */
@jsonObject
export class SeigniorageAllocation {
  @jsonMember({ constructor: Validator })
  public Validator?: Validator;

  @jsonMember({ constructor: Delegator })
  public Delegator?: Delegator;
}

/**
 * Auction metadata. Intended to be recorded at each era.
 */
@jsonObject
export class EraInfoJson {
  @jsonArrayMember(SeigniorageAllocation, { name: 'seigniorage_allocations' })
  public seigniorageAllocations: SeigniorageAllocation[];
}

/**
 * Named CLType arguments
 */
@jsonObject
export class NamedCLTypeArg {
  @jsonMember({ constructor: String })
  public name: string;

  @jsonMember({
    name: 'cl_type',
    deserializer: json => matchTypeToCLType(json)
  })
  public clType: CLType;
}

/**
 * Entry point metadata
 */
@jsonObject
export class EntryPoint {
  @jsonMember({
    name: 'access',
    deserializer: json => {
      if (typeof json === 'string') return json;
      // TODO: add support for object access
      return null;
    }
  })
  public access: string;

  @jsonMember({ name: 'entry_point_type', constructor: String })
  public entryPointType: string;

  @jsonMember({ constructor: String })
  public name: string;

  @jsonMember({
    name: 'ret',
    deserializer: json => matchTypeToCLType(json)
  })
  public ret: string;

  @jsonArrayMember(NamedCLTypeArg)
  public args: NamedCLTypeArg[];
}

/**
 * Contract metadata.
 */
@jsonObject
export class ContractMetadataJson {
  @jsonMember({ name: 'contract_package_hash', constructor: String })
  public contractPackageHash: string;

  @jsonMember({ name: 'contract_wasm_hash', constructor: String })
  public contractWasmHash: string;

  @jsonArrayMember(EntryPoint, { name: 'entry_points' })
  public entrypoints: EntryPoint[];

  @jsonMember({ name: 'protocol_version', constructor: String })
  public protocolVersion: string;

  @jsonArrayMember(NamedKey, { name: 'named_keys' })
  public namedKeys: NamedKey[];
}

/**
 * Contract Version.
 */
@jsonObject
export class ContractVersionJson {
  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  public protocolVersionMajor: number;

  @jsonMember({ name: 'contract_version', constructor: Number })
  public contractVersion: number;

  @jsonMember({ name: 'contract_hash', constructor: String })
  public contractHash: string;
}

/**
 * Disabled Version.
 */
@jsonObject
export class DisabledVersionJson {
  @jsonMember({ name: 'protocol_version_major', constructor: Number })
  public accessKey: number;

  @jsonMember({ name: 'contract_version', constructor: Number })
  public contractVersion: number;
}

/**
 * Groups.
 */
@jsonObject
export class GroupsJson {
  @jsonMember({ name: 'group', constructor: String })
  public group: string;

  @jsonMember({ name: 'keys', constructor: String })
  public keys: string;
}

/**
 * Contract Package.
 */
@jsonObject
export class ContractPackageJson {
  @jsonMember({ name: 'access_key', constructor: String })
  public accessKey: string;

  @jsonArrayMember(ContractVersionJson, { name: 'versions' })
  public versions: ContractVersionJson[];

  @jsonArrayMember(DisabledVersionJson, { name: 'disabled_versions' })
  public disabledVersions: DisabledVersionJson[];

  @jsonArrayMember(GroupsJson, { name: 'groups' })
  public groups: GroupsJson[];
}

@jsonObject
export class StoredValue {
  @jsonMember({
    deserializer: json => {
      if (!json) return;
      return CLValueParsers.fromJSON(json).unwrap();
    }
  })
  public CLValue?: CLValue;

  // An account
  @jsonMember({ constructor: AccountJson })
  public Account?: AccountJson;

  // A contract's Wasm
  @jsonMember({ constructor: String })
  public ContractWASM?: string;

  // Methods and type signatures supported by a contract
  @jsonMember({ constructor: ContractMetadataJson })
  public Contract?: ContractMetadataJson;

  // A contract definition, metadata, and security container
  @jsonMember({ constructor: ContractPackageJson })
  public ContractPackage?: ContractPackageJson;

  // A record of a transfer
  @jsonMember({ constructor: TransferJson })
  public Transfer?: TransferJson;

  // A record of a deploy
  @jsonMember({ constructor: DeployInfoJson })
  public DeployInfo?: DeployInfoJson;

  @jsonMember({ constructor: EraInfoJson })
  public EraInfo?: EraInfoJson;
}
