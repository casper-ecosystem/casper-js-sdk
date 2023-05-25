export type EventsMap = {
  connected: string;
  disconnected: void;
  accountChanged: string;
  locked: void;
  unlocked: void;
};

export default abstract class BaseSigner {
  public activeAccount?: string;

  private readonly events: Record<string, ((event: any) => void)[]> = {};

  public on<K extends keyof EventsMap>(
    name: K,
    listener: (ev: EventsMap[K]) => void
  ): void {
    this.addEventListener(name, listener);
  }

  public addEventListener<K extends keyof EventsMap>(
    name: K,
    listener: (ev: EventsMap[K]) => void
  ): void {
    if (!this.events[name]) this.events[name] = [];

    this.events[name].push(listener);
  }

  public off<K extends keyof EventsMap>(
    name: K,
    listener: (ev: EventsMap[K]) => void
  ): void {
    this.removeEventListener(name, listener);
  }

  public removeEventListener<K extends keyof EventsMap>(
    name: K,
    listenerToRemove: (ev: EventsMap[K]) => void
  ): void {
    if (!this.events[name]) {
      throw new Error(
        `Can't remove a listener. Event "${name}" doesn't exits.`
      );
    }

    const filterListeners = (listener: (event: any) => void) =>
      listener !== listenerToRemove;

    this.events[name] = this.events[name].filter(filterListeners);
  }

  protected emit<K extends keyof EventsMap>(name: K, event: EventsMap[K]) {
    this.events[name]?.forEach(cb => cb(event));
  }

  public abstract getVersion(): Promise<string>;

  public abstract isConnected(): Promise<boolean>;

  public abstract connect(): Promise<string>;

  public abstract disconnect(): Promise<boolean>;

  public abstract changeAccount(): Promise<string>;

  public abstract signDeploy(): Promise<string>;

  public abstract signAndSendDeploy(): Promise<string>;

  public abstract signMessage(): Promise<string>;

  public abstract getActiveAccount(): Promise<string>;
}
