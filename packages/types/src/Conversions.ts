import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

// https://nodejs.org/api/buffer.html

/**
 * Encode Uint8Array into string using Base-64 encoding.
 */
export function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * Decode Base-64 encoded string and returns Uint8Array of bytes.
 *
 * @param base64String base16 encoded string
 */
export function decodeBase64(base64String: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64String, 'base64'));
}

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

/**
 * Convert a CSPR amount to its mote equivalent
 * @param cspr A `BigNumberish` amount of CSPR to convert to the mote equivalent
 * @returns A `BigNumber` containing the CSPR amount
 * @remarks 1 CSPR = 10^9 motes
 */
export function csprToMotes(cspr: BigNumberish): BigNumber {
  return BigNumber.from(cspr).mul('1000000000');
}

/**
 * Convert an amount in motes to its CSPR equivalent
 * @param motes A `BigNumberish` amount of motes to convert to the CSPR equivalent
 * @returns A `BigNumber` containing the CSPR amount
 * @remarks
 * Note that this function will round to the nearest whole integer
 * 1 mote = 10^-9 CSPR
 */
export function motesToCSPR(motes: BigNumberish): BigNumber {
  return BigNumber.from(motes).div('1000000000');
}
