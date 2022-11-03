/**
 * The CEP78 class can be used to interface with CEP-78 compliant NFTs on the Casper Network
 *
 * @packageDocumentation
 */

import { CasperClient } from './CasperClient';
import { Contract } from './Contracts';
import { RuntimeArgs } from './RuntimeArgs';
import {
  CLPublicKey,
  CLValueBuilder,
  CLValue,
  CLString,
  CLU64
} from '../index';
import { BigNumberish } from '@ethersproject/bignumber';
import { AsymmetricKey } from './Keys';
import { CLKey } from './CLValue/Key';
import { Deploy } from './DeployUtil';
import { StoredValue } from './StoredValue';

export class CEP78 {
  client?: CasperClient;
  contract?: Contract;
  constructor(casperClient?: CasperClient, contractHash?: string) {
    this.client = casperClient;
    if (casperClient != null) {
      this.contract = new Contract(this.client);
      if (contractHash != null) {
        this.contract.setContractHash(contractHash);
      }
    }
  }

  /**
   * Builds the arguments necessary to install a CEP78 contract
   *
   * @param {string} collectionName The name of the NFT collection
   * @param {string} collectionSymbol The symbol of the NFT collection
   * @param {number} totalTokenSupply The total token supply, capped at 2^64
   * @param {number} ownershipMode Determines who can mint and transfer the NFTs
   * @param {number} nftKind The kind of NFT, physical, digital, or virtual
   * @param {number} metadataKind The metadata kind. CEP78, ERC721, CustomValidated, or Raw
   * @param {JSON} jsonSchema The JSON schema for which to compare the metadata of NFTs to
   * @param {number} identifierMode The mode by which to identify each NFT, ordinal or hash
   * @param {number} metadataMutability The mutability of the NFT, mutable or immutable.
   * @param {number=} holderMode The holder mode of the NFT, Accounts, Contracts, or Both. Defaults to Both
   * @param {number=} whitelistMode If enabled, minters are required to be on a whitelist to mint. Disabled by default
   * @param {number=} burnMode If enabled, allows the NFTs to be burnt. Enabled by default
   * @returns {RuntimeArgs} A `RuntimeArgs` object that can be deployed with `CEP78.installContract`
   *
   * @privateRemarks Need to set up types for modalities
   */
  static buildInstallmentArgs(
    collectionName: string,
    collectionSymbol: string,
    totalTokenSupply: number,
    ownershipMode: number,
    nftKind: number,
    metadataKind: number,
    jsonSchema: string,
    identifierMode: number,
    metadataMutability: number,
    holderMode?: number,
    whitelistMode?: number,
    burnMode?: number
  ): RuntimeArgs {
    const map: Record<string, CLValue> = {
      collection_name: CLValueBuilder.string(collectionName),
      collection_symbol: CLValueBuilder.string(collectionSymbol),
      total_token_supply: CLValueBuilder.u64(totalTokenSupply),
      ownership_mode: CLValueBuilder.u8(ownershipMode),
      nft_kind: CLValueBuilder.u8(nftKind),
      nft_metadata_kind: CLValueBuilder.u8(metadataKind),
      json_schema: CLValueBuilder.string(JSON.stringify(jsonSchema)),
      identifier_mode: CLValueBuilder.u8(identifierMode),
      metadata_mutability: CLValueBuilder.u8(metadataMutability)
    };

    if (holderMode != null) {
      map['holder_mode'] = CLValueBuilder.u8(holderMode);
    }

    if (whitelistMode != null) {
      map['whitelist_mode'] = CLValueBuilder.u8(whitelistMode);
    }

    if (burnMode != null) {
      map['burn_mode'] = CLValueBuilder.u8(burnMode);
    }

    return RuntimeArgs.fromMap(map);
  }

  /**
   * Installs a CEP-78 contract on the Casper Network
   *
   * @param {Uint8Array} wasm The compiled WebAssembly contract formatted as a `Uint8Array`
   * @param {RuntimeArgs} args The runtime arguments needed to deploy the contract
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {BigNumber} gas The gas payment in motes
   * @param {string} network The network to deploy to
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   *
   * @returns {Deploy} A valid deploy able to be published to the network
   */

