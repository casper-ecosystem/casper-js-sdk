import * as nacl from 'tweetnacl-ts';
import * as secp256k1 from 'ethereum-cryptography/secp256k1';
import { sha256 } from 'ethereum-cryptography/sha256';

import { CLPublicKey } from './CLValue/';
import { AsymmetricKey } from './Keys';

/**
 * Method for formatting messages with Casper header.
 * @param message The string to be formatted.
 * @returns The bytes of the formatted message
 */
export const formatMessageWithHeaders = (message: string): Uint8Array => {
  // Avoiding usage of Text Encoder lib to support legacy nodejs versions.
  return Uint8Array.from(Buffer.from(`Casper Message:\n${message}`));
};

/**
 * Method for signing string message.
 * @param key AsymmetricKey used to sign the message
 * @param message Message that will be signed
 * @return Uint8Array Signature in byte format
 */
export const signRawMessage = (
  key: AsymmetricKey,
  message: string
): Uint8Array => {
  return key.sign(formatMessageWithHeaders(message));
};

/**
 * Method for signing formatted message in bytes format.
 * @param key AsymmetricKey used to sign the message
 * @param formattedMessageBytes Bytes of the formatted message. (Strings can be formatted using the `formatMessageWithHeaders()` method)
 * @returns Uint8Array Signature in byte format
 */
export const signFormattedMessage = (
  key: AsymmetricKey,
  formattedMessageBytes: Uint8Array
): Uint8Array => {
  return key.sign(formattedMessageBytes);
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
  const messageWithHeader = formatMessageWithHeaders(message);
  if (key.isEd25519()) {
    return nacl.sign_detached_verify(messageWithHeader, signature, key.value());
  }
  if (key.isSecp256K1()) {
    return secp256k1.ecdsaVerify(
      signature,
      sha256(Buffer.from(messageWithHeader)),
      key.value()
    );
  }

  throw new Error('Unsupported algorithm.');
};
