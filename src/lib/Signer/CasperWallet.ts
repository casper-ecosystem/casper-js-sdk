import BaseSigner from './BaseSigner';

export default class CasperWallet extends BaseSigner {
  public isCasperWallet = true;

  private casperWalletProvider: ReturnType<CasperWalletProvider>;

  constructor(options?: CasperWalletProviderOptions) {
    super();

    this.connected = false;
    this.locked = true;

    this.casperWalletProvider = window.CasperWalletProvider!(options);

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
  public async signDeploy(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  public async signAndSendDeploy(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  public async signMessage(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  public async getActiveAccount(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

declare global {
  interface Window {
    casperWallet?: CasperWallet;
  }
}

if (window.CasperWalletProvider) {
  window.casperWallet = new CasperWallet();
}
