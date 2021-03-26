import { CLType, CLValue, ToBytes } from './Abstract';

export const CL_BYTE_ARRAY_MAX_LENGTH = 32;

export class CLByteArrayType extends CLType {
  toString(): string {
    return 'ByteArray';
  }
}

export class CLByteArray extends CLValue implements ToBytes {
  data: Uint8Array;
  /**
   * Constructs a new `CLByteArray`.
   *
   * @param v The bytes array with max length 32.
   */
  constructor(v: Uint8Array) {
    super();
    if (v.length > CL_BYTE_ARRAY_MAX_LENGTH) {
      throw new Error(`Provided value has length ${v.length} which exceeded the limit (${CL_BYTE_ARRAY_MAX_LENGTH})`)
    }
    this.data = v;
  }

  clType(): CLType {
    return new CLByteArrayType();
  }

  value(): Uint8Array {
    return this.data;
  }

  toBytes(): Uint8Array {
    return this.data;
  }
}
