/**
 * The CEP78 class can be used to interface with CEP-78 compliant NFTs on the Casper Network
 *
 * @packageDocumentation
 */

import { CasperClient } from './CasperClient';
import { Contract } from './Contracts';
import { RuntimeArgs } from './RuntimeArgs';
import { CLPublicKey, CLValueBuilder, CLValue, CLString, CLU64 } from '../index';
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
        jsonSchema: JSON,
        identifierMode: number,
        metadataMutability: number,
        holderMode?: number,
        whitelistMode?: number,
        burnMode?: number,
        ): RuntimeArgs {
        let map: Record<string, CLValue> = {
            "collection_name": CLValueBuilder.string(collectionName),
            "collection_symbol": CLValueBuilder.string(collectionSymbol),
            "total_token_supply": CLValueBuilder.u64(totalTokenSupply),
            "ownership_mode": CLValueBuilder.u8(ownershipMode),
            "nft_kind": CLValueBuilder.u8(nftKind), // Digital
            "nft_metadata_kind": CLValueBuilder.u8(metadataKind),
            "json_schema": CLValueBuilder.string(JSON.stringify(jsonSchema)),
            "identifier_mode": CLValueBuilder.u8(identifierMode),
            "metadata_mutability": CLValueBuilder.u8(metadataMutability)
        }

        if (holderMode != null) {
            map["holder_mode"] = CLValueBuilder.u8(holderMode)
        }

        if (whitelistMode != null) {
            map["whitelist_mode"] = CLValueBuilder.u8(whitelistMode)
        }

        if (burnMode != null) {
            map["burn_mode"] = CLValueBuilder.u8(burnMode)
        }
        
        return RuntimeArgs.fromMap(map);
    }

    /**
     * Installs a CEP78 contract on the Casper Network
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
            throw new Error("Please connect a contract instance with `CEP78.createContract`")
        }
        
        return this.contract.install(
            wasm,
            args,
            gas,
            deployer,
            network,
            signers
        )
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
        metadata: JSON,
        tokenOwner: CLKey | CLPublicKey | String,
        deployer: CLPublicKey,
        network: string,
        gas: BigNumberish,
        signers?: AsymmetricKey[]
    ): Deploy {
        if (this.contract == null) {
            throw new Error("Please connect a contract instance with `CEP78.createContract`")
        }

        if (this.contract.contractHash == null) {
            throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
        }

        let args: Record<string, CLValue> = {
            "token_meta_data": CLValueBuilder.string(JSON.stringify(metadata))
        }

        args["token_owner"] = CEP78.castMultitypeKey(tokenOwner)

        let runtimeArgs: RuntimeArgs
        try {
            runtimeArgs = RuntimeArgs.fromMap(args)
        } catch(e) {
            throw e
        }

        return this.contract.callEntrypoint(
            "mint",
            runtimeArgs,
            deployer,
            network,
            gas,
            signers
        )
    }
  
    /**
     * Transfers an NFT
     *  
     * @param {number | string} tokenId The tokenId, either ordinal or hash
     * @param {CLKey | CLPublicKey | String} source The source of the NFT, either the owner or an approved caller
     * @param {CLKey | CLPublicKey | String} destination The destination of the NFT, an account or an address or either depending on the HolderMode
     * @param {CLPublicKey} deployer The public key of the deployer of the contract
     * @param {string} network The network to deploy to
     * @param {BigNumber} gas The gas payment in motes
     * @param {AsymmetricKey[]=} signers A list of signers of the deployment. This value is optional and may be signed after creation
     * @returns {Deploy} Deploy object to be sent to the Network
     */
    transfer(
      tokenId: number | string,
      source: CLKey | CLPublicKey | String,
      destination: CLKey | CLPublicKey | String,
      deployer: CLPublicKey,
      network: string,
      gas: BigNumberish,
      signers?: AsymmetricKey[]
      ): Deploy {
      if (this.contract == null) {
        throw new Error("Please connect a contract instance with `CEP78.createContract`")
      }

      if (this.contract.contractHash == null) {
        throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
      }


      source = CEP78.castMultitypeKey(source)
      destination = CEP78.castMultitypeKey(destination)

      let map: Record<string, CLValue> = {
        "target_key": destination,
        "source_key": source
      }

      if ((tokenId as any) instanceof Number) {
        map["token_id"] = CLValueBuilder.u64(tokenId)
      } else if ((tokenId as any) instanceof String) {
        map["token_id"] = CLValueBuilder.string(String(tokenId))
      }

      return this.contract.callEntrypoint(
        "transfer",
        RuntimeArgs.fromMap(map),
        deployer,
        network,
        gas,
        signers
      )
    }
    /**
     * Gets the CEP-78 NFT balance of an account
     * 
     * @param {CLKey | CLPublicKey | String} account The account with which to check the NFT balance
     * @returns {Promise<CLValue>} A `Promise` that resolves to a `CLValue` containing the balance of the account
     */
    balanceOf(
      account: CLKey | CLPublicKey | String
      ): Promise<CLValue> {
      if (this.contract == null) {
        throw new Error("Please connect a contract instance with `CEP78.createContract`")
      }

      if (this.contract.contractHash == null) {
        throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
      }

      let accountHash: string = CEP78.castMultitypePublicKey(account).toAccountHashStr()

      if (accountHash.search(/^account-hash-/)) {
        accountHash = accountHash.replace("account-hash-", "")
      }

      return this.contract.queryContractDictionary(
        "balances",
        accountHash,
      )
    }

    /**
     * Gets the owner of a CEP-78 NFT
     * 
     * @param {number | string} tokenId The tokenId, either ordinal or hash, to retrieve the owner of
     * @returns {Promise<CLValue>} A `Promise` that resolves to a `CLValue` containing the owner of the NFT
     */
    ownerOf(
      tokenId: number | string
      ): Promise<CLValue> {
      if (this.contract == null) {
        throw new Error("Please connect a contract instance with `CEP78.createContract`")
      }

      if (this.contract.contractHash == null) {
        throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
      }

      return this.contract.queryContractDictionary(
        "token_owners",
        String(CEP78.castTokenID(tokenId)),
      )
    }

    /**
     * Gets the owner of a CEP-78 NFT
     * 
     * @returns {Promise<CLValue>} A `Promise` that resolves to a `CLValue` containing the owner of the NFT
     */
     totalMinted(): Promise<StoredValue> {
      if (this.contract == null) {
        throw new Error("Please connect a contract instance with `CEP78.createContract`")
      }

      if (this.contract.contractHash == null) {
        throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
      }

      return this.contract.queryContractData(
        ["number_of_minted_tokens"],
      )
    }

    private static castMultitypeKey(key: CLKey | CLPublicKey | String): CLKey {
      if (key instanceof CLKey) {
        return key
      } else if (key instanceof CLPublicKey) {
        return CLValueBuilder.key(key)
      } else if (key instanceof String) {
        return CLValueBuilder.key(CLPublicKey.fromHex(String(key)))
      }
      throw new Error("Could not cast key")
    }

    private static castMultitypePublicKey(key: CLKey | CLPublicKey | String): CLPublicKey {
      if (key instanceof CLPublicKey) {
        return key
      } else if (key instanceof String) {
        return CLPublicKey.fromHex(String(key))
      }
      throw new Error("Could not cast key")
    }

    private static castTokenID(tokenId: string | number): CLU64 | CLString {
      if ((tokenId as any) instanceof Number) {
        return CLValueBuilder.u64(tokenId)
      } else if ((tokenId as any) instanceof String) {
        return CLValueBuilder.string(String(tokenId))
      }
      throw new Error("Could not cast tokenId")
    }
  }