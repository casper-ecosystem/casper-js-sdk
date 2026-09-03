import { concat } from '@ethersproject/bytes';
import { Hash } from './Hash';
import { PrefixName } from './PrefixName';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum representing types of byte code within the system.
 */
enum ByteCodeKind {
  /** Represents an empty byte code type. */
  EmptyKind = 0,
  /** Represents a V1 Casper WASM byte code type. */
  V1CasperWasmKind = 1
}

const EmptyPrefix = 'empty-';
const V1WasmPrefix = 'v1-wasm-';

/**
 * Custom error class for ByteCode-related errors.
 */
class ByteCodeError extends Error {
  /** Error for an invalid byte code format. */
  static ErrInvalidByteCodeFormat = new ByteCodeError(
    'Invalid ByteCode format'
  );
  /** Error for an invalid byte code kind. */
  static ErrInvalidByteCodeKind = new ByteCodeError('Invalid ByteCodeKind');

  constructor(message: string) {
    super(message);
    this.name = 'ByteCodeError';
  }
}

/**
 * Represents a byte code in the system, providing support for V1 Casper WASM or an empty byte code.
 */
export class ByteCode {
  private V1CasperWasm?: Hash;
  private isEmpty: boolean;

  /**
   * Constructs a new ByteCode instance.
   * @param V1CasperWasm - The hash representing V1 Casper WASM byte code.
   * @param isEmpty - Whether the byte code is empty. Default is `false`.
   */
  constructor(V1CasperWasm?: Hash, isEmpty = false) {
    this.V1CasperWasm = V1CasperWasm;
    this.isEmpty = isEmpty;
  }

  /**
   * Creates a ByteCode from a JSON string representation.
   * @param data - The JSON string representation of the ByteCode.
   * @returns A new ByteCode instance.
   * @throws ByteCodeError.ErrInvalidByteCodeFormat if the format is invalid.
   */
  static fromJSON(data: string): ByteCode {
    if (data.startsWith(V1WasmPrefix)) {
      return new ByteCode(Hash.fromHex(data.replace(V1WasmPrefix, '')));
    } else if (data.startsWith(EmptyPrefix)) {
      return new ByteCode(undefined, true);
    } else {
      throw ByteCodeError.ErrInvalidByteCodeFormat;
    }
  }

  /**
   * Converts the ByteCode instance to its JSON string representation.
   * @returns The JSON string representation of the ByteCode.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Determines if the ByteCode instance represents an empty byte code.
   * @returns True if the byte code is empty; otherwise, false.
   */
  isEmptyCode(): boolean {
    return this.isEmpty;
  }

  /**
   * Returns a prefixed string representation of the ByteCode.
   * @returns A prefixed string based on the byte code type.
   * @throws Error if the ByteCode type is unexpected.
   */
  toPrefixedString(): string {
    if (this.V1CasperWasm) {
      return PrefixName.ByteCode + V1WasmPrefix + this.V1CasperWasm.toHex();
    } else if (this.isEmpty) {
      const emptyHash = Hash.fromBytes(new Uint8Array(Hash.ByteHashLen).fill(0))
        ?.result;
      return PrefixName.ByteCode + EmptyPrefix + emptyHash.toHex();
    } else {
      throw new Error('Unexpected ByteCode type');
    }
  }

  /**
   * Creates a ByteCode instance from a byte array representation.
   * @param bytes - The byte array.
   * @returns An object with the new ByteCode instance and remaining bytes.
   * @throws ByteCodeError.ErrInvalidByteCodeFormat if the format is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<ByteCode> {
    const tag = bytes[0];
    const kind = this.newByteCodeKindFromByte(tag);
    switch (kind) {
      case ByteCodeKind.EmptyKind:
        return { result: new ByteCode(undefined, true), bytes };
      case ByteCodeKind.V1CasperWasmKind: {
        const wasmHash = Hash.fromBytes(
          bytes.subarray(1, Hash.ByteHashLen + 1)
        );
        return {
          result: new ByteCode(wasmHash?.result),
          bytes: wasmHash?.bytes
        };
      }
      default:
        throw ByteCodeError.ErrInvalidByteCodeFormat;
    }
  }

  /**
   * Converts a byte to its corresponding ByteCodeKind.
   * @param tag - The byte to convert.
   * @returns The corresponding ByteCodeKind.
   * @throws ByteCodeError.ErrInvalidByteCodeKind if the byte doesn't match a valid ByteCodeKind.
   */
  static newByteCodeKindFromByte(tag: number): ByteCodeKind {
    if (tag in ByteCodeKind) {
      return tag as ByteCodeKind;
    }
    throw ByteCodeError.ErrInvalidByteCodeKind;
  }

  /**
   * Converts the ByteCode instance to a byte array representation.
   * @returns The byte array representation of the ByteCode.
   * @throws Error if the ByteCode type is unexpected.
   */
  toBytes(): Uint8Array {
    if (this.V1CasperWasm) {
      const kindBytes = new Uint8Array([ByteCodeKind.V1CasperWasmKind]);
      const wasmBytes = this.V1CasperWasm.toBytes();
      return concat([kindBytes, wasmBytes]);
    } else if (this.isEmpty) {
      return new Uint8Array([ByteCodeKind.EmptyKind]);
    } else {
      throw new Error('Unexpected ByteCode type');
    }
  }
}
