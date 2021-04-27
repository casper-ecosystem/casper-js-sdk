// NOTE: Revisit in future based on https://docs.rs/casper-types/1.0.1/casper_types/enum.Key.html
import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLURef,
  CLURefBytesParser,
  CLAccountHash,
  CLAccountHashBytesParser,
  CLErrorCodes,
  KeyVariant,
  ACCOUNT_HASH_LENGTH,
  ResultAndRemainder,
  ToBytesResult,
  CLValueBytesParsers,
  CLValueParsers,
  resultHelper
} from './index';
import { KEY_ID, CLTypeTag } from './constants';

export class CLKeyType extends CLType {
  linksTo = CLKey;
  tag = CLTypeTag.Key;

  toString(): string {
    return KEY_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLKeyBytesParser extends CLValueBytesParsers {
  toBytes(value: CLKey): ToBytesResult {
    if (value.isAccount()) {
      return Ok(
        concat([
          Uint8Array.from([KeyVariant.Account]),
          // NOTE: We are using CLAccountHashBytesParser directly because CLAccountHash isn't publicly available.
          new CLAccountHashBytesParser().toBytes(value.data as CLAccountHash).unwrap()
        ])
      );
    }
    if (value.isHash()) {
      return Ok(
        concat([Uint8Array.from([KeyVariant.Hash]), value.data as Uint8Array])
      );
    }
    if (value.isURef()) {
      return Ok(
        concat([
          Uint8Array.from([KeyVariant.URef]),
          CLValueParsers.toBytes(value.data as CLURef).unwrap()
        ])
      );
    }

    throw new Error('Unknown byte types');
  }

  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLKey, CLErrorCodes> {
    if (bytes.length < 1) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const tag = bytes[0];

    // TODO: Review if fromBytesWithRemainder() usage is needed here
    if (tag === KeyVariant.Hash) {
      const hashBytes = bytes.subarray(1, ACCOUNT_HASH_LENGTH + 1);
      const key = new CLKey(hashBytes);
      return resultHelper(Ok(key), bytes.subarray(ACCOUNT_HASH_LENGTH + 1));
    } else if (tag === KeyVariant.URef) {
      const {
        result: urefResult,
        remainder: urefRemainder
      } = new CLURefBytesParser().fromBytesWithRemainder(bytes.subarray(1));
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
      } = new CLAccountHashBytesParser().fromBytesWithRemainder(
        bytes.subarray(1)
      ); 
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

// TBD: Maybe the first should be CLByteArray insted?
export type CLKeyParameters = Uint8Array | CLURef | CLAccountHash;

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
}
