// migrate from casper-types/bytesrepr.rs
// https://github.com/CasperLabs/casper-node/blob/4b9f01463845120f6c428a08e108da67b448abb1/types/src/bytesrepr.rs

'use strict';

import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { MaxUint256, NegativeOne, One, Zero } from '@ethersproject/constants';
import { arrayify, concat } from '@ethersproject/bytes';
import { CLValue, ToBytes } from './CLValue';

/**
 * Convert number to bytes
 */
export const toBytesNumber = (
  bitSize: number,
  signed: boolean,
  value: BigNumberish
) => {
  let v = BigNumber.from(value);

  // Check bounds are safe for encoding
  const maxUintValue = MaxUint256.mask(bitSize);
  if (signed) {
    const bounds = maxUintValue.mask(bitSize - 1); // 1 bit for signed
    if (v.gt(bounds) || v.lt(bounds.add(One).mul(NegativeOne))) {
      throw new Error('value out-of-bounds, value: ' + value);
    }
  } else if (v.lt(Zero) || v.gt(maxUintValue.mask(bitSize))) {
    throw new Error('value out-of-bounds, value: ' + value);
  }
  v = v.toTwos(bitSize).mask(bitSize);
  const bytes = arrayify(v);
  if (v.gte(0)) {
    // for positive number, we had to deal with paddings
    if (bitSize > 64) {
      // for u128, u256, u512, we have to and append extra byte for length
      return concat([bytes, Uint8Array.from([bytes.length])]).reverse();
    } else {
      // for other types, we have to add padding 0s
      const byteLength = bitSize / 8;
      return concat([
        bytes.reverse(),
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
export function toBytesU8(u8: BigNumberish): Uint8Array {
  return toBytesNumber(8, false, u8);
}

/**
 * Converts `i32` to little endian.
 */
export function toBytesI32(i32: BigNumberish): Uint8Array {
  return toBytesNumber(32, true, i32);
}

/**
 * Converts `u32` to little endian.
 */
export function toBytesU32(u32: BigNumberish): Uint8Array {
  return toBytesNumber(32, false, u32);
}

/**
 * Converts `u64` to little endian.
 */
export function toBytesU64(u64: BigNumberish): Uint8Array {
  return toBytesNumber(64, false, u64);
}

/**
 * Converts `i64` to little endian.
 */
export function toBytesI64(i64: BigNumberish): Uint8Array {
  return toBytesNumber(64, true, i64);
}

/**
 * Converts `u128` to little endian.
 */
export function toBytesU128(u128: BigNumberish): Uint8Array {
  return toBytesNumber(128, false, u128);
}

/**
 * Converts `u256` to little endian.
 */
export function toBytesU256(u256: BigNumberish): Uint8Array {
  return toBytesNumber(256, false, u256);
}

export function toBytesDeployHash(deployHash: Uint8Array) {
  return toBytesBytesArray(deployHash);
}

/**
 * Converts `u512` to little endian.
 */
export function toBytesU512(u512: BigNumberish): Uint8Array {
  return toBytesNumber(512, false, u512);
}

/**
 * Serializes a string into an array of bytes.
 */
export function toBytesString(str: string): Uint8Array {
  const arr = Uint8Array.from(Buffer.from(str));
  return concat([toBytesU32(arr.byteLength), arr]);
}

/**
 * Serializes an array of u8, equal to Vec<u8> in rust.
 */
export function toBytesArrayU8(arr: Uint8Array): Uint8Array {
  return concat([toBytesU32(arr.length), arr]);
}

/**
 * Serializes an byteArray, equal to [u8;n] in rust.
 */
export function toBytesBytesArray(arr: Uint8Array): Uint8Array {
  return arr;
}

/**
 * Serializes a vector of values of type `T` into an array of bytes.
 */
export function toBytesVecT<T extends ToBytes>(vec: T[]) {
  const valueByteList = vec.map(e => e.toBytes());
  valueByteList.splice(0, 0, toBytesU32(vec.length));
  return concat(valueByteList);
}

/**
 * Serializes a list of strings into an array of bytes.
 */
export function toBytesStringList(arr: string[]) {
  return toBytesVecT(arr.map(e => CLValue.string(e)));
}
