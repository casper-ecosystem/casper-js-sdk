import { CLType, CLValue } from './Abstract';
import { URef } from './URef';
import { CLAccountHash } from "./AccountHash";

export enum KeyVariant {
  Account,
  Hash,
  URef
}

export class CLKeyType extends CLType {
  toString(): string {
    return 'Key';
  }
}

type CLKeyParameters = Uint8Array | URef | CLAccountHash;

export class CLKey extends CLValue {
  data: Uint8Array | URef | CLAccountHash;
  variant: KeyVariant;

  constructor(v: CLKeyParameters, variant: KeyVariant) {
    super();
    this.data = v;
    this.variant = variant;
  }

  clType(): CLType {
    return new CLKeyType();
  }

  value(): CLKeyParameters {
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
