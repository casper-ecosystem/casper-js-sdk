import { Ok, Err, Option, Some, None } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLEntity,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  CLU8,
  resultHelper
} from './index';

import { CLTypeTag } from './constants';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType<T extends CLType> extends CLType {
  static TypeId = "Option";

  tag = CLTypeTag.Option;
  linksTo = CLOption;
  inner: T;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    if (this.inner === null) {
      return `${CLOptionType.TypeId} (None)`;
    }

    return `${CLOptionType.TypeId} (${this.inner.toString()})`;
  }

  toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      this.inner.toBytes()
    ]);
  }

  toJSON(): any {
    return {
      [CLOptionType.TypeId]: this.inner.toJSON() 
    };
  }
}

export class CLOption<T extends CLEntity> extends CLEntity {
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
  ): ResultAndRemainder<CLOption<CLEntity>, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytesWithRemainder(bytes);

    const optionTag = U8Res.unwrap().value().toNumber();

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
        Ok(new CLOption(Some(valRes.val as CLEntity ))),
        valRem
      );
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}
