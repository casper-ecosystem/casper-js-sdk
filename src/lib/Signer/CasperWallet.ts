/* eslint-disable @typescript-eslint/no-unused-vars */

import { JsonTypes } from 'typedjson';
import BaseSigner from './BaseSigner';
import { SignerError, SignerErrorCodes } from './error';
import { CLPublicKey, DeployUtil } from '..';

const EVENT_TYPE_PREFIX = 'casper-wallet';

const CasperWalletEventTypes = {
  /** Account was connected using the wallet: */
  Connected: `${EVENT_TYPE_PREFIX}:connected`,
  /** Active key was changed using the Wallet interface: */
  ActiveKeyChanged: `${EVENT_TYPE_PREFIX}:activeKeyChanged`,
  /** Account was disconnected using the wallet: */
  Disconnected: `${EVENT_TYPE_PREFIX}:disconnected`,
  /** Browser tab was changed to some connected site: */
  TabChanged: `${EVENT_TYPE_PREFIX}:tabChanged`,
  /** Wallet was locked: */
  Locked: `${EVENT_TYPE_PREFIX}:locked`,
  /** Wallet was unlocked: */
  Unlocked: `${EVENT_TYPE_PREFIX}:unlocked`
} as const;

type CasperWalletProviderOptions = {
  timeout: number; // timeout of request to extension (in ms)
};

type CasperWalletState = {
  /** contain wallet is locked flag */
  isLocked: boolean;
  /** if unlocked contain connected status flag of active key otherwise null */
  isConnected: boolean | null;
  /** if unlocked and connected contain active key otherwise null */
  activeKey: string | null;
};

export class CasperWallet extends BaseSigner {
  public isCasperWallet = true;

  private casperWalletProvider: ReturnType<CasperWalletProvider>;

  constructor(options?: CasperWalletProviderOptions) {
    super();

    this.connected = false;
    this.locked = true;

    this.setOption(options);

    // Register event listeners
    window.addEventListener(
      CasperWalletEventTypes.Connected,
      this.handleConnected.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Disconnected,
      this.handleDisconnected.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.ActiveKeyChanged,
      this.handleActiveKeyChanged.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Locked,
      this.handleLocked.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Unlocked,
      this.handleUnlocked.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.TabChanged,
      this.handleTabChanged.bind(this)
    );
  }

  private handleConnected(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);

      this.emit('connected', this.activeAccount!);
    } catch (error) {
      console.error(error);
    }
  }

  private handleDisconnected(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);
      // @ts-ignore
      this.emit('disconnected');
    } catch (error) {
      console.error(error);
    }
  }

  private handleActiveKeyChanged(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);

      this.emit('accountChanged', state.activeKey!);
    } catch (error) {
      console.error(error);
    }
  }

  private handleLocked(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);

      // @ts-ignore
      this.emit('locked');
    } catch (error) {
      console.error(error);
    }
  }

  private handleUnlocked(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);

      // @ts-ignore
      this.emit('unlocked');
    } catch (error) {
      console.error(error);
    }
  }

  private handleTabChanged(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);
      this.updateState(state);

      //  TODO
    } catch (error) {
      console.error(error);
    }
  }

  private updateState(state: CasperWalletState) {
    this.connected = state.isConnected ?? false;
    this.activeAccount = state.activeKey ?? undefined;
    this.locked = state.isLocked;
  }

  public async getVersion(): Promise<string> {
    return this.casperWalletProvider.getVersion();
  }

  /**
   * Get the connection status of the Casper Wallet extension
   * @returns `true` when currently connected at least one account, `false` otherwise.
   * @throws when wallet is locked (err.code: 1)
   */
  public async isConnected(): Promise<boolean> {
    return this.casperWalletProvider.isConnected();
  }

  public async connect(): Promise<string> {
    await this.casperWalletProvider.requestConnection();
    const activeAccount = await this.casperWalletProvider.getActivePublicKey();

    return activeAccount;
  }

  public async disconnect(): Promise<boolean> {
    return this.casperWalletProvider.disconnectFromSite();
  }

  public async changeAccount(): Promise<boolean> {
    return this.casperWalletProvider.requestSwitchAccount();
  }

  public async signDeploy(
    deploy: { deploy: JsonTypes },
    signingPublicKey: string
  ): Promise<{ deploy: JsonTypes }> {
    if (DeployUtil.deployFromJson(deploy).err) {
      throw new SignerError(SignerErrorCodes.INVALID_DEPLOY);
    }

    const result = await this.casperWalletProvider.sign(
      JSON.stringify(deploy),
      signingPublicKey
    );

    if (result.cancelled) {
      throw new SignerError(SignerErrorCodes.USER_CANCELED_REQUEST);
    } else {
      const signedDeploy = DeployUtil.setSignature(
        DeployUtil.deployFromJson(deploy).unwrap(),
        result.signature,
        CLPublicKey.fromHex(signingPublicKey)
      );

      return DeployUtil.deployToJson(signedDeploy);
    }
  }

  public async signMessage(
    message: string,
    signingPublicKey: string
  ): Promise<string> {
    const result = await this.casperWalletProvider.signMessage(
      message,
      signingPublicKey
    );

    if (result.cancelled) {
      throw new SignerError(SignerErrorCodes.USER_CANCELED_REQUEST);
    } else {
      return result.signatureHex;
    }
  }

  /**
   * Retrives active public key in hex format
   * @returns string active public key in hex format
   * @throws when wallet is locked (err.code: 1)
   * @throws when active account not approved to connect with the site (err.code: 2)
   */
  public async getActiveAccount(): Promise<string> {
    const result = await this.casperWalletProvider.getActivePublicKey();

    return result;
  }

  /**
   * Recreate CasperWalletProvider instance
   * @param options Casper WalletProvider options
   * @see {@link CasperWalletProviderOptions}
   */
  public async setOption(options?: CasperWalletProviderOptions) {
    if (!window.CasperWalletProvider) {
      throw new SignerError(SignerErrorCodes.NOT_FOUND_SIGNER);
    }

    this.casperWalletProvider = window.CasperWalletProvider(options);
  }
}
