import blake from 'blakejs';
import * as fs from 'fs';
import { CLPublicKey } from '../index';
import * as DeployUtil from './DeployUtil';
import { DeployParams, ExecutableDeployItem } from './DeployUtil';
import { RuntimeArgs } from './RuntimeArgs';
import { CLAccountHash, CLValue, CLKey } from './CLValue';
import { AsymmetricKey } from './Keys';

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

export class Contract {
  private sessionWasm: Uint8Array;
  private paymentWasm: Uint8Array;

  /**
   *
   * @param sessionPath
   * @param paymentPath the path of payment contract file, set it undefined if you want use standard payment
   */
  constructor(sessionPath: string, paymentPath?: string) {
    this.sessionWasm = fs.readFileSync(sessionPath);
    if (!paymentPath) {
      this.paymentWasm = Buffer.from('');
    } else {
      this.paymentWasm = fs.readFileSync(paymentPath);
    }
  }

  /**
   * Generate the Deploy message for this contract
   *
   * @param args Arguments
   * @param paymentAmount
   * @param accountPublicKey
   * @param signingKeyPair key pair to sign the deploy
   * @param chainName
   */
  public deploy(
    args: RuntimeArgs,
    paymentAmount: bigint,
    accountPublicKey: CLPublicKey,
    signingKeyPair: AsymmetricKey,
    chainName: string
  ): DeployUtil.Deploy {
    const session = ExecutableDeployItem.newModuleBytes(this.sessionWasm, args);
    const paymentArgs = RuntimeArgs.fromMap({
      amount: CLValue.u512(paymentAmount.toString())
    });

    const payment = ExecutableDeployItem.newModuleBytes(
      this.paymentWasm,
      paymentArgs
    );

    const deploy = DeployUtil.makeDeploy(
      new DeployParams(accountPublicKey, chainName),
      session,
      payment
    );
    return DeployUtil.signDeploy(deploy, signingKeyPair);
  }
}

/**
 * Always use the same account for deploying and signing.
 */
export class BoundContract {
  constructor(
    private contract: Contract,
    private contractKeyPair: AsymmetricKey
  ) {}

  public deploy(
    args: RuntimeArgs,
    paymentAmount: bigint,
    chainName: string
  ): DeployUtil.Deploy {
    return this.contract.deploy(
      args,
      paymentAmount,
      this.contractKeyPair.publicKey,
      this.contractKeyPair,
      chainName
    );
  }
}

export class Faucet {
  /**
   * Arguments for Faucet smart contract
   *
   * @param accountPublicKeyHash the public key hash that want to be funded
   */
  public static args(accountPublicKeyHash: Uint8Array): RuntimeArgs {
    const accountKey = new CLKey(new CLAccountHash(accountPublicKeyHash));
    return RuntimeArgs.fromMap({
      account: new CLValue(accountKey)
    });
  }
}

export class Transfer {
  /**
   * Arguments for Transfer smart contract
   *
   * @param accountPublicKeyHash the target account to transfer tokens
   * @param amount the amount of tokens to transfer
   */
  public static args(
    accountPublicKeyHash: Uint8Array,
    amount: bigint
  ): RuntimeArgs {
    const account = CLValue.key(new CLAccountHash(accountPublicKeyHash));
    return RuntimeArgs.fromMap({
      account,
      amount: CLValue.u512(amount.toString())
    });
  }
}
