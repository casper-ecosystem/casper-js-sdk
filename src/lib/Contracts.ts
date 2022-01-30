import blake from 'blakejs';
import { CLPublicKey, CLValue } from '../index';
import * as DeployUtil from './DeployUtil';
import { CasperClient } from './CasperClient';
import { Deploy } from './DeployUtil';
import { RuntimeArgs } from './RuntimeArgs';
import { AsymmetricKey } from './Keys';
import { StoredValue } from './StoredValue';
import { DEFAULT_DEPLOY_TTL } from '../constants';

// https://www.npmjs.com/package/tweetnacl-ts
// https://github.com/dcposch/blakejs

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

// export class Contract {
//   private sessionWasm: Uint8Array;
//   private paymentWasm: Uint8Array;

//   /**
//    *
//    * @param sessionPath
//    * @param paymentPath the path of payment contract file, set it undefined if you want use standard payment
//    */
//   constructor(sessionPath: string, paymentPath?: string) {
//     this.sessionWasm = fs.readFileSync(sessionPath);
//     if (!paymentPath) {
//       this.paymentWasm = Buffer.from('');
//     } else {
//       this.paymentWasm = fs.readFileSync(paymentPath);
//     }
//   }

//   /**
//    * Generate the Deploy message for this contract
//    *
//    * @param args Arguments
//    * @param paymentAmount
//    * @param accountPublicKey
//    * @param signingKeyPair key pair to sign the deploy
//    * @param chainName
//    */
//   public deploy(
//     args: RuntimeArgs,
//     paymentAmount: bigint,
//     accountPublicKey: CLPublicKey,
//     signingKeyPair: AsymmetricKey,
//     chainName: string
//   ): DeployUtil.Deploy {
//     const session = ExecutableDeployItem.newModuleBytes(this.sessionWasm, args);
//     const paymentArgs = RuntimeArgs.fromMap({
//       amount: CLValueBuilder.u512(paymentAmount.toString())
//     });

//     const payment = ExecutableDeployItem.newModuleBytes(
//       this.paymentWasm,
//       paymentArgs
//     );

//     const deploy = DeployUtil.makeDeploy(
//       new DeployParams(accountPublicKey, chainName),
//       session,
//       payment
//     );
//     return DeployUtil.signDeploy(deploy, signingKeyPair);
//   }
// }

// /**
//  * Always use the same account for deploying and signing.
//  */
// export class BoundContract {
//   constructor(
//     private contract: Contract,
//     private contractKeyPair: AsymmetricKey
//   ) {}

//   public deploy(
//     args: RuntimeArgs,
//     paymentAmount: bigint,
//     chainName: string
//   ): DeployUtil.Deploy {
//     return this.contract.deploy(
//       args,
//       paymentAmount,
//       this.contractKeyPair.publicKey,
//       this.contractKeyPair,
//       chainName
//     );
//   }
// }
