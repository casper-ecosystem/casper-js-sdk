/**
 * Provide methods to communicate with [CasperLabs Signer Extension](https://github.com/casper-ecosystem/signer).
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

/**
 * Can be used to determine whether the CasperLabs Helper is available at `window`
 * @returns `true` if the CasperLabs Helper is present, `false` otherwise
 */
const helperPresent = () => {
  return !(typeof window.casperlabsHelper === 'undefined');
};

/**
 * Gets the current Signer version
 * @returns The current Signer version
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
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
 * Checks whether CasperLabs Signer extension is connected
 * @returns `true` if the Signer is connected to the current website
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
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
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const sendConnectionRequest: () => void = () => {
  if (helperPresent()) return window.casperlabsHelper.requestConnection();
  throw new Error(
    'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
  );
};

/**
 * Gets the public key currently selected in the Signer in base64 format
 * @deprecated in favour of {@link Signer.getActivePublicKey}.
 * @returns `Promise` that resolves to a `base64` encoded public key string of the currently selected account
 *
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
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
 * @returns {string} Hex-encoded public key with algorithm prefix, where 01 indicates an Ed25519 key and 02 indicates Secp256k1
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
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
 * Send Deploy in JSON format to Signer extension to be signed.
 *
 * @param deploy A deploy in JSON format
 * @param signingPublicKeyHex Hex-formatted public key. The corresponding secret key is used to sign the deploy.
 * @param {string} targetPublicKeyHex Hex-formatted target public key.
 * If the `target` in the deploy is an account hash this can be used to verify it and display the hex-formatted public key in the UI.
 *
 * @returns A signed JSON deploy object
 *
 * @throws Errors if the Signer extension is not connected.
 * @throws Errors if signingPublicKeyHex is not available or does not match the Active Key in the Signer.
 * @throws Errors if targetPublicKeyHex is not the same as the key (or corresponding account hash) that is used as target in deploy.
 */
export const sign: (
  deploy: { deploy: JsonTypes },
  signingPublicKeyHex: string,
  targetPublicKeyHex?: string
) => Promise<{ deploy: JsonTypes }> = (
  deploy: { deploy: JsonTypes },
  signingPublicKeyHex: string,
  targetPublicKeyHex?: string
) => {
  if (helperPresent())
    return window.casperlabsHelper.sign(
      deploy,
      signingPublicKeyHex,
      targetPublicKeyHex
    );
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Initiates a signature request with the Signer. Used for signing messages
 * @param {string} message The message to sign
 * @param {string} signingPublicKey The public key of the signing account
 * @returns A `Promise` that resolves to the signed message
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const signMessage: (
  message: string,
  signingPublicKey: string
) => Promise<string> = (message: string, signingPublicKey: string) => {
  if (helperPresent())
    return window.casperlabsHelper.signMessage(message, signingPublicKey);
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Disconnects from the currently open site
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const disconnectFromSite: () => void = () => {
  if (helperPresent()) return window.casperlabsHelper.disconnectFromSite();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Forces Signer to connect to the currently open site
 * @throws `Error` if the Signer isn't available to the JavaScript client
 */
export const forceConnection: () => void = () => {
  if (helperPresent()) return window.signerTestingHelper.forceConnection();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Forces Signer to disconnect from the currently open site
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const forceDisconnect: () => void = () => {
  if (helperPresent()) return window.signerTestingHelper.forceDisconnect();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Query the Signer to check if the user has created a vault
 * @returns A `Promise` that resolves to a `boolean` indicating whether the user has or hasn't created a vault
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const hasCreatedVault: () => Promise<boolean> = () => {
  if (helperPresent()) return window.signerTestingHelper.hasCreatedVault();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Initiates a request to reset the user's existing vault
 * @returns A `Promise` that resolves to `void`
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
export const resetExistingVault: () => Promise<void> = () => {
  if (helperPresent()) return window.signerTestingHelper.resetExistingVault();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Initiates a request to create a new vault within the Signer
 * @param {string} password The password of the new vault
 * @returns A `Promise` that resolves to `void`
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
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

/**
 * Initiates a request to create a test account within the Signer
 * @param {string} name The name of the test account
 * @param {string} privateKey The private key of the new test account
 * @returns A `Promise` that resolves to `void`
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 */
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

/**
 * Gets the current transaction nonce
 * @returns A `Promise` that resolves to the transaction nonce, or `null`
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 * @privateRemarks Documentation needs reviewing
 */
export const getToSignMessageID: () => Promise<number | null> = () => {
  if (helperPresent()) return window.signerTestingHelper.getToSignMessageID();
  return Promise.reject(
    new Error(
      'Content script not found - make sure you have the Signer installed and refresh the page before trying again.'
    )
  );
};

/**
 * Sign a test deploy with a given id (nonce)
 * @param {number} msgId The transaction id
 * @returns A `Promise` that resolves to `void`
 * @throws `Error` if the JavaScript client isn't connected to the CasperLabs Signer browser extension
 * @privateRemarks Documentation needs reviewing
 */
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
