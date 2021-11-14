// NOTE: Revisit in future based on https://docs.rs/casper-types/1.0.1/casper_types/enum.Key.html

import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLByteArray,
  CLByteArrayType,
  CLByteArrayBytesParser,
  CLURef,
  CLURefBytesParser,
  CLAccountHash,
  CLAccountHashBytesParser,
  CLErrorCodes,
  KeyVariant,
  // ACCOUNT_HASH_LENGTH,
  ResultAndRemainder,
  ToBytesResult,
  CLValueBytesParsers,
  CLValueParsers,
  resultHelper
} from './index';
import { KEY_ID, CLTypeTag } from './constants';

const HASH_LENGTH = 32;

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
          new CLAccountHashBytesParser()
            .toBytes(value.data as CLAccountHash)
            .unwrap()
        ])
      );
    }
    if (value.isHash()) {
      return Ok(
        concat([
          Uint8Array.from([KeyVariant.Hash]),
          new CLByteArrayBytesParser()
            .toBytes(value.data as CLByteArray)
            .unwrap()
        ])
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

    if (tag === KeyVariant.Hash) {
      const hashBytes = bytes.subarray(1);
      const {
        result: hashResult,
        remainder: hashRemainder
      } = new CLByteArrayBytesParser().fromBytesWithRemainder(
        hashBytes,
        new CLByteArrayType(HASH_LENGTH)
      );
      const hash = hashResult.unwrap();
      const key = new CLKey(hash);
      return resultHelper(Ok(key), hashRemainder);
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

export type CLKeyParameters = CLByteArray | CLURef | CLAccountHash;

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
    return this.data instanceof CLByteArray;
  }

  isURef(): boolean {
    return this.data instanceof CLURef;
  }

  isAccount(): boolean {
    return this.data instanceof CLAccountHash;
  }
}
