/**
 * Functions to convert data to the FFI
 * @packageDocumentation
 */

type Serializer<T> = (arg: T) => Uint8Array;

/**
 * Help function to serialize size
 *
 * @param size
 * @constructor
 */
const Size: Serializer<number> = size => {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32LE(size, 0);
  return buffer;
};

/**
 * `Array[Byte]` serializes as follows:
 *  1) your array of bytes
 *
 * So for `[1,2,3,4,5,6]` it serializes to`[1, 2, 3, 4, 5, 6]`
 *
 * @param bytes
 */
export const ByteArrayArg: Serializer<Uint8Array> = bytes => {
  return Buffer.from(bytes);
};

/**
 * Serialize ByteArray
 *
 * `Seq[Byte]` serializes as follows:
 *  1) length of the array as 4 bytes
 *  2) your array of bytes
 *
 * So for `[1,2,3,4,5,6]` it serializes to`[6, 0, 0, 0, 1, 2, 3, 4, 5, 6]`
 */
export const ByteSequenceArg: Serializer<Uint8Array> = bytes => {
  return Buffer.concat([Size(bytes.length), bytes].map(Buffer.from));
};

/**
 * Serialize public key
 *
 * A public key is the same as array but it's expected to be 32 bytes long exactly.
 * It's `[u8; 32]` (32 element byte array) but serializes to `(32.toBytes() ++ array.toBytes())`
 * We serialize 32(literally, number 32) to 4 bytes instead of 1 byte, little endianness.
 * This is how`111..11` public key looks like when serialized:
 * [32, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
 */
export const PublicKeyArg = ByteArrayArg;

/**
 * Serialize UINT64
 *
 * @param value
 */
export const UInt64Arg: Serializer<bigint> = value => {
  const u64Buffer = Buffer.alloc(8);
  u64Buffer.writeBigUInt64LE(value, 0);
  return u64Buffer;
};

/**
 * Combine multiple arguments.
 *
 * so, what you want to send is`Vec(PublicKey, u64)`:
 * • `PublicKey` serializes to`byte array of the key`,
 * • `u64` serializes to`8 byte array`,
 *
 * so, what we have is(for example):
 *  `Vec([32, 0, 0, 0, {public key bytes}], [1, 2, 3, 4, 0, 0, 0, 0])`
 *
 * Which gives us:
 * `[2, 0, 0, 0`  - for the number of elements in the external vector
 * `32, 0, 0, 0, 1, 1, …` - public key
 * `8, 0, 0, 0, ` - for the number of bytes in the second element of the vector.
 * That was serialized `u64` (`[1, 2, 3, 4, 0, 0, 0, 0]`)
 * `1, 2, 3, 4, 0, 0, 0, 0]`
 */
export function Args(...args: Uint8Array[]): Uint8Array {
  const arrays = [Size(args.length)].concat(args.map(ByteSequenceArg));
  return Buffer.concat(arrays.map(Buffer.from));
}
