/**
 * The CEP78 class can be used to interface with CEP-78 compliant NFTs on the Casper Network
 *
 * @packageDocumentation
 */

import { CasperClient } from './CasperClient';
import { Contract } from './Contracts';
import { RuntimeArgs } from './RuntimeArgs';
import { CLPublicKey, CLValueBuilder, CLValue } from '../index';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { AsymmetricKey } from './Keys';
import { CLKey } from './CLValue/Key';

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

        ) {
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
    ) {
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
    ) {
        if (this.contract == null) {
            throw new Error("Please connect a contract instance with `CEP78.createContract`")
        }

        if (this.contract.contractHash == null) {
            throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
        }

        let args: Record<string, CLValue> = {
            "token_meta_data": CLValueBuilder.string(JSON.stringify(metadata))
        }

        if (tokenOwner instanceof CLKey) {
            args["token_owner"] = tokenOwner
        } else if (tokenOwner instanceof CLPublicKey) {
            args["token_owner"] = CLValueBuilder.key(tokenOwner)
        } else if (tokenOwner instanceof String) {
            args["token_owner"] = CLValueBuilder.key(CLPublicKey.fromHex(tokenOwner))
        }

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
  
  
    transfer(
      tokenId: number,
      recipient: CLKey | CLPublicKey | String,
      source?: CLKey | CLPublicKey | String
      ) {
      if (this.contract == null) {
        throw new Error("Please connect a contract instance with `CEP78.createContract`")
      }

      if (this.contract.contractHash == null) {
        throw new Error("Please connect your Contract instance to a smart contract by running `CEP78.contract.setContractHash(contractHash)`")
      }


      return new Promise((resolve, reject) => {
        if (this.contract.contractHash == null) {
          reject("No contract hash")
        }
  
        const args = RuntimeArgs.fromMap({
          "token_id": CLValueBuilder.u64(tokenId),
          "target_key": CLValueBuilder.key(CLPublicKey.fromHex(recipient)),
          "source_key": CLValueBuilder.key(this.keys.publicKey),
        })
  
        const deploy = this.contract.callEntrypoint(
          "transfer",
          args,
          this.keys.publicKey,
          this.network,
          "1000000000", // 1 CSPR
          [this.keys]
        )
  
        this.putAndGetDeploy(deploy).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    receiveAndSendDeploy(deploy) {
      return new Promise((resolve, reject) => {
        if (this.contract.contractHash == null) {
          reject("No contract hash")
        }
        this.putAndGetDeploy(deploy).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    async balanceOf(account) {
      return new Promise((resolve, reject) => {
        if (this.contract.contractHash == null) {
          reject("No contract hash")
        }
  
        this.contract.queryContractDictionary(
          "balances",
          CLPublicKey.fromHex(account).toAccountHashStr().substring(13),
        ).then((response) => {
          resolve(parseInt(response.data._hex, 16))
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    async ownerOf(tokenId) {
      return new Promise((resolve, reject) => {
        if (this.contract.contractHash == null) {
          reject("No contract hash")
        }
        this.contract.queryContractDictionary(
          "token_owners",
          tokenId.toString(),
        ).then((response) => {
          resolve(Buffer.from(response.data.data).toString('hex'))
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    async totalMinted() {
      return new Promise((resolve, reject) => {
        if (this.contract.contractHash == null) {
          reject("No contract hash")
        }
  
        this.contract.queryContractData(
          ["number_of_minted_tokens"],
        ).then((response) => {
          resolve(parseInt(response._hex, 16))
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    static getWasm(file) {
      try {
        return new Uint8Array(fs.readFileSync(file).buffer)
      } catch (err) {
        console.error(err)
      }
    }
  
    getKeys() {
      return Keys.Ed25519.loadKeyPairFromPrivateFile(this.keyPairFilePath)
    }
  
    putAndGetDeploy(deploy) {
      return new Promise((resolve, reject) => {
        this.client.putDeploy(deploy).then((deployHash) => {
          this.pollDeployment(deployHash).then((response) => {
            resolve(response)
          }).catch((error) => {
            reject(error)
          })
        }).catch((error) => {
          reject(error)
        })
      })
    }
  
    pollDeployment(deployHash) {
      const client = this.client
      return new Promise((resolve, reject) => {
        var poll = setInterval(async function(deployHash) {
          try {
            const response = await client.getDeploy(deployHash)
              if (response[1].execution_results.length != 0) {
               //Deploy executed
               if (response[1].execution_results[0].result.Failure != null) {
                 clearInterval(poll)
                 reject("Deployment failed")
                 return
               }
               clearInterval(poll)
               resolve(response[1].execution_results[0].result.Success)
             }
            } catch(error) {
            console.error(error)
            }
        }, 2000, deployHash)
      })
    }
  
    static iterateTransforms(result) {
      const transforms = result.effect.transforms
      for (var i = 0; i < transforms.length; i++) {
        if (transforms[i].transform == "WriteContract") {
          return transforms[i].key
        }
      }
    }
  }