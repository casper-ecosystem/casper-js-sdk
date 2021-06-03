/**
 * Provide methods to communicate with [CasperLabs Signer Extension](https://github.com/CasperLabs/signer).
 * Works only on browser.
 *
 * @packageDocumentation
 */

/**
 * Returns Signer version
 */
export const getVersion: () => Promise<string> = async () => {
  try {
    return await window.casperlabsHelper!.getVersion();
  } catch {
    return "<1.0.0";
  }
};

/**
 * Check whether CasperLabs Signer extension is connected
 */
export const isConnected: () => Promise<boolean> = async () => {
  return await window.casperlabsHelper!.isConnected();
};

/**
 * Attempt connection to Signer
 */
export const sendConnectionRequest: () => void = () => {
  return window.casperlabsHelper!.requestConnection();
};

/**
 * Return base64 encoded public key of user current selected account.
 *
 * @throws Error if haven't connected to CasperLabs Signer browser extension.
 */
export const getSelectedPublicKeyBase64: () => Promise<string> = () => {
  return window.casperlabsHelper!.getSelectedPublicKeyBase64();
};

/**
 * Retrieve the active public key.
 *
 * @returns {string} Hex-encoded public key with algorithm prefix.
 */
export const getActivePublicKey: () => Promise<string> = () => {
  return window.casperlabsHelper!.getActivePublicKey();
};

/**
 * Send Deploy in JSON format message to Signer plugin to sign.
 *
 * @param deploy deploy in JSON format
 * @param sourcePublicKey base64 encoded public key used to sign the deploy
 * @param targetPublicKey base64 encoded public key used to sign the deploy
 *
 * @throws Error if haven't connected to CasperLabs Signer browser extension.
 * @throws Error if publicKeyBase64 is not the same as the key that Signer used to sign the message
 */
export const sign: (
  deploy: JSON, 
  sourcePublicKey: string, 
  targetPublicKey: string
) => Promise<JSON> = (
  deploy: JSON, sourcePublicKey: string, targetPublicKey: string
) => {
  return window.casperlabsHelper!.sign(deploy, sourcePublicKey, targetPublicKey);
};

/*
 * Forces Signer to disconnect from the currently open site.
 */
export const disconnectFromSite: () => void = () => {
  return window.casperlabsHelper!.disconnectFromSite();
};

export const forceConnection: () => void = () => {
  return window.signerTestingHelper!.forceConnection();
};

export const forceDisconnect: () => void = () => {
  return window.signerTestingHelper!.forceDisconnect();
};

export const hasCreatedVault: () => Promise<boolean> = () => {
  return window.signerTestingHelper!.hasCreatedVault();
};

export const resetExistingVault: () => Promise<void> = () => {
  return window.signerTestingHelper!.resetExistingVault();
};

export const createNewVault: (password: string) => Promise<void> = (
  password: string
) => {
  return window.signerTestingHelper!.createNewVault(password);
};

export const createTestAccount: (
  name: string,
  privateKey: string
) => Promise<void> = (name: string, privateKey: string) => {
  return window.signerTestingHelper!.createTestAccount(name, privateKey);
};

export const getToSignMessageID: () => Promise<number | null> = () => {
  return window.signerTestingHelper!.getToSignMessageID();
};

export const signTestDeploy: (msgId: number) => Promise<void> = (
  msgId: number
) => {
  return window.signerTestingHelper!.signTestDeploy(msgId);
};
