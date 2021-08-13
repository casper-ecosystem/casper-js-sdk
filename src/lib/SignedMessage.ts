import * as nacl from 'tweetnacl-ts';
import * as secp256k1 from 'ethereum-cryptography/secp256k1';
import { sha256 } from 'ethereum-cryptography/sha256';

import { CLPublicKey } from './CLValue/';
import { AsymmetricKey } from './Keys';

/**
 * Method for signing string message.
 * @param key AsymmetricKey used to sign the message
 * @param message Message that will be signed
 * @return Uint8Array Signature in byte format
 */
export const signMessage = (
  key: AsymmetricKey,
  message: string
): Uint8Array => {
  const messageWithHeader = Buffer.from(`Casper Message:\n${message}`);
  return key.sign(messageWithHeader);
};

/**
 * Method to verify signature
 * @param key Public key of private key used to signed.
 * @param message Message that was signed
 * @param signature Signature in byte format
 * @return boolean Verification result
 */
export const verifyMessageSignature = (
  key: CLPublicKey,
  message: string,
  signature: Uint8Array
): boolean => {
  const messageWithHeader = Buffer.from(`Casper Message:\n${message}`);
  if (key.isEd25519()) {
    return nacl.sign_detached_verify(messageWithHeader, signature, key.value());
  }
  if (key.isSecp256K1()) {
    return secp256k1.ecdsaVerify(
      signature,
      sha256(messageWithHeader),
      key.value()
    );
  }

  throw new Error('Unsupported algorithm.');
};
