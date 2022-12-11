import { CLPublicKey, CLValue, CLValueBuilder, CLTypeBuilder } from '../index';
import * as DeployUtil from './DeployUtil';
import { CasperClient } from './CasperClient';
import { Deploy } from './DeployUtil';
import { RuntimeArgs } from './RuntimeArgs';
import { AsymmetricKey } from './Keys';
import { DEFAULT_DEPLOY_TTL } from '../constants';

/**
 * Convert a contract hash hexadecimal string to a byte array
 * @param contractHash Hexadecimal string of a contract hash, without the "hash-" prefix
 * @returns `Uint8Array` representation of the contract hash
 */
export const contractHashToByteArray = (contractHash: string) =>
  Uint8Array.from(Buffer.from(contractHash, 'hex'));

const NO_CLIENT_ERR =
  'You need to either create Contract instance with casperClient or pass it as parameter to this function';

/** Smart contract object for interacting with contracts on the Casper Network */
export class Contract {
  public contractHash?: string;
  public contractPackageHash?: string;

  /**
   * Constructor
   * @param casperClient The `CasperClient` object connected to a live node
   */
  constructor(public casperClient?: CasperClient) {}

  /**
   * Attaches an on-chain smart contract to this `Contract` object using its hexadecimal string typed hash. The contract hash must include the prefix "hash-"
   * @param contractHash The hexadecimal smart contract hash, with the prefix "hash-"
   * @param contractPackageHash The hexadecimal smart contract package hash, with the prefix "hash-". This parameter is optional, and only used when there is event processing present.
   */
  public setContractHash(
    contractHash: string,
    contractPackageHash?: string
  ): void {
    if (
      !contractHash.startsWith('hash-') ||
      (contractPackageHash && !contractPackageHash.startsWith('hash-'))
    ) {
      throw new Error(
        'Please provide contract hash in a format that contains hash- prefix.'
      );
    }

    this.contractHash = contractHash;
    this.contractPackageHash = contractPackageHash;
  }

  /**
   * Install a smart contract on a Casper Network
   * @param wasm `Uint8Array` representation of a WebAssembly compiled smart contract
   * @param args The runtime arguments for the installment deploy
   * @param paymentAmount The gas payment in motes, where 1 mote = 10^-9 CSPR. Use a stringified base-10 integer
   * @param sender `CLPublicKey` of the sender of the installment deploy
   * @param chainName The name of the network the installment deploy will be sent to. You can get the network name of a node by calling the REST endpoint `:8888/status`
   * @param signingKeys An array of keypairs used to sign the deploy. If you are signing with one key, use an array with only the one keypair. If instead you are utilizing multi-sig functionality, provide multiple keypair objects in the array.
   * @returns The installment deploy, to be sent to a node.
   * @remarks In the future, this method will be an alias to a different method: `callModuleBytesEntrypoint`
   */
  public install(
    wasm: Uint8Array,
    args: RuntimeArgs,
    paymentAmount: string,
    sender: CLPublicKey,
    chainName: string,
    signingKeys: AsymmetricKey[] = []
  ): Deploy {
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(sender, chainName),
      DeployUtil.ExecutableDeployItem.newModuleBytes(wasm, args),
      DeployUtil.standardPayment(paymentAmount)
    );

    const signedDeploy = deploy.sign(signingKeys);

