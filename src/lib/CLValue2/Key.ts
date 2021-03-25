import { concat } from '@ethersproject/bytes';

import { CLType, CLValue } from './Abstract';
import { CLURef, CLAccountHash } from './index';

enum KeyVariant {
  Account,
  Hash,
  URef
}

export class CLKeyType extends CLType {
  toString(): string {
    return 'Key';
  }
}

// TBD: Maybe the first should be CLByteArray insted?
type CLKeyParameters = Uint8Array | CLURef | CLAccountHash;

export class CLKey extends CLValue {
  data: CLKeyParameters;

  constructor(v: CLKeyParameters) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new CLKeyType();
  }

  value(): CLKeyParameters {
    return this.data;
  }

  isHash(): boolean {
    return this.data instanceof Uint8Array;
  }

  isURef(): boolean {
    return this.data instanceof CLURef;
  }

  isAccount(): boolean {
    return this.data instanceof CLAccountHash;
  }

  toBytes(): Uint8Array {
    if (this.isAccount()) {
      return concat([Uint8Array.from([KeyVariant.Account]), (this.data as CLAccountHash).toBytes()]);
    }
    if (this.isHash()) {
      return concat([Uint8Array.from([KeyVariant.Hash]), (this.data as Uint8Array)]);
    }
    if (this.isURef()) {
      return concat([Uint8Array.from([KeyVariant.URef]), (this.data as CLURef).toBytes()]);
    }

    throw new Error("Unknown byte types");
  }
}
