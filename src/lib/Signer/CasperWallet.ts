/* eslint-disable @typescript-eslint/no-unused-vars */

import { JsonTypes } from 'typedjson';
import BaseSigner from './BaseSigner';
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

export default class CasperWallet extends BaseSigner {
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
      this.emit('connected', this.activeAccount!);

      this.updateState(state);
    } catch (error) {
      console.error(error);
    }
  }

  private handleDisconnected(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      // @ts-ignore
      this.emit('disconnected');

      this.updateState(state);
    } catch (error) {
      console.error(error);
    }
  }

  private handleActiveKeyChanged(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      this.emit('accountChanged', state.activeKey!);

      this.updateState(state);
    } catch (error) {
      console.error(error);
    }
  }

  private handleLocked(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      // @ts-ignore
      this.emit('locked');

      this.updateState(state);
    } catch (error) {
      console.error(error);
    }
  }

  private handleUnlocked(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      // @ts-ignore
      this.emit('unlocked');

      this.updateState(state);
    } catch (error) {
      console.error(error);
    }
  }

  private handleTabChanged(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      //  TODO

      this.updateState(state);
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

  public async isConnected(): Promise<boolean> {
    return this.casperWalletProvider.isConnected();
  }

  public async connect(): Promise<string> {
    await this.casperWalletProvider.requestConnection();
    const activeAccount = await this.casperWalletProvider.getActivePublicKey();

    if (!activeAccount) {
      // TODO: What Error should throw
      throw new Error('');
    }
    return activeAccount;
  }

  public async disconnect(): Promise<boolean> {
    return this.casperWalletProvider.disconnectFromSite();
  }

  public async changeAccount(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async signDeploy(
    deploy: { deploy: JsonTypes },
    signingPublicKey: string
  ): Promise<{ deploy: JsonTypes }> {
    if (DeployUtil.deployFromJson(deploy).err) {
      throw new Error('Invalid Deploy');
    }

    const result = await this.casperWalletProvider.sign(
      JSON.stringify(deploy),
      signingPublicKey
    );

    if (result.cancelled) {
      throw new Error('User canceled sign');
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
      throw new Error('User canceled sign');
    } else {
      return result.signatureHex;
    }
  }

  public async getActiveAccount(): Promise<string> {
    const result = await this.casperWalletProvider.getActivePublicKey();

    if (!result) {
      throw new Error('No active account');
    }

    return result;
  }

  /**
   * Recreate CasperWalletProvider instance
   * @param options Casper WalletProvider options
   * @see {@link CasperWalletProviderOptions}
   */
  public async setOption(options?: CasperWalletProviderOptions) {
    if (!window.CasperWalletProvider) {
      throw new Error('Please install Casper Wallet.');
    }

    this.casperWalletProvider = window.CasperWalletProvider(options);
  }
}
