import { CasperServiceByJsonRPC, GetDeployResult } from '../services';
import { DeployUtil, Keys, CLPublicKey } from './index';
import { encodeBase16 } from './Conversions';
import { Deploy, DeployParams, ExecutableDeployItem } from './DeployUtil';
import { AsymmetricKey, SignatureAlgorithm } from './Keys';
import { CasperHDKey } from './CasperHDKey';
import { BigNumber } from '@ethersproject/bignumber';

export class CasperClient {
  public nodeClient: CasperServiceByJsonRPC;

  /**
   * Construct a CasperClient object
   * @param nodeUrl The url of the node to be communicated with
   */
  constructor(nodeUrl: string) {
    this.nodeClient = new CasperServiceByJsonRPC(nodeUrl);
  }

  /**
   * Generate a new key pair
   * @param algo The signature algorithm of the account. The possible values are `SignatureAlgorithm.Ed25519` and SignatureAlgorithm.Secp256K1
   * @returns New key pair with the specified SignatureAlgorithm
   */
  public newKeyPair(algo: SignatureAlgorithm): AsymmetricKey {
    switch (algo) {
      case SignatureAlgorithm.Ed25519:
        return Keys.Ed25519.new();
      case SignatureAlgorithm.Secp256K1:
        return Keys.Secp256K1.new();
      default:
        throw new Error('Invalid signature algorithm');
    }
  }

  /**
   * Load private key from file
   * @param path The path to the publicKey file
   * @param algo The signature algorithm of the account. The possible values are `SignatureAlgorithm.Ed25519` and SignatureAlgorithm.Secp256K1
   * @returns New key pair with the specified SignatureAlgorithm
   */
  public loadPublicKeyFromFile(
    path: string,
    algo: SignatureAlgorithm
  ): Uint8Array {
    switch (algo) {
      case SignatureAlgorithm.Ed25519:
        return Keys.Ed25519.parsePublicKeyFile(path);
      case SignatureAlgorithm.Secp256K1:
        return Keys.Secp256K1.parsePublicKeyFile(path);
      default:
        throw new Error('Invalid signature algorithm');
    }
  }

  /**
   * Load private key to buffer
   * @param path The path to the private key file
   * @param algo The signature algorithm of the account. Currently we support Ed25519 and Secp256K1
   * @returns Uint8Array buffer of the private key
   */
  public loadPrivateKeyFromFile(
    path: string,
    algo: SignatureAlgorithm
  ): Uint8Array {
    switch (algo) {
      case SignatureAlgorithm.Ed25519:
        return Keys.Ed25519.parsePrivateKeyFile(path);
      case SignatureAlgorithm.Secp256K1:
        return Keys.Secp256K1.parsePrivateKeyFile(path);
      default:
        throw new Error('Invalid signature algorithm');
    }
  }

  /**
   * Load private key file to usable keypair
   * @param path The path to the private key file
   * @param algo The signature algorithm of the account
   * @returns Usable keypair
   */
  public loadKeyPairFromPrivateFile(
    path: string,
    algo: SignatureAlgorithm
  ): AsymmetricKey {
    switch (algo) {
      case SignatureAlgorithm.Ed25519:
        return Keys.Ed25519.loadKeyPairFromPrivateFile(path);
      case SignatureAlgorithm.Secp256K1:
        return Keys.Secp256K1.loadKeyPairFromPrivateFile(path);
      default:
        throw new Error('Invalid signature algorithm');
    }
  }

  /**
   * Create a new hierarchical deterministic wallet, supporting bip32 protocol
   * @param seed The seed buffer for parent key
   * @returns A new bip32 compliant hierarchical deterministic wallet
   */
  public newHdWallet(seed: Uint8Array): CasperHDKey {
    return CasperHDKey.fromMasterSeed(seed);
  }

  /**
   * Compute public key from private key
   * @param privateKey Private key buffer
   * @param algo The signature algorithm of the account. Currently we support Ed25519 and Secp256K1
   * @returns Uint8Array buffer of the public key computed from the provided private key
   */
  public privateToPublicKey(
    privateKey: Uint8Array,
    algo: SignatureAlgorithm
  ): Uint8Array {
    switch (algo) {
      case SignatureAlgorithm.Ed25519:
        return Keys.Ed25519.privateToPublicKey(privateKey);
      case SignatureAlgorithm.Secp256K1:
        return Keys.Secp256K1.privateToPublicKey(privateKey);
      default:
        throw new Error('Invalid signature algorithm');
    }
  }

  /**
   * Construct an unsigned Deploy object from the deploy parameters, session logic, and payment logic
   * @param deployParams Deploy parameters
   * @param session Session logic
   * @param payment Payment logic
   * @returns An unsigned Deploy object
   * @see [DeployUtil.makeDeploy](./DeployUtil.ts#L1059)
   */
  public makeDeploy(
    deployParams: DeployParams,
    session: ExecutableDeployItem,
    payment: ExecutableDeployItem
  ): Deploy {
    return DeployUtil.makeDeploy(deployParams, session, payment);
  }

