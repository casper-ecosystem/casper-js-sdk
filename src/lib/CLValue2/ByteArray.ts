import { CLType, CLValue } from './Abstract';

export class ByteArrayValueType extends CLType {
  toString(): string {
    return 'ByteArray';
  }
}

export class ByteArrayValue extends CLValue {
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
    return new ByteArrayValueType();
  }

  value(): Uint8Array {
    return this.data;
  }
}
