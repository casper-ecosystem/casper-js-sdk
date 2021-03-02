import { decodeBase64 } from 'tweetnacl-util';

// https://nodejs.org/api/buffer.html

export { encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Convert base64 encoded string to base16 encoded string
 *
 * @param base64 base64 encoded string
 */
export function base64to16(base64: string): string {
  return encodeBase16(decodeBase64(base64));
}

/**
 * Encode Uint8Array into string using Base-16 encoding.
 */
export function encodeBase16(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

/**
 * Decode Base-16 encoded string and returns Uint8Array of bytes.
 *
 * @param base16String base16 encoded string
 */
export function decodeBase16(base16String: string): Uint8Array {
  return new Uint8Array(Buffer.from(base16String, 'hex'));
}
