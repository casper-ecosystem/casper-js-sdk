import { CLType, CLValue, ToBytes } from './Abstract';

export class CLByteArrayType extends CLType {
  toString(): string {
    return 'ByteArray';
  }
}

export class CLByteArray extends CLValue implements ToBytes {
  data: Uint8Array;
  /**
   * Constructs a new `ByteArrayValue`.
   *
   * @param v The bytes. 
   */
  constructor(v: Uint8Array) {
    super();
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