  installContract(
    wasm: Uint8Array,
    args: RuntimeArgs,
    deployer: CLPublicKey,
    gas: BigNumberish,
    network: string,
    signers: AsymmetricKey[]
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    return this.contract.install(
      wasm,
      args,
      gas.toString(),
      deployer,
      network,
      signers
    );
  }

  /**
   * Mints a CEP78 NFT on the Casper Network
   *
   * @param {JSON} metadata The metadata of the newly minted NFT
   * @param {CLKey | CLPublicKey | String} tokenOwner The address to mint the NFT to
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {string} network The network to deploy to
   * @param {BigNumber} gas The gas payment in motes
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   * @returns {Deploy} Deploy object to be sent to the Network
   */

  mint(
    metadata: string,
    tokenOwner: CLKey | CLPublicKey | string,
    deployer: CLPublicKey,
    network: string,
    gas: BigNumberish,
    signers?: AsymmetricKey[]
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    const args: Record<string, CLValue> = {
      token_meta_data: CLValueBuilder.string(metadata),
      token_owner: CEP78.castMultitypeKey(tokenOwner)
    };

    let runtimeArgs: RuntimeArgs;
    try {
      runtimeArgs = RuntimeArgs.fromMap(args);
    } catch (e) {
      throw e;
    }

    return this.contract.callEntrypoint(
      'mint',
      runtimeArgs,
      deployer,
      network,
      gas.toString(),
      signers
    );
  }

  /**
   * Transfers an NFT
   *
   * @param {number | string} tokenId The tokenId, either ordinal or hash
   * @param {CLKey | CLPublicKey | string} source The source of the NFT, either the owner or an approved caller
   * @param {CLKey | CLPublicKey | string} destination The destination of the NFT, an account or an address or either depending on the HolderMode
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {string} network The network to deploy to
   * @param {BigNumber} gas The gas payment in motes
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   * @returns {Deploy} Deploy object to be sent to the Network
   */
  transfer(
    tokenId: number | string,
    source: CLKey | CLPublicKey | string,
    destination: CLKey | CLPublicKey | string,
    deployer: CLPublicKey,
    network: string,
    gas: BigNumberish,
    signers?: AsymmetricKey[]
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    source = CEP78.castMultitypeKey(source);
    destination = CEP78.castMultitypeKey(destination);

    const map: Record<string, CLValue> = {
      target_key: destination,
      source_key: source
    };

    if (typeof tokenId == 'number') {
      map['token_id'] = CLValueBuilder.u64(tokenId);
    } else if (typeof tokenId == 'string') {
      map['token_id'] = CLValueBuilder.string(tokenId);
    }

    return this.contract.callEntrypoint(
      'transfer',
      RuntimeArgs.fromMap(map),
      deployer,
      network,
      gas.toString(),
      signers
    );
  }

  /**
   * Burns an NFT
   *
   * @param {number | string} tokenId The tokenId, either ordinal or hash
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {string} network The network to deploy to
   * @param {BigNumber} gas The gas payment in motes
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   * @returns {Deploy} Deploy object to be sent to the Network
   */
  burn(
    tokenId: number | string,
    deployer: CLPublicKey,
    network: string,
    gas: BigNumberish,
    signers?: AsymmetricKey[]
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    const map: Record<string, CLValue> = {};

    if (typeof tokenId == 'number') {
      map['token_id'] = CLValueBuilder.u64(tokenId);
    } else if (typeof tokenId == 'string') {
      map['token_hash'] = CLValueBuilder.string(tokenId);
    }

    return this.contract.callEntrypoint(
      'burn',
      RuntimeArgs.fromMap(map),
      deployer,
      network,
      gas.toString(),
      signers
    );
  }

  /**  * Approve a caller on an NFT
   *
   * @param {number | string} tokenId The tokenId, either ordinal or has
   * @param {CLKey | CLPublicKey | String} operator The caller to approve
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {string} network The network to deploy to
   * @param {BigNumber} gas The gas payment in motes
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   * @returns {Deploy} Deploy object to be sent to the Network
   */
  approve(
    tokenId: number | string,
    operator: CLKey | CLPublicKey | string,
    deployer: CLPublicKey,
    network: string,
    gas: BigNumberish,
    signers?: AsymmetricKey[]
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    const map: Record<string, CLValue> = {
      operator: CEP78.castMultitypeKey(operator)
    };

    if (typeof tokenId == 'number') {
      map['token_id'] = CLValueBuilder.u64(tokenId);
    } else if (typeof tokenId == 'string') {
      map['token_hash'] = CLValueBuilder.string(tokenId);
    }

    return this.contract.callEntrypoint(
      'approve',
      RuntimeArgs.fromMap(map),
      deployer,
      network,
      gas.toString(),
      signers
    );
  }

