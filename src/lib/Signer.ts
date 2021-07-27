/**
 * Provide methods to communicate with [CasperLabs Signer Extension](https://github.com/CasperLabs/signer).
 * Works only on browser.
 *
 * @packageDocumentation
 */

import { JsonTypes } from 'typedjson';
import {
  CasperLabsHelper,
  SignerTestingHelper
} from '../@types/casperlabsSigner';

declare global {
  interface Window {
    casperlabsHelper: CasperLabsHelper;
    signerTestingHelper: SignerTestingHelper;
  }
}

const helperPresent = () => {
  return !(typeof window.casperlabsHelper === 'undefined');
};

/**
 * Returns Signer version
 */
export const getVersion: () => Promise<string> = async () => {
  if (helperPresent()) {
    try {
      return await window.casperlabsHelper.getVersion();
    } catch {
      return '<1.0.0';
    }
  }
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Check whether CasperLabs Signer extension is connected
 */
export const isConnected: () => Promise<boolean> = async () => {
  if (helperPresent()) return await window.casperlabsHelper.isConnected();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Attempt connection to Signer
 */
export const sendConnectionRequest: () => void = () => {
  if (helperPresent()) return window.casperlabsHelper.requestConnection();
  throw new Error(
    'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
  );
};

/**
 * **Deprecated** in favour of `getActivePublicKey()`.
 * Returns `base64` encoded public key of currently selected account.
 *
 * @throws Error if haven't connected to CasperLabs Signer browser extension.
 */
export const getSelectedPublicKeyBase64: () => Promise<string> = () => {
  if (helperPresent())
    return window.casperlabsHelper.getSelectedPublicKeyBase64();
  throw new Error(
    'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
  );
};

/**
 * Retrieve the active public key.
 *
 * @returns {string} Hex-encoded public key with algorithm prefix.
 */
export const getActivePublicKey: () => Promise<string> = () => {
  if (helperPresent()) return window.casperlabsHelper.getActivePublicKey();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Send Deploy in JSON format message to Signer plugin to sign.
 *
 * @param deploy deploy in JSON format
 * @param sourcePublicKeyHex public key in hex format with algorithm prefix. Used to sign the deploy
 * @param targetPublicKeyHex public key in hex format with algorithm prefix. Used to display hex-formatted address on the UI
 *
 * @throws Error if haven't connected to CasperLabs Signer browser extension.
 * @throws Error if sourcePublicKeyHex is not the same as the key that Signer used to sign the message
 * @throws Error if targetPublicKeyHex is not the same as the key that is used as target in deploy.
 */
export const sign: (
  deploy: { deploy: JsonTypes },
  sourcePublicKey: string,
  targetPublicKey: string
) => Promise<{ deploy: JsonTypes }> = (
  deploy: { deploy: JsonTypes },
  sourcePublicKey: string,
  targetPublicKey: string
) => {
  if (helperPresent())
    return window.casperlabsHelper.sign(
      deploy,
      sourcePublicKey,
      targetPublicKey
    );
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/*
 * Forces Signer to disconnect from the currently open site.
 */
export const disconnectFromSite: () => void = () => {
  if (helperPresent()) return window.casperlabsHelper.disconnectFromSite();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const forceConnection: () => void = () => {
  if (helperPresent()) return window.signerTestingHelper.forceConnection();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const forceDisconnect: () => void = () => {
  if (helperPresent()) return window.signerTestingHelper.forceDisconnect();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const hasCreatedVault: () => Promise<boolean> = () => {
  if (helperPresent()) return window.signerTestingHelper.hasCreatedVault();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const resetExistingVault: () => Promise<void> = () => {
  if (helperPresent()) return window.signerTestingHelper.resetExistingVault();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const createNewVault: (password: string) => Promise<void> = (
  password: string
) => {
  if (helperPresent())
    return window.signerTestingHelper.createNewVault(password);
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const createTestAccount: (
  name: string,
  privateKey: string
) => Promise<void> = (name: string, privateKey: string) => {
  if (helperPresent())
    return window.signerTestingHelper.createTestAccount(name, privateKey);
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const getToSignMessageID: () => Promise<number | null> = () => {
  if (helperPresent()) return window.signerTestingHelper.getToSignMessageID();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

export const signTestDeploy: (msgId: number) => Promise<void> = (
  msgId: number
) => {
  if (helperPresent()) return window.signerTestingHelper.signTestDeploy(msgId);
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};
