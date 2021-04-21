// NOTE: Revisit in future based on https://docs.rs/casper-types/1.0.1/casper_types/enum.Key.html
import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  ToBytes,
  CLURef,
  CLAccountHash,
  CLErrorCodes,
  KeyVariant,
  ACCOUNT_HASH_LENGTH,
  ResultAndRemainder,
  resultHelper
} from './index';
import { KEY_ID } from './constants';

export class CLKeyType extends CLType {
  linksTo = CLKey;

  toString(): string {
    return KEY_ID;
  }

  toJSON(): string {
    return this.toString();
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

  static fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLKey, CLErrorCodes> {
    if (bytes.length < 1) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const tag = bytes[0];

    if (tag === KeyVariant.Hash) {
      const hashBytes = bytes.subarray(1, ACCOUNT_HASH_LENGTH + 1);
      const key = new CLKey(hashBytes);
      return resultHelper(Ok(key), bytes.subarray(ACCOUNT_HASH_LENGTH + 1));
    } else if (tag === KeyVariant.URef) {
      const { result: urefResult, remainder: urefRemainder } = CLURef.fromBytesWithRemainder(
        bytes.subarray(1)
      );

      if (urefResult.ok) {
        const key = new CLKey(urefResult.val);
        return resultHelper(Ok(key), urefRemainder);
      } else {
        return resultHelper(Err(urefResult.val));
      }
    } else if (tag === KeyVariant.Account) {
      const {
        result: accountHashResult,
        remainder: accountHashRemainder
      } = CLAccountHash.fromBytesWithRemainder(bytes.subarray(1));
      if (accountHashResult.ok) {
        const key = new CLKey(accountHashResult.val);
        return resultHelper(Ok(key), accountHashRemainder);
      } else {
        return resultHelper(Err(accountHashResult.val));
      }
    } else {
      return resultHelper(Err(CLErrorCodes.Formatting));
    }
  }
}
