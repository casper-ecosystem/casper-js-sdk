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
  ResultAndRemainder,
  ToBytesResult,
  CLValueBytesParsers,
  CLValueParsers,
  CLPublicKey,
  resultHelper,
  ALIAS_ACCOUNT_HASH_TO_BYTE_ARRAY
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
      return resultHelper<CLKey, CLErrorCodes>(
        Err(CLErrorCodes.EarlyEndOfStream)
      );
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
        return resultHelper<CLKey, CLErrorCodes>(Err(urefResult.val));
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
        return resultHelper<CLKey, CLErrorCodes>(Err(accountHashResult.val));
      }
    } else {
      return resultHelper<CLKey, CLErrorCodes>(Err(CLErrorCodes.Formatting));
    }
  }
}

export type CLKeyParameters =
  | CLByteArray
  | CLURef
  | CLAccountHash
  | CLPublicKey;

export class CLKey extends CLValue {
  data: CLKeyParameters;

  constructor(v: CLKeyParameters) {
    super();
    if (!v.isCLValue) {
      throw Error('Provided parameter is not a valid CLValue');
    }
    if (v.clType().tag === CLTypeTag.PublicKey) {
      this.data = new CLAccountHash((v as CLPublicKey).toAccountHash());
      return;
    }
    this.data = v;
  }

  clType(): CLType {
    return new CLKeyType();
  }

  value(): CLKeyParameters {
    return this.data;
  }

  toJSON(): string {
    return Buffer.from(this.data.value() as Uint8Array).toString('hex');
  }

  isHash(): boolean {
    return this.data.clType().tag === CLTypeTag.ByteArray;
  }

  isURef(): boolean {
    return this.data.clType().tag === CLTypeTag.URef;
  }

  isAccount(): boolean {
    return this.data.clType().tag === ALIAS_ACCOUNT_HASH_TO_BYTE_ARRAY;
  }
}
