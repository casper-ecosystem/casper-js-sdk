import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { NegativeOne, One, Zero } from '@ethersproject/constants';
import { arrayify, concat } from '@ethersproject/bytes';
import { blake2b } from '@noble/hashes/blake2';

/**
 * Stringifies a `BigNumberish` for the out-of-bounds errors below. `Bytes`
 * (`ArrayLike<number>`) declares no `toString`, so the type checker cannot rule
 * out `Object`'s `[object Object]` even though every value arriving here is a
 * primitive, a `BigNumber`, or a real array/typed array. The branches spell out
 * what implicit coercion did, keeping the message text identical: byte arrays
 * comma-joined, everything else via its own `toString`.
 */
const describeValue = (value: BigNumberish): string => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (BigNumber.isBigNumber(value)) {
    return value.toString();
  }
  return Array.from(value).join(',');
};

/**
 * Converts a BigNumberish value to bytes with specified bit size and signedness.
 * @param bitSize - The bit size of the integer.
 * @param signed - `true` if the integer is signed; `false` otherwise.
 * @returns A function that converts a BigNumberish value into a `Uint8Array` byte representation.
 */
export const toBytesNumber =
  (bitSize: number, signed: boolean) =>
  (value: BigNumberish): Uint8Array => {
    const val = BigNumber.from(value);

    // Shifted, not masked off `MaxUint256`: a mask cannot widen a 256-bit value,
    // so `MaxUint256.mask(512)` is 2^256-1 and rejects every legal larger U512.
    const maxUintValue = One.shl(bitSize).sub(One);

    if (signed) {
      const bounds = One.shl(bitSize - 1).sub(One);
      if (val.gt(bounds) || val.lt(bounds.add(One).mul(NegativeOne))) {
        throw new Error('value out-of-bounds, value: ' + describeValue(value));
      }
    } else if (val.lt(Zero) || val.gt(maxUintValue)) {
      throw new Error('value out-of-bounds, value: ' + describeValue(value));
    }

    const valTwos = val.toTwos(bitSize).mask(bitSize);

    const bytes = arrayify(valTwos);

    if (valTwos.gte(0)) {
      if (bitSize > 64) {
        if (valTwos.eq(0)) {
          return bytes;
        }
        return concat([bytes, Uint8Array.from([bytes.length])])
          .slice()
          .reverse();
      } else {
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
 * Converts an 8-bit unsigned integer (`u8`) to little-endian byte format.
 */
export const toBytesU8 = toBytesNumber(8, false);

/**
 * Converts an 16-bit unsigned integer (`u16`) to little-endian byte format.
 */
export const toBytesU16 = toBytesNumber(16, false);

/**
 * Converts a 32-bit signed integer (`i32`) to little-endian byte format.
 */
export const toBytesI32 = toBytesNumber(32, true);

/**
 * Converts a 32-bit unsigned integer (`u32`) to little-endian byte format.
 */
export const toBytesU32 = toBytesNumber(32, false);

/**
 * Converts a 64-bit unsigned integer (`u64`) to little-endian byte format.
 */
export const toBytesU64 = toBytesNumber(64, false);

/**
 * Converts a 64-bit signed integer (`i64`) to little-endian byte format.
 */
export const toBytesI64 = toBytesNumber(64, true);

/**
 * Converts a 128-bit unsigned integer (`u128`) to little-endian byte format.
 */
export const toBytesU128 = toBytesNumber(128, false);

/**
 * Converts a 256-bit unsigned integer (`u256`) to little-endian byte format.
 */
export const toBytesU256 = toBytesNumber(256, false);

/**
 * Converts a 512-bit unsigned integer (`u512`) to little-endian byte format.
 */
export const toBytesU512 = toBytesNumber(512, false);

/**
 * Serializes a string into a byte array.
 * @param str - The string to be converted.
 * @returns A `Uint8Array` representation of the string, including its length as a `u32` prefix.
 */
export function toBytesString(str: string): Uint8Array {
  const arr = Uint8Array.from(Buffer.from(str));
  return concat([toBytesU32(arr.byteLength), arr]);
}

/**
 * Deserializes a byte array into a string.
 * @param byte - `Uint8Array` representing the serialized string.
 * @returns The deserialized string.
 */
export const fromBytesString = (byte: Uint8Array): string => {
  return Buffer.from(byte).toString();
};

/**
 * Serializes an array of `u8` values, equivalent to `Vec<u8>` in Rust.
 * @param arr - A `Uint8Array` buffer of `u8` integers.
 * @returns A serialized `Uint8Array` with the array's length as a `u32` prefix.
 */
export function toBytesArrayU8(arr: Uint8Array): Uint8Array {
  return concat([toBytesU32(arr.length), arr]);
}

/**
 * Computes the Blake2b hash of a byte array.
 * @param x - A `Uint8Array` byte array to compute the Blake2b hash on.
 * @returns A `Uint8Array` buffer containing the 32-byte Blake2b hash.
 */
export function byteHash(x: Uint8Array): Uint8Array {
  return blake2b(x, { dkLen: 32 });
}

/**
 * Parses a 16-bit unsigned integer (`u16`) from a little-endian byte array.
 * @param bytes - The byte array containing the `u16` value.
 * @returns The parsed 16-bit unsigned integer.
 */
export function parseU16(bytes: Uint8Array): number {
  if (bytes.length < 2) {
    throw new Error('Invalid byte array for u16 parsing');
  }
  return bytes[0] | (bytes[1] << 8);
}

/**
 * Parses a 32-bit unsigned integer (`u32`) from a little-endian byte array.
 * @param bytes - The byte array containing the `u32` value.
 * @returns The parsed 32-bit unsigned integer.
 */
export function parseU32(bytes: Uint8Array): number {
  if (bytes.length < 4) {
    throw new Error('Invalid byte array for u32 parsing');
  }

  // `>>> 0` because `<< 24` produces a *signed* int32: without it every u32
  // with the high bit set comes back negative (0xFFFFFFFF parsed as -1).
  return (
    (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
  );
}

/**
 * Parses a 64-bit unsigned integer (`u64`) from a little-endian byte array.
 * @param bytes - A `Uint8Array` containing the serialized 64-bit unsigned integer.
 * @returns A `BigNumber` representing the parsed value.
 */
export const fromBytesU64 = (bytes: Uint8Array): BigNumber => {
  if (bytes.length !== 8) {
    throw new Error(
      `Invalid input length for u64: expected 8 bytes, got ${bytes.length}`
    );
  }

  // Convert the little-endian bytes into a BigNumber
  return BigNumber.from(bytes.reverse());
};

/**
 * Writes a 32-bit signed integer to a `DataView` at the specified offset.
 *
 * The integer is written in little-endian format.
 *
 * @param view - The `DataView` instance where the integer will be written.
 * @param offset - The offset (in bytes) at which to start writing.
 * @param value - The 32-bit signed integer to write.
 * @returns The new offset after writing the integer.
 *
 * @example
 * ```typescript
 * const buffer = new ArrayBuffer(8);
 * const view = new DataView(buffer);
 * let offset = 0;
 * offset = writeInteger(view, offset, 42);
 * console.log(new Int32Array(buffer)); // Logs: Int32Array [42, 0]
 * ```
 */
export const writeInteger = (
  view: DataView,
  offset: number,
  value: number
): number => {
  view.setInt32(offset, value, true);
  return offset + 4;
};

/**
 * Writes a 16-bit unsigned integer to a `DataView` at the specified offset.
 *
 * The integer is written in little-endian format.
 *
 * @param view - The `DataView` instance where the integer will be written.
 * @param offset - The offset (in bytes) at which to start writing.
 * @param value - The 16-bit unsigned integer to write.
 * @returns The new offset after writing the integer.
 *
 * @example
 * ```typescript
 * const buffer = new ArrayBuffer(4);
 * const view = new DataView(buffer);
 * let offset = 0;
 * offset = writeUShort(view, offset, 65535);
 * console.log(new Uint16Array(buffer)); // Logs: Uint16Array [65535, 0]
 * ```
 */
export const writeUShort = (
  view: DataView,
  offset: number,
  value: number
): number => {
  view.setUint16(offset, value, true);
  return offset + 2;
};

/**
 * Writes a sequence of bytes (as a `Uint8Array`) to a `DataView` at the specified offset.
 *
 * Each byte in the array is written in sequence, starting from the given offset.
 *
 * @param view - The `DataView` instance where the bytes will be written.
 * @param offset - The offset (in bytes) at which to start writing.
 * @param value - The `Uint8Array` containing the bytes to write.
 * @returns The new offset after writing the bytes.
 *
 * @example
 * ```typescript
 * const buffer = new ArrayBuffer(10);
 * const view = new DataView(buffer);
 * let offset = 0;
 * offset = writeBytes(view, offset, new Uint8Array([1, 2, 3, 4]));
 * console.log(new Uint8Array(buffer)); // Logs: Uint8Array [1, 2, 3, 4, 0, 0, 0, 0, 0, 0]
 * ```
 */
export const writeBytes = (
  view: DataView,
  offset: number,
  value: Uint8Array
): number => {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value[i]);
  }
  return offset + value.length;
};

/**
 * Expands the size of an existing ArrayBuffer to accommodate additional data if necessary.
 *
 * This function creates a new `ArrayBuffer` with a size that is at least as large as
 * the required size. The buffer's size grows exponentially (doubles) to minimize
 * reallocations and improve performance for large data handling.
 * The existing data from the old buffer is copied into the new buffer.
 *
 * @param currentBuffer - The current `ArrayBuffer` that needs to be expanded.
 * @param requiredSize - The minimum size required for the buffer.
 * @returns A new `ArrayBuffer` with enough space to accommodate the required size.
 *
 * @example
 * ```typescript
 * let buffer = new ArrayBuffer(1024);
 * const updatedBuffer = expandBuffer(buffer, 2048);
 * console.log(updatedBuffer.byteLength); // 2048 or larger (depending on initial size and required size)
 * ```
 */
export const expandBuffer = (
  currentBuffer: ArrayBuffer,
  requiredSize: number
): ArrayBuffer => {
  let newSize = currentBuffer.byteLength;
  while (newSize < requiredSize) {
    newSize *= 2; // Double the buffer size until it fits
  }
  const newBuffer = new ArrayBuffer(newSize);
  new Uint8Array(newBuffer).set(new Uint8Array(currentBuffer)); // Copy existing data
  return newBuffer;
};
