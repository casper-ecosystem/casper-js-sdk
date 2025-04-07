import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { ContractHash, ContractPackageHash } from './key';
import { NamedEntryPoint } from './AddressableEntity';
import { NamedKey } from './NamedKey';

/**
 * Represents a smart contract on the blockchain, including its unique identifiers, entry points, named keys, and protocol version.
 */
@jsonObject
export class Contract {
  /**
   * The unique hash representing the contract package.
   */
  @jsonMember({
    name: 'contract_package_hash',
    constructor: ContractPackageHash,
    deserializer: json => ContractPackageHash.fromJSON(json),
    serializer: (value: ContractPackageHash) => value.toJSON()
  })
  contractPackageHash: ContractPackageHash;

  /**
   * The unique hash representing the WebAssembly (Wasm) code of the contract.
   */
  @jsonMember({
    name: 'contract_wasm_hash',
    constructor: ContractHash,
    deserializer: json => ContractHash.fromJSON(json),
    serializer: (value: ContractHash) => value.toJSON()
  })
  contractWasmHash: ContractHash;

  /**
   * The list of entry points (functions) that can be called on this contract.
   */
  @jsonArrayMember(NamedEntryPoint, {
    name: 'entry_points',
    deserializer: json => {
      if (!json) return;
      return json.map((it: NamedEntryPoint) => NamedEntryPoint.fromJSON(it));
    }
  })
  entryPoints: NamedEntryPoint[];

  /**
   * The named keys associated with the contract, providing access to specific values or data stored by the contract.
   */
  @jsonArrayMember(NamedKey, { name: 'named_keys' })
  namedKeys: NamedKey[];

  /**
   * The protocol version of the contract, indicating compatibility with specific blockchain protocol versions.
   */
  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  /**
   * Constructs a new `Contract` instance.
   * @param contractPackageHash - The unique hash for the contract package.
   * @param contractWasmHash - The unique hash for the Wasm code of the contract.
   * @param entryPoints - An array of entry points defining functions available in the contract.
   * @param namedKeys - Named keys providing access to specific stored data within the contract.
   * @param protocolVersion - The protocol version for this contract.
   */
  constructor(
    contractPackageHash: ContractPackageHash,
    contractWasmHash: ContractHash,
    entryPoints: NamedEntryPoint[],
    namedKeys: NamedKey[],
    protocolVersion: string
  ) {
    this.contractPackageHash = contractPackageHash;
    this.contractWasmHash = contractWasmHash;
    this.entryPoints = entryPoints;
    this.namedKeys = namedKeys;
    this.protocolVersion = protocolVersion;
  }
}
