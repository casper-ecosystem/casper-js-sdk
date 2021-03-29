import { CLType, CLValue, ToBytes } from './Abstract';

export class CLAccountHashType extends CLType {
  toString(): string {
    return 'AccountHash';
  }
}

/** A cryptographic public key. */
export class CLAccountHash extends CLValue implements ToBytes {
  data: Uint8Array;
  /**
   * Constructs a new `AccountHash`.
   *
   * @param v The bytes constituting the public key.
   */
  constructor(v: Uint8Array) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new CLAccountHashType();
  }

  value(): Uint8Array {
    return this.data;
  }

  public toBytes(): Uint8Array {
    return this.data;
  }
}