    return signedDeploy;
  }

  private checkSetup(): boolean {
    if (this.contractHash) return true;
    throw Error('You need to setContract before running this method.');
  }

  /**
   * Call an entrypoint of a smart contract.
   * @param entryPoint The name of an entrypoint of a smart contract that you wish to call
   * @param args The runtime arguments for the deploy
   * @param sender `CLPublicKey` of the sender of the deploy
   * @param chainName The name of the network the installment deploy will be sent to. You can get the network name of a node by calling the REST endpoint `:8888/status`
   * @param paymentAmount The gas payment in motes, where 1 mote = 10^-9 CSPR. Use a stringified base-10 integer
   * @param signingKeys An array of keypairs used to sign the deploy. If you are signing with one key, use an array with only the one keypair. If instead you are utilizing multi-sig functionality, provide multiple keypair objects in the array.
   * @param ttl The time that the deploy has to live. If the deploy awaits execution longer than this interval, in seconds, then the deploy will fail. This parameter will default to the [DEFAULT_DEPLOY_TTL](../constants.ts#L1) if not specified.
   * @returns A Deploy object that can be sent to a node to call an entrypoint
   */
  public callEntrypoint(
    entryPoint: string,
    args: RuntimeArgs,
    sender: CLPublicKey,
    chainName: string,
    paymentAmount: string,
    signingKeys: AsymmetricKey[] = [],
    ttl: number = DEFAULT_DEPLOY_TTL
  ): Deploy {
    this.checkSetup();

    const contractHashAsByteArray = contractHashToByteArray(
      this.contractHash!.slice(5)
    );

    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(sender, chainName, 1, ttl),
      DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        contractHashAsByteArray,
        entryPoint,
        args
      ),
      DeployUtil.standardPayment(paymentAmount)
    );

    const signedDeploy = deploy.sign(signingKeys);

    return signedDeploy;
  }

  /**
   * Query data from a smart contract.
   * @param path Path to the data requested
   * @param casperClient A `CasperClient` object with a connected node. This parameter is not required if there is an existing `CasperClient` object attached to this `Contract` instance
   * @param stateRootHash The state root hash at which to query this data. If no state root hash is provided, the most recent one will be queried and used.
   * @returns A `Promise` that resolves to a stored `CLValue` within the smart contract. This `Promise` will be rejected if there is no `CasperClient` to use, or if the stored value is unavailable or invalid
   */
  public async queryContractData(
    path: string[] = [],
    casperClient?: CasperClient,
    stateRootHash?: string
  ): Promise<any> {
    const client = casperClient || this.casperClient;
    if (!client) throw Error(NO_CLIENT_ERR);

    const stateRootHashToUse =
      stateRootHash || (await client.nodeClient.getStateRootHash());

    const contractData = await client.nodeClient.getBlockState(
      stateRootHashToUse,
      this.contractHash!,
      path
    );

    if (contractData && contractData.CLValue?.isCLValue) {
      return contractData.CLValue.value();
    } else {
      throw Error('Invalid stored value');
    }
  }

  /**
   * Query a dictionary associated with a smart contract to obtain stored key-value pairs.
   * @param dictionaryName The name of the dictionary to be queried
   * @param dictionaryItemKey The key of the key-value pair to be obtained
   * @param stateRootHash The state root hash at which to query this data. If no state root hash is provided, the most recent one will be queried and used.
   * @param casperClient A `CasperClient` object with a connected node. This parameter is not required if there is an existing `CasperClient` object attached to this `Contract` instance
   * @returns A `Promise` which resolves to a `CLValue`. This `Promise` will be rejected if there is no `CasperClient` to use, or if the value in the dictionaryName at the key dictionaryItemKey is unavailable or invalid
   */
  public async queryContractDictionary(
    dictionaryName: string,
    dictionaryItemKey: string,
    stateRootHash?: string,
    casperClient?: CasperClient
  ): Promise<CLValue> {
    this.checkSetup();

    const client = casperClient || this.casperClient;
    if (!client) throw Error(NO_CLIENT_ERR);

    const stateRootHashToUse =
      stateRootHash || (await client.nodeClient.getStateRootHash());

    const storedValue = await client.nodeClient.getDictionaryItemByName(
      stateRootHashToUse,
      this.contractHash!,
      dictionaryName,
      dictionaryItemKey
    );

    if (storedValue && storedValue.CLValue?.isCLValue) {
      return storedValue.CLValue;
    } else {
      throw Error('Invalid stored value');
    }
  }
}

/**
 * Converts a `Map` of strings to a `CLMap` of `CLString`s
 * @param map A `Map` of strings
 * @returns A `CLMap` of `CLString`s
 * @see [CLMap](CLValue/Map.ts#L137)
 * @see [CLString](CLValue/String.ts#L54)
 */
export const toCLMap = (map: Map<string, string>) => {
  const clMap = CLValueBuilder.map([
    CLTypeBuilder.string(),
    CLTypeBuilder.string()
  ]);
  for (const [key, value] of Array.from(map.entries())) {
    clMap.set(CLValueBuilder.string(key), CLValueBuilder.string(value));
  }
  return clMap;
};

/**
 * Converts a `CLMap` of `CLValue`s to a `Map` of strings
 * @param map A `CLMap` of `CLValue`s
 * @returns A `Map` containing the values of the `CLMap`
 * @see [CLMap](CLValue/Map.ts#L137)
 */
export const fromCLMap = (map: [CLValue, CLValue][]) => {
  const jsMap = new Map();

  for (const [innerKey, value] of map) {
    jsMap.set(innerKey.value(), value.value());
  }

  return jsMap;
};
