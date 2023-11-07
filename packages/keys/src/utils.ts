import { blake2b, SignatureAlgorithm } from '@casper-js-sdk/types';

/**
 * Gets the blake2b hash of the provided public key
 * @param signatureAlgorithm The signature algorithm of the key. Currently supported are Ed25519 and Secp256k1
 * @param publicKey The public key as a byte array
 * @returns A blake2b hash of the public key
 */
export function accountHashHelper(
  signatureAlgorithm: SignatureAlgorithm,
  publicKey: Uint8Array
) {
  const separator = Buffer.from([0]);
  const prefix = Buffer.concat([Buffer.from(signatureAlgorithm), separator]);

  if (publicKey.length === 0) {
    return new Uint8Array();
  } else {
    return blake2b(Buffer.concat([prefix, Buffer.from(publicKey)]));
  }
}
