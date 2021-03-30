import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  ToBytes,
  CLURef,
  CLAccountHash,
  CLResult,
  CLErrorCodes,
  KeyVariant,
  ACCOUNT_HASH_LENGTH
} from './index';

export class CLKeyType extends CLType {
  toString(): string {
    return 'Key';
  }
}

// TBD: Maybe the first should be CLByteArray insted?
type CLKeyParameters = Uint8Array | CLURef | CLAccountHash;

export class CLKey extends CLValue implements ToBytes {
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
      return concat([
        Uint8Array.from([KeyVariant.Account]),
        (this.data as CLAccountHash).toBytes()
      ]);
    }
    if (this.isHash()) {
      return concat([
        Uint8Array.from([KeyVariant.Hash]),
        this.data as Uint8Array
      ]);
    }
    if (this.isURef()) {
      return concat([
        Uint8Array.from([KeyVariant.URef]),
        (this.data as CLURef).toBytes()
      ]);
    }

    throw new Error('Unknown byte types');
  }

  static fromBytes(bytes: Uint8Array): CLResult {
    if (bytes.length < 1) {
      return new CLResult(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const tag = bytes[0];

    if (tag === KeyVariant.Hash) {
      const hashBytes = bytes.subarray(1, ACCOUNT_HASH_LENGTH + 1);
      const key = new CLKey(hashBytes);
      return new CLResult(Ok(key), bytes.subarray(ACCOUNT_HASH_LENGTH + 1));
    } else if (tag === KeyVariant.URef) {
      const uref = CLURef.fromBytes(bytes.subarray(1));
      const urefResult = uref.value();
      if (urefResult.ok) {
        const key = new CLKey(urefResult.val);
        return new CLResult(Ok(key), uref.remainder());
      } else {
        return uref;
      }
    } else if (tag === KeyVariant.Account) {
      const accountHash = CLAccountHash.fromBytes(bytes.subarray(1));
      const accountHashResult = accountHash.value();
      if (accountHashResult.ok) {
        const key = new CLKey(accountHashResult.val);
        return new CLResult(Ok(key), accountHash.remainder());
      } else {
        return accountHash;
      }
    } else {
      return new CLResult(Err(CLErrorCodes.Formatting));
    }
  }
}
