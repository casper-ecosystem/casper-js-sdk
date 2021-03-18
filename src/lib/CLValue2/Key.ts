import { CLType, CLValue } from './Abstract';
import { URef } from './URef';

export class AccountHashType extends CLType {
  toString(): string {
    return 'URef';
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

export enum KeyVariant {
  Account,
  Hash,
  URef
}

export class KeyValueType extends CLType {
  toString(): string {
    return 'Key';
  }
}

type KeyValueParameters = Uint8Array | URef | AccountHash;

export class KeyValue extends CLValue {
  v: Uint8Array | URef | AccountHash;
  variant: KeyVariant;

  constructor(v: KeyValueParameters, variant: KeyVariant) {
    super();
    this.v = v;
    this.variant = variant;
  }

  clType(): CLType {
    return new KeyValueType();
  }

  value(): KeyValueParameters {
    return this.v;
  }

  public isHash(): boolean {
    return this.variant === KeyVariant.Hash;
  }

  public isURef(): boolean {
    return this.variant === KeyVariant.URef;
  }

  public isAccount(): boolean {
    return this.variant === KeyVariant.Account;
  }
}
