import blake from 'blakejs';
import { CLPublicKey, CLValue } from '../index';
import * as DeployUtil from './DeployUtil';
import { CasperClient } from './CasperClient';
import { Deploy } from './DeployUtil';
import { RuntimeArgs } from './RuntimeArgs';
import { AsymmetricKey } from './Keys';
import { StoredValue } from './StoredValue';
import { DEFAULT_DEPLOY_TTL } from '../constants';

/**
 * Use blake2b to compute hash of ByteArray
 *
 * @param x
 */
export function byteHash(x: Uint8Array): Uint8Array {
  return blake.blake2b(x, null, 32);
}

export const contractHashToByteArray = (contractHash: string) =>
  Uint8Array.from(Buffer.from(contractHash, 'hex'));

const NO_CLIENT_ERR =
  'You need to either create Contract instance with casperClient or pass it as parameter to this function';

export class Contract {
  public contractHash?: string;
  public contractPackageHash?: string;

  constructor(public casperClient?: CasperClient) {}

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
    if (this.contractHash && this.contractPackageHash) return true;
    throw Error('You need to setContract before running this method.');
  }

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

    const contractHashAsByteArray = contractHashToByteArray(this.contractHash!);

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

  public async queryContractData(
    path: string[] = [],
    casperClient?: CasperClient,
    stateRootHash?: string
  ): Promise<StoredValue> {
    const client = casperClient || this.casperClient;
    if (!client) throw Error(NO_CLIENT_ERR);

    const stateRootHashToUse =
      stateRootHash || (await client.nodeClient.getStateRootHash());

    return await client.nodeClient.getBlockState(
      stateRootHashToUse,
      `hash-${this.contractHash}`,
      path
    );
  }

  public async queryContractState(
    key: string[],
    stateRootHash?: string,
    casperClient?: CasperClient
  ): Promise<CLValue> {
    const client = casperClient || this.casperClient;
    if (!client) throw Error(NO_CLIENT_ERR);

    const stateRootHashToUse =
      stateRootHash || (await client.nodeClient.getStateRootHash());

    const contractData = await this.queryContractData(
      key,
      client,
      stateRootHashToUse
    );

    if (contractData && contractData.CLValue instanceof CLValue) {
      return contractData.CLValue.value();
    } else {
      throw Error('Invalid stored value');
    }
  }

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

    if (storedValue && storedValue.CLValue instanceof CLValue) {
      return storedValue.CLValue.value();
    } else {
      throw Error('Invalid stored value');
    }
  }
}
