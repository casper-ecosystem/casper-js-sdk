import {
  AccountDeploy,
  CasperServiceByJsonRPC,
  DeployResult,
  EventService,
  GetDeployResult,
  TransferResult
} from '../services';
import { DeployUtil, Keys, PublicKey } from './index';
import { encodeBase16 } from './Conversions';
import { Deploy, DeployParams, ExecutableDeployItem } from './DeployUtil';
import { AsymmetricKey, SignatureAlgorithm } from './Keys';
import { CasperHDKey } from './CasperHDKey';
import { BigNumber } from '@ethersproject/bignumber';

export class CasperClient {
  private nodeClient: CasperServiceByJsonRPC;
  private eventStoreClient: EventService;

  constructor(nodeUrl: string, eventStoreUrl: string) {
    this.nodeClient = new CasperServiceByJsonRPC(nodeUrl);
    this.eventStoreClient = new EventService(eventStoreUrl);
  }

  /**
   * Generate new key pair.
   * @param algo Currently we support Ed25519 and Secp256K1.
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
   *
   * @param path the path to the publicKey file
   * @param algo the signature algorithm of the file
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
   * Load private key
   * @param path the path to the private key file
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
   * Load private key file to restore keyPair
   *
   * @param path The path to the private key
   * @param algo
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
   *
   * @param seed The seed buffer for parent key
   */
  public newHdWallet(seed: Uint8Array): CasperHDKey {
    return CasperHDKey.fromMasterSeed(seed);
  }

  /**
   * Compute public key from private Key.
   * @param privateKey
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
   * Construct a unsigned Deploy object
   *
   * @param deployParams Parameters for deploy
   * @param session
   * @param payment
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
   * @param deploy unsigned Deploy object
   * @param signKeyPair the keypair to sign the Deploy object
   */
  public signDeploy(deploy: Deploy, signKeyPair: AsymmetricKey): Deploy {
    return DeployUtil.signDeploy(deploy, signKeyPair);
  }

  /**
   * Send deploy to network
   * @param signedDeploy Signed deploy object
   */
  public putDeploy(signedDeploy: Deploy): Promise<string> {
    return this.nodeClient.deploy(signedDeploy).then(it => it.deploy_hash);
  }

  /**
   * convert the deploy object to json
   * @param deploy
   */
  public deployToJson(deploy: Deploy) {
    return DeployUtil.deployToJson(deploy);
  }

  /**
   * Convert the json to deploy object
   *
   * @param json
   */
  public deployFromJson(json: any) {
    return DeployUtil.deployFromJson(json);
  }

  /**
   * Construct the deploy for transfer purpose
   *
   * @param deployParams
   * @param session
   * @param payment
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
   * Get the balance of public key
   */
  public async balanceOfByPublicKey(publicKey: PublicKey): Promise<BigNumber> {
    return this.balanceOfByAccountHash(encodeBase16(publicKey.toAccountHash()));
  }

  /**
   * Get the balance by account hash
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
   * Get deploys for specified account
   * @param publicKey
   * @param page
   * @param limit
   */
  public async getAccountsDeploys(
    publicKey: PublicKey,
    page: number = 0,
    limit: number = 20
  ): Promise<AccountDeploy[]> {
    const data = await this.eventStoreClient.getAccountDeploys(
      publicKey.toAccountHex(),
      page,
      limit
    );
    return data.data;
  }

  /**
   * Get deploy by hash
   * @param deployHash
   */
  public async getDeployByHash(deployHash: string): Promise<DeployResult> {
    return await this.eventStoreClient.getDeployByHash(deployHash);
  }

  /**
   * Get deploy by hash from RPC.
   * @param deployHash
   * @returns Tuple of Deploy and raw RPC response.
   */
  public async getDeployByHashFromRPC(deployHash: string): Promise<[Deploy, GetDeployResult]> {
    return await this.nodeClient.getDeployInfo(deployHash).then((result: GetDeployResult) => {
      return [DeployUtil.deployFromJson(result)!, result];
    });
  }

  /**
   * Get the main purse uref for the specified publicKey
   * @param publicKey
   */
  public async getAccountMainPurseUref(
    publicKey: PublicKey
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

  /**
   * Get transfers to and from the specified public key, including sending and receiving transactions.
   * @param publicKey
   */
  public async getTransfersByPublicKey(
    publicKey: PublicKey
  ): Promise<TransferResult[]> {
    return await this.eventStoreClient.getTransfersByAccountHash(
      encodeBase16(publicKey.toAccountHash())
    );
  }
}
