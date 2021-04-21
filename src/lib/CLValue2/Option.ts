import { Ok, Err, Some, None } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import { Option } from 'ts-results';

import {
  CLValue,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  CLU8,
  resultHelper
} from './index';
import { OPTION_ID } from './constants';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType<T extends CLType | null> extends CLType {
  inner: T;
  linksTo = CLOption;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    if (this.inner === null) {
      return `${OPTION_ID} (None)`;
    }

    return `${OPTION_ID} (${this.inner.toString()})`;
  }

  toJSON(): any {
    return {
      [OPTION_ID]: this.inner ? this.inner.toJSON() : null
    };
  }
}

export class CLOption<T extends CLValue> extends CLValue {
  private innerType: CLType;
  /**
   * Constructs a new option containing the value of Some or None from ts-result.
   */
  constructor(public data: Option<T>, innerType?: CLType) {
    super();
    if (data.none) {
      if (!innerType) {
        throw new Error('You had to assign innerType for None');
      }
      this.innerType = innerType;
    } else {
      this.innerType = data.val.clType();
    }
    super();
  }

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
  clType(): CLType {
    return new CLOptionType(this.innerType);
  }

  /**
   * Serializes the `Option` into an array of bytes.
   */
  toBytes(): ToBytesResult {
    if (this.data.none) {
      return Ok(Uint8Array.from([OPTION_TAG_NONE]));
    }
    if (this.data.some) {
      return Ok(concat([
        Uint8Array.from([OPTION_TAG_SOME]),
        this.data.val.toBytes().unwrap()
      ]));
    }

    return Err(CLErrorCodes.UnknownValue);
  }

  static fromBytesWithRemainder(
    bytes: Uint8Array,
    type: CLOptionType<CLType>
  ): ResultAndRemainder<CLOption<CLValue>, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytesWithRemainder(bytes);
    if (!U8Res.ok) {
      return resultHelper(Err(U8Res.val));
    }

    const optionTag = U8Res.val.value().toNumber();

    if (optionTag === OPTION_TAG_NONE) {
      return resultHelper(Ok(new CLOption(None, type.inner)), U8Rem);
    }

    if (optionTag === OPTION_TAG_SOME) {
      const referenceClass = type.inner.linksTo;
      const { result: valRes, remainder: valRem } = referenceClass.fromBytesWithRemainder(
        U8Rem
      );
      if (!valRes.ok) {
        return resultHelper(Err(valRes.val));
      }
      return resultHelper(
        Ok(new CLOption(Some(valRes.val as CLValue ))),
        valRem
      );
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}