  /**
   * Set approval for all
   *
   * @param {number | string} tokenId The tokenId, either ordinal or has
   * @param {CLKey | CLPublicKey | String} operator The caller to approve
   * sets operator to None and disapproves all existing operators. Defaults to true.
   * @param {CLPublicKey} deployer The public key of the deployer of the contract
   * @param {string} network The network to deploy to
   * @param {BigNumber} gas The gas payment in motes
   * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
   * @param {boolean=} approveAll If true, approves all NFTs on the provided operator. If false,
   * @returns {Deploy} Deploy object to be sent to the Network
   */
  setApprovalForAll(
    operator: CLKey | CLPublicKey | string,
    deployer: CLPublicKey,
    network: string,
    gas: BigNumberish,
    signers?: AsymmetricKey[],
    approveAll?: boolean
  ): Deploy {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    if (approveAll == null) {
      approveAll = true;
    }

    const map: Record<string, CLValue> = {
      operator: CEP78.castMultitypeKey(operator),
      approve_all: CLValueBuilder.bool(approveAll)
    };

    return this.contract.callEntrypoint(
      'set_approval_for_all',
      RuntimeArgs.fromMap(map),
      deployer,
      network,
      gas.toString(),
      signers
    );
  }

  /* GETTERS */

  /**
   * Gets the CEP-78 NFT balance of an account
   *
   * @param {CLKey | CLPublicKey | String} account The account with which to check the NFT balance
   * @returns {Promise<CLValue>} A `Promise` that resolves to a `CLValue` containing the balance of the account
   */
  balanceOf(account: CLKey | CLPublicKey | string): Promise<CLValue> {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    let accountHash: string = CEP78.castMultitypePublicKey(
      account
    ).toAccountHashStr();

    if (accountHash.search(/^account-hash-/)) {
      accountHash = accountHash.replace('account-hash-', '');
    }

    return this.contract.queryContractDictionary('balances', accountHash);
  }

  /**
   * Gets the owner of a CEP-78 NFT
   *
   * @param {number | string} tokenId The tokenId, either ordinal or hash, to retrieve the owner of
   * @returns {Promise<CLValue>} A `Promise` that resolves to a `CLValue` containing the owner of the NFT
   */
  ownerOf(tokenId: number | string): Promise<CLValue> {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    return this.contract.queryContractDictionary(
      'token_owners',
      CEP78.castTokenID(tokenId).toString()
    );
  }

  /**
   * Gets the total number of NFTs minted
   *
   * @returns {Promise<CLValue>} A `Promise` that resolves to a `StoredValue`
   * containing the total number of NFTs that have been minted
   */
  totalMinted(): Promise<StoredValue> {
    if (this.contract == null) {
      throw new Error(
        'Please connect a contract instance with `CEP78.createContract`'
      );
    }

    if (this.contract.contractHash == null) {
      throw new Error(
        'Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`'
      );
    }

    return this.contract.queryContractData(['number_of_minted_tokens']);
  }

  /* HELPERS */

  private static castMultitypeKey(key: CLKey | CLPublicKey | string): CLKey {
    if (key instanceof CLKey) {
      return key;
    } else if (key instanceof CLPublicKey) {
      return CLValueBuilder.key(key);
    } else if (typeof key === 'string') {
      return CLValueBuilder.key(CLPublicKey.fromHex(key));
    }
    throw new Error('Could not cast key');
  }

  private static castMultitypePublicKey(
    key: CLKey | CLPublicKey | string
  ): CLPublicKey {
    if (key instanceof CLPublicKey) {
      return key;
    } else if (typeof key === 'string') {
      return CLPublicKey.fromHex(key);
    }
    throw new Error('Could not cast key');
  }

  private static castTokenID(tokenId: string | number): CLU64 | CLString {
    if (typeof tokenId === 'number') {
      return CLValueBuilder.u64(tokenId);
    } else if (typeof tokenId === 'string') {
      return CLValueBuilder.string(String(tokenId));
    }
    throw new Error('Could not cast tokenId');
  }
}