  /**
   * Sign the deploy with the specified signKeyPair
   * @param deploy Unsigned Deploy object
   * @param signKeyPair the keypair used to sign the Deploy object
   * @returns A signed Deploy object
   * @see [DeployUtil.signDeploy](./DeployUtil.ts#L1087)
   */
  public signDeploy(deploy: Deploy, signKeyPair: AsymmetricKey): Deploy {
    return DeployUtil.signDeploy(deploy, signKeyPair);
  }

  /**
   * Send deploy to network
   * @param signedDeploy Signed deploy object
   * @returns The sent Deploy's transaction hash, as a hexadecimal string
   */
  public putDeploy(signedDeploy: Deploy): Promise<string> {
    return this.nodeClient.deploy(signedDeploy).then(it => it.deploy_hash);
  }

  /**
   * Convert the Deploy object to a JSON representation
   * @param deploy A Deploy object
   * @returns A JSON representation of the Deploy
   * @see [DeployUtil.deployToJson](./DeployUtil.ts#L1150)
   */
  public deployToJson(deploy: Deploy) {
    return DeployUtil.deployToJson(deploy);
  }

  /**
   * Convert a JSON Deploy representation to a Deploy object
   * @param json A JSON respresentation of a deploy
   * @returns A Deploy object
   * @see [DeployUtil.deployToJson](./DeployUtil.ts#L1150)
   */
  public deployFromJson(json: any) {
    return DeployUtil.deployFromJson(json);
  }

  /**
   * Construct a Deploy consisting of a standard CSPR transfer. Fails if the Deploy is not a Transfer
   * @param deployParams The parameters of the Deploy
   * @param session Session logic
   * @param payment Payment logic
   */
  public makeTransferDeploy(
    deployParams: DeployParams,
    session: ExecutableDeployItem,
    payment: ExecutableDeployItem
  ): Deploy {
    if (!session.isTransfer()) {
      throw new Error('The session is not a Transfer ExecutableDeployItem');
    }
    return this.makeDeploy(deployParams, session, payment);
  }

  /**
   * Get the CSPR balance of an account using its public key
   * @param publicKey CLPublicKey representation of an account's public key
   * @returns Promise that resolves to the balance of the account
   */
  public async balanceOfByPublicKey(
    publicKey: CLPublicKey
  ): Promise<BigNumber> {
    return this.balanceOfByAccountHash(encodeBase16(publicKey.toAccountHash()));
  }

  /**
   * Get the CSPR balance of an account using its account hash
   * @param accountHashStr The account's account hash as a hexadecimal string
   * @returns Promise that resolves to the balance of the account
   */
  public async balanceOfByAccountHash(
    accountHashStr: string
  ): Promise<BigNumber> {
    try {
      const stateRootHash = await this.nodeClient
        .getLatestBlockInfo()
        .then(it => it.block?.header.state_root_hash);
      // Find the balance Uref and cache it if we don't have it.
      if (!stateRootHash) {
        return BigNumber.from(0);
      }
      const balanceUref = await this.nodeClient.getAccountBalanceUrefByPublicKeyHash(
        stateRootHash,
        accountHashStr
      );

      if (!balanceUref) {
        return BigNumber.from(0);
      }

      return await this.nodeClient.getAccountBalance(
        stateRootHash,
        balanceUref
      );
    } catch (e) {
      return BigNumber.from(0);
    }
  }

  /**
   * Get deploy details using a deploy's transaction hash
   * @param deployHash The hexadecimal string representation of the deploy hash
   * @returns Tuple of Deploy and raw RPC response
   */
  public async getDeploy(
    deployHash: string
  ): Promise<[Deploy, GetDeployResult]> {
    return await this.nodeClient
      .getDeployInfo(deployHash)
      .then((result: GetDeployResult) => {
        return [DeployUtil.deployFromJson(result).unwrap(), result];
      });
  }

  /**
   * Get the main purse uref for the specified publicKey
   * @param publicKey The public key of the account
   * @returns A Promise resolving to a hexadecimal string representation of the account's main purse uref
   */
  public async getAccountMainPurseUref(
    publicKey: CLPublicKey
  ): Promise<string | null> {
    const stateRootHash = await this.nodeClient
      .getLatestBlockInfo()
      .then(it => it.block?.header.state_root_hash);

    if (!stateRootHash) {
      return null;
    }

    const balanceUref = await this.nodeClient.getAccountBalanceUrefByPublicKeyHash(
      stateRootHash,
      encodeBase16(publicKey.toAccountHash())
    );

    return balanceUref;
  }
}
