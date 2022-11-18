// migrate from casper-types/bytesrepr.rs
// https://github.com/CasperLabs/casper-node/blob/4b9f01463845120f6c428a08e108da67b448abb1/types/src/bytesrepr.rs

'use strict';

import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { MaxUint256, NegativeOne, One, Zero } from '@ethersproject/constants';
import { arrayify, concat } from '@ethersproject/bytes';
import blake from 'blakejs';

import { CLValue, CLValueParsers, ToBytes } from './CLValue';

/**
 * Convert number to bytes
 * @param bitSize The bit size of the integer
 * @param signed `true` if the integer is signed, `false` if not
 * @returns `Uint8Array` buffer representation of the integer
 */
export const toBytesNumber = (bitSize: number, signed: boolean) => (
  value: BigNumberish
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

/**
 * @deprecated
 */
export const toBytesDeployHash = (deployHash: Uint8Array) => {
  return deployHash;
};

/**
 * Serializes a string into an array of bytes
 * @param str The string to be converted
 * @returns A `Uint8Array` representation of the string
 */
export function toBytesString(str: string): Uint8Array {
  const arr = Uint8Array.from(Buffer.from(str));
  return concat([toBytesU32(arr.byteLength), arr]);
}

/**
 * Deserializes an array of bytes into a string
 * @param byte `Uint8Array` buffer of bytes to be deserialized
 * @returns The serialized string
 */
export const fromBytesString = (byte: Uint8Array): string => {
  return Buffer.from(byte).toString();
};

/**
 * Serializes an array of u8, equal to Vec<u8> in rust.
 * @param arr `Uint8Array` buffer of u8 integers
 * @returns Serialized `Uint8Array` buffer
 */
export function toBytesArrayU8(arr: Uint8Array): Uint8Array {
  return concat([toBytesU32(arr.length), arr]);
}

/**
 * Serializes a vector of values of type `T` into an array of bytes.
 * @param vec A vector of objects of generic type `T` which extends `ToBytes`
 * @returns `Uint8Array` buffer serialized from `vec`
 */
export const toBytesVector = <T extends ToBytes>(vec: T[]): Uint8Array => {
  const valueByteList = vec.map(e => e.toBytes()).map(e => e.unwrap());
  valueByteList.splice(0, 0, toBytesU32(vec.length));
  return concat(valueByteList);
};

/**
 * Use blake2b to compute hash of ByteArray
 * @param x Byte array of type `Uint8Array` to compute the blake2b hash on
 * @returns `Uint8Array` buffer of the blake2b hash
 */
export function byteHash(x: Uint8Array): Uint8Array {
  return blake.blake2b(x, null, 32);
}

// TODO: Get rid after refactoring the whole
/**
 * @experimental
 * Serializes a vector of values of type `T` into an array of bytes.
 * @param vec A vector of objects of generic type `T` which extends `ToBytes`
 * @returns `Uint8Array` buffer serialized from `vec`
 */
export const toBytesVectorNew = <T extends CLValue>(vec: T[]): Uint8Array => {
  const valueByteList = vec.map(e => CLValueParsers.toBytes(e).unwrap());
  valueByteList.splice(0, 0, toBytesU32(vec.length));
  return concat(valueByteList);
};

// TODO: Legacy code
/**
 * @deprecated
 */
export function toBytesBytesArray(arr: Uint8Array): Uint8Array {
  return arr;
}
