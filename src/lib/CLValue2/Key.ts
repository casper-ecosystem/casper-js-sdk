import { CLType, CLValue } from './Abstract';
import { URef } from './URef';
import { AccountHash } from "./AccountHash";

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
  data: Uint8Array | URef | AccountHash;
  variant: KeyVariant;

  constructor(v: KeyValueParameters, variant: KeyVariant) {
    super();
    this.data = v;
    this.variant = variant;
  }

  clType(): CLType {
    return new KeyValueType();
  }

  value(): KeyValueParameters {
    return this.data;
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
