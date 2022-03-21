import { JsonTypes } from 'typedjson';

interface CasperLabsHelper {
  /**
   * Returns Signer version
   */
  getVersion: () => Promise<string>;

  /**
   * Returns connection status from Signer
   */
  isConnected: () => Promise<boolean>;

  /**
   * Attempt connection to Signer
   */
  requestConnection: () => void;

  /**
   * Send Deploy in JSON format to Signer extension to be signed.
   *
   * @param deploy - deploy in JSON format
   * @param signingPublicKeyHex - Hex-formatted public key. The corresponding secret key is used to sign the deploy.
   * @param {string} [targetPublicKeyHex] - Hex-formatted public key.
   * If the `target` in the deploy is an account hash this can be used to verify it and display the hex-formatted public key in the UI.
   *
   * @throws Errors if the Signer extension is not connected.
   * @throws Errors if signingPublicKey is not available or does not match the Active Key in the Signer.
   * @throws Errors if targetPublicKeyHex is not the same as the key (or corresponding account hash) that is used as target in deploy.
   */
  sign: (
    deploy: { deploy: JsonTypes },
    signingPublicKeyHex: string,
    targetPublicKeyHex?: string
  ) => Promise<{ deploy: JsonTypes }>;

  /**
   * Send raw string message to Signer for signing.
   * @param message string to be signed.
   * @param signingPublicKey public key in hex format, the corresponding secret key (from the vault) will be used to sign.
   * @returns `Base16` signature
   */
  signMessage: (
    rawMessage: string,
    signingPublicKey: string
  ) => Promise<string>;

  /*
   * Returns base64 encoded public key of user current selected account.
   */
  getSelectedPublicKeyBase64: () => Promise<string>;

  /**
   * Retrieve the active public key.
   * @returns {string} Hex-encoded public key with algorithm prefix.
   */
  getActivePublicKey: () => Promise<string>;

  /*
   * Forces Signer to disconnect from the currently open site.
   */
  disconnectFromSite: () => void;
}

interface SignerTestingHelper {
  /*
   * Force connection to Signer (for testing)
   */
  forceConnection: () => void;
  /**
   * Force disconnect from Signer
   */
  forceDisconnect: () => void;
  /**
   * Check if there is an existing vault
   */
  hasCreatedVault: () => Promise<boolean>;
  /**
   * Reset existing vault (for testing) prevents complications
   * and unlocks in preparation for creating an account
   */
  resetExistingVault: () => Promise<void>;
  /**
   * Create a vault (for testing)
   */
  createNewVault: (password: string) => Promise<void>;
  /**
   * Create an account (for testing)
   */
  createTestAccount: (name: string, privateKey: string) => Promise<void>;
  /**
   * Return message ID so we can sign deploy programatically
   */
  getToSignMessageID: () => Promise<number | null>;
  /**
   * Sign deploy with given id (provided by above method)
   */
  signTestDeploy: (msgId: number) => Promise<void>;
}

interface Window {
  casperlabsHelper?: CasperLabsHelper;
  signerTestingHelper?: SignerTestingHelper;
}
