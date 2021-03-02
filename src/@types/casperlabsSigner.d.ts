interface CasperLabsHelper {
  /**
   * Returns connection status from Signer
   */
  isConnected: () => Promise<boolean | undefined>;
  /**
   * Attempt connection to Signer
   */
  requestConnection: () => void;
  /**
   * send base16 encoded message to plugin to sign
   *
   * @param messageBase16 the base16 encoded message that plugin received to sign
   * @param publicKeyBase64 the base64 encoded public key used to sign the deploy, if set, we will check whether it is the same as the active key for signing the message, otherwise, we won't check.
   */
  sign: (messageBase16: string, publicKeyBase64?: string) => Promise<string>;
  // returns base64 encoded public key of user current selected account.
  getSelectedPublicKeyBase64: () => Promise<string | undefined>;
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
  hasCreatedVault: () => Promise<boolean | undefined>;
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
