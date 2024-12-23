import { BigNumber } from '@ethersproject/bignumber';

import { CLValueUInt128, CLValueUInt256, CLValueUInt512 } from './Numeric';
import { IResultWithBytes } from './CLValue';

/**
 * Converts a BigNumber to a Uint8Array with a length prefix.
 *
 * The resulting Uint8Array structure:
 * - The first byte is the length of the BigNumber in bytes.
 * - The remaining bytes represent the BigNumber itself.
 *
 * @param val - The BigNumber to convert.
 * @returns Uint8Array representation of the BigNumber.
 */
export const bigToBytes = (val: BigNumber): Uint8Array => {
  let hex = val.toHexString().slice(2);
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }

  const data = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    data[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  const numberLen = data.length;
  const result = new Uint8Array(numberLen + 1);
  result[0] = numberLen;
  result.set(data, 1);

  return result;
};

/**
 * Converts an ArrayBuffer with a length prefix to a BigNumber.
 *
 * Expected input structure:
 * - First byte: length of the BigNumber in bytes.
 * - Remaining bytes: BigNumber value.
 *
 * @param buffer - The ArrayBuffer containing the prefixed byte representation.
 * @returns BigNumber reconstructed from the byte representation.
 */
export const bigFromBuffer = (buffer: ArrayBuffer): BigNumber => {
  const view = new DataView(buffer);
  const size = view.getUint8(0);
  const data = new Uint8Array(buffer.slice(1, size + 1));

  let hex = '';
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    hex += (byte < 16 ? '0' : '') + byte.toString(16);
  }

  return BigNumber.from('0x' + hex);
};

/**
 * Helper to parse BigNumber from prefixed bytes with bit size validation.
 *
 * @param rawBytes - Byte array containing the prefixed BigNumber data.
 * @param bitSize - Bit size (e.g., 128, 256, or 512) to validate the BigNumber.
 * @returns An object containing the parsed BigNumber and remaining bytes.
 * @throws Error if the byte length exceeds expected size or data is insufficient.
 */
const fromBytesBigIntBase = (
  rawBytes: Uint8Array,
  bitSize: number
): IResultWithBytes<BigNumber> => {
  if (rawBytes.length < 1) {
    throw new Error('Early end of stream: no data to parse.');
  }

  const byteSize = bitSize / 8;
  const n = rawBytes[0];

  if (n > byteSize) {
    throw new Error(
      `Formatting error: byte length ${n} exceeds expected size for ${bitSize}-bit integer.`
    );
  }

  if (n + 1 > rawBytes.length) {
    throw new Error(
      'Early end of stream: insufficient data for specified byte length.'
    );
  }

  const bigIntBytes = n === 0 ? [0] : rawBytes.subarray(1, 1 + n);
  const uintBytes = rawBytes.subarray(1 + n);

  return {
    result: BigNumber.from(bigIntBytes.slice().reverse()),
    bytes: uintBytes
  };
};

/**
 * Parses a Uint128 CLValue from prefixed bytes.
 * @param rawBytes - Byte array containing the prefixed Uint128 data.
 * @returns The CLValueUInt128 parsed from the byte data.
 */
export const fromBytesUInt128 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt128> => {
  const value = fromBytesBigIntBase(rawBytes, 128);
  return { result: new CLValueUInt128(value?.result), bytes: value?.bytes };
};

/**
 * Parses a Uint256 CLValue from prefixed bytes.
 * @param rawBytes - Byte array containing the prefixed Uint256 data.
 * @returns The CLValueUInt256 parsed from the byte data.
 */
export const fromBytesUInt256 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt256> => {
  const value = fromBytesBigIntBase(rawBytes, 256);
  return { result: new CLValueUInt256(value?.result), bytes: value?.bytes };
};

/**
 * Parses a Uint512 CLValue from prefixed bytes.
 * @param rawBytes - Byte array containing the prefixed Uint512 data.
 * @returns The CLValueUInt512 parsed from the byte data.
 */
export const fromBytesUInt512 = (
  rawBytes: Uint8Array
): IResultWithBytes<CLValueUInt512> => {
  const value = fromBytesBigIntBase(rawBytes, 512);
  return { result: new CLValueUInt512(value?.result), bytes: value?.bytes };
};
