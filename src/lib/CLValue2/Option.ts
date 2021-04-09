import { Ok, Err, Some, None } from "ts-results";
import { concat } from '@ethersproject/bytes';

import { Option } from 'ts-results';

import { CLValue, CLType, 
  ToBytes,
  FromBytes,
  CLErrorCodes,
  ResultAndRemainder,
  CLU8,
  resultHelper
} from './index';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType<T extends CLType | null> extends CLType {
  inner: T;
  linksTo = CLOption;

  constructor(inner: T) {
    super();
    this.inner = inner;
  };

  toString(): string {
    if (this.inner === null) {
      return `Option (None)` 
    }

    return `Option (${this.inner.toString()})`;
  }
}

export class GenericOption <T> {
  /**
   * Constructs a new option containing the value of Some or None from ts-result.
   */
  constructor(public data: Option<T>) {}

  /**
   * Checks whether the `Option` contains no value.
   *
   * @returns True if the `Option` has no value.
   */
  isNone(): boolean {
    return this.data.none;
  }

  /**
   * Checks whether the `Option` contains a value.
   *
   * @returns True if the `Option` has some value.
   */
  isSome(): boolean {
    return this.data.some;
  }

  /**
   * Returns Option from ts-result based on stored value
   */
  value(): Option<T> {
    return this.data;
  }
}

export class CLOption extends GenericOption<CLValue & ToBytes> implements CLValue, ToBytes, FromBytes {
  clType(): CLType {
    if (this.data.some) {
      return new CLOptionType(this.data.val.clType());
    }
    return new CLOptionType(null);
  }

  /**
   * Serializes the `Option` into an array of bytes.
   */
  toBytes(): Uint8Array {
    if (this.data.none) {
      return Uint8Array.from([OPTION_TAG_NONE]);
    }
    if (this.data.some) {
      return concat([Uint8Array.from([OPTION_TAG_SOME]), this.data.val.toBytes()]);
    }

    throw new Error('Unknown stored value');
  }

  static fromBytes(bytes: Uint8Array, type: CLOptionType<CLType>): ResultAndRemainder<CLOption, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytes(bytes);
    if (!U8Res.ok) {
      return resultHelper(Err(U8Res.val));
    }

    const optionTag = U8Res.val.value().toNumber();

    if (optionTag === OPTION_TAG_NONE) {
      return resultHelper(Ok(new CLOption(None)), U8Rem);
    }

    if (optionTag === OPTION_TAG_SOME) {
      const referenceClass = type.inner.linksTo;
      const { result: valRes, remainder: valRem }= referenceClass.fromBytes(U8Rem);
      if (!valRes.ok) {
        return resultHelper(Err(valRes.val));
      }
      return resultHelper(Ok(new CLOption(Some(valRes.val as (CLValue & ToBytes)))), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}
