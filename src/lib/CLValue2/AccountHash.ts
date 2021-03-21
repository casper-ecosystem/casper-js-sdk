import { CLType, CLValue } from './Abstract';

export class AccountHashType extends CLType {
  toString(): string {
    return 'AccountHash';
  }
}

/** A cryptographic public key. */
export class AccountHash extends CLValue {
  v: Uint8Array;
  /**
   * Constructs a new `AccountHash`.
   *
   * @param v The bytes constituting the public key.
   */
  constructor(v: Uint8Array) {
    super();
    this.v = v;
  }

  clType(): CLType {
    return new AccountHashType();
  }

  value(): Uint8Array {
    return this.v;
  }
}


