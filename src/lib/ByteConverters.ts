// migrate from casper-types/bytesrepr.rs
// https://github.com/CasperLabs/casper-node/blob/4b9f01463845120f6c428a08e108da67b448abb1/types/src/bytesrepr.rs

'use strict';

import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { MaxUint256, NegativeOne, One, Zero } from '@ethersproject/constants';
import { arrayify, concat } from '@ethersproject/bytes';
import { CLValue, CLValueParsers, ToBytes } from './CLValue';

const arrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};

/**
 * Convert number to bytes
 */
export const toBytesNumber = (bitSize: number, signed: boolean) => (
  value: BigNumberish,
  originalBytes?: Uint8Array
): Uint8Array => {
  const val = BigNumber.from(value);

  // Check bounds are safe for encoding
  const maxUintValue = MaxUint256.mask(bitSize);

  if (signed) {
    const bounds = maxUintValue.mask(bitSize - 1); // 1 bit for signed
    if (val.gt(bounds) || val.lt(bounds.add(One).mul(NegativeOne))) {
      throw new Error('value out-of-bounds, value: ' + value);
    }
  } else if (val.lt(Zero) || val.gt(maxUintValue.mask(bitSize))) {
    throw new Error('value out-of-bounds, value: ' + value);
  }

  const valTwos = val.toTwos(bitSize).mask(bitSize);

  const bytes = arrayify(valTwos);

  if (valTwos.gte(0)) {
    // for positive number, we had to deal with paddings
    if (bitSize > 64) {
      // if zero just return zero
      if (valTwos.eq(0)) {
        // NOTE: this is for historicial deploys that had zero represented as `0100`.
        if (
          originalBytes &&
          arrayEquals(originalBytes, Uint8Array.from([1, 0]))
        ) {
          return originalBytes;
        }
        return bytes;
      }
      // for u128, u256, u512, we have to and append extra byte for length
      return concat([bytes, Uint8Array.from([bytes.length])])
        .slice()
        .reverse();
    } else {
      // for other types, we have to add padding 0s
      const byteLength = bitSize / 8;
      return concat([
        bytes.slice().reverse(),
        new Uint8Array(byteLength - bytes.length)
      ]);
    }
  } else {
    return bytes.reverse();
  }
};

/**
 * Converts `u8` to little endian.
 */
export const toBytesU8 = toBytesNumber(8, false);

/**
 * Converts `i32` to little endian.
 */
export const toBytesI32 = toBytesNumber(32, true);

/**
 * Converts `u32` to little endian.
 */
export const toBytesU32 = toBytesNumber(32, false);

/**
 * Converts `u64` to little endian.
 */
export const toBytesU64 = toBytesNumber(64, false);

/**
 * Converts `i64` to little endian.
 */
export const toBytesI64 = toBytesNumber(64, true);

/**
 * Converts `u128` to little endian.
 */
export const toBytesU128 = toBytesNumber(128, false);

/**
 * Converts `u256` to little endian.
 */
export const toBytesU256 = toBytesNumber(256, false);

/**
 * Converts `u512` to little endian.
 */
export const toBytesU512 = toBytesNumber(512, false);

// This probably might be removed
export const toBytesDeployHash = (deployHash: Uint8Array) => {
  return deployHash;
};

/**
 * Serializes a string into an array of bytes.
 */
export function toBytesString(str: string): Uint8Array {
  const arr = Uint8Array.from(Buffer.from(str));
  return concat([toBytesU32(arr.byteLength), arr]);
}

export const fromBytesString = (byte: Uint8Array): string => {
  return Buffer.from(byte).toString();
};

/**
 * Serializes an array of u8, equal to Vec<u8> in rust.
 */
export function toBytesArrayU8(arr: Uint8Array): Uint8Array {
  return concat([toBytesU32(arr.length), arr]);
}

/**
 * Serializes a vector of values of type `T` into an array of bytes.
 */
export const toBytesVector = <T extends ToBytes>(vec: T[]): Uint8Array => {
  const valueByteList = vec.map(e => e.toBytes()).map(e => e.unwrap());
  valueByteList.splice(0, 0, toBytesU32(vec.length));
  return concat(valueByteList);
};

// TODO: Get rid after refactoring the whole
export const toBytesVectorNew = <T extends CLValue>(vec: T[]): Uint8Array => {
  const valueByteList = vec.map(e => CLValueParsers.toBytes(e).unwrap());
  valueByteList.splice(0, 0, toBytesU32(vec.length));
  return concat(valueByteList);
};

// TODO: Legacy code
/**
 * Serializes an byteArray, equal to [u8;n] in rust.
 */
export function toBytesBytesArray(arr: Uint8Array): Uint8Array {
  return arr;
}
