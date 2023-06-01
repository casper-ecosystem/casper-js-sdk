import { JsonTypes } from 'typedjson';

export type EventsMap = {
  connected: string;
  disconnected: void;
  accountChanged: string;
  locked: void;
  unlocked: void;
};

export default abstract class BaseSigner {
  protected activeAccount?: string;

  protected connected: boolean;

  protected locked: boolean;

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

  /**
   * Returns Signer version
   */
  public abstract getVersion(): Promise<string>;

  /**
   * Returns connection status from Signer
   */
  public abstract isConnected(): Promise<boolean>;

  /**
   * Request connection to the Signer
   */
  public abstract connect(): Promise<string>;

  /**
   * Disconnect from the Signer
   */
  public abstract disconnect(): Promise<boolean>;

  /**
   * Request the signer to change active account
   * @returns changed active public key in hex format
   */
  public abstract changeAccount(): Promise<boolean>;

  /**
   * Sign deploy from `DeployUtil.deployToJson`
   *
   * @param deploy - deploy in JSON format
   * @param signingPublicKey - public key in hex format, the corresponding private key will be used to sign.
   *
   * @throws Error if the Signer extension is not connected.
   * @throws Error if signingPublicKey is not available or does not match the Active Key in the Signer.
   *
   * @returns serialized deploy which can be converted into `Deploy` using `DeployUtil.deployFromJson`
   *
   * @example
   *  import { DeployUtil } from "casper-js-sdk";
   *
   *  try {
   *    const serializedDeploy = DeployUtil.deployToJson(deploy);
   *    const signedSerializedDeploy = await signer.signDeploy(serializedDeploy, pulicKey);
   *    const signedDeploy = DeployUtil.deployFromJson(signedSerializedDeploy).unwrap();
   *  } catch (error) {
   *    // handle error
   *  }
   */
  public abstract signDeploy(
    deploy: { deploy: JsonTypes },
    signingPublicKey: string
  ): Promise<{ deploy: JsonTypes }>;

  /**
   * Sign message with given public key's private key
   * @param message string to be signed.
   * @param signingPublicKey public key in hex format, the corresponding private key will be used to sign.
   * @returns string in hex format
   *
   * @example
   *  import { decodeBase16, verifyMessageSignature } from "casper-js-sdk";
   *
   *  try {
   *
   *    const message = "Hello Casper";
   *    const signature = await signer.signMessage(message, publicKey);
   *    const isValidSignature = verifyMessageSignature(CLPublicKey.fromHex(publicKey), message, decodeBase16(signature));
   *
   *  } catch(error) {
   *    // handle error
   *  }
   */
  public abstract signMessage(
    message: string,
    signingPublicKey: string
  ): Promise<string>;

  /**
   * Retrives active public key in hex format
   * @returns string active public key in hex format
   */
  public abstract getActiveAccount(): Promise<string>;
}
