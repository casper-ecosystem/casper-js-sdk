import BaseSigner from './BaseSigner';

export default class CasperWallet extends BaseSigner {
  public isCasperWallet = true;

  // Consider move these flags to the base class
  private connected: boolean;
  private locked: boolean;

  private casperWalletProvider: ReturnType<CasperWalletProvider>;

  constructor(options?: CasperWalletProviderOptions) {
    super();

    this.connected = false;
    this.locked = true;

    this.casperWalletProvider = window.CasperWalletProvider!(options);

    // Register event listeners
    window.addEventListener(
      CasperWalletEventTypes.Connected,
      this.handleEvent.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Disconnected,
      this.handleEvent.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.ActiveKeyChanged,
      this.handleEvent.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Locked,
      this.handleEvent.bind(this)
    );
    window.addEventListener(
      CasperWalletEventTypes.Unlocked,
      this.handleEvent.bind(this)
    );
  }

  private handleEvent(event: any) {
    try {
      const state: CasperWalletState = JSON.parse(event.detail);

      if (state.isConnected !== this.connected) {
        if (state.isConnected) {
          this.emit('connected', this.activeAccount!);
        } else {
          // @ts-ignore
          this.emit('disconnected');
        }
      }
      if (state.activeKey && this.activeAccount !== state.activeKey) {
        this.emit('accountChanged', state.activeKey);
      }
      if (this.locked !== state.isLocked) {
        if (state.isLocked) {
          // @ts-ignore
          this.emit('locked');
        } else {
          // @ts-ignore
          this.emit('unlocked');
        }
      }

      this.connected = state.isConnected ?? false;
      this.activeAccount = state.activeKey ?? undefined;
      this.locked = state.isLocked;
    } catch (err) {
      console.error(err);
    }
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
