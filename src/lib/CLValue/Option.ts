import { Ok, Err, Option, Some, None } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLValueParsers,
  CLValueBytesParsers,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  CLU8BytesParser,
  resultHelper,
  matchByteParserByCLType
} from './index';

import { CLTypeTag, OPTION_TYPE } from './constants';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType<T extends CLType> extends CLType {
  tag = CLTypeTag.Option;
  linksTo = OPTION_TYPE;
  inner: T;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    if (this.inner === null) {
      return `${OPTION_TYPE} (None)`;
    }

    return `${OPTION_TYPE} (${this.inner.toString()})`;
  }

  toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.tag]), this.inner.toBytes()]);
  }

  toJSON(): any {
    return {
      [OPTION_TYPE]: this.inner.toJSON()
    };
  }
}

export class CLOptionBytesParser extends CLValueBytesParsers {
  /**
   * Serializes the `Option` into an array of bytes.
   */
  toBytes(value: CLOption<CLValue>): ToBytesResult {
    if (value.data.none) {
      return Ok(Uint8Array.from([OPTION_TAG_NONE]));
    }
    if (value.data.some) {
      return Ok(
        concat([
          Uint8Array.from([OPTION_TAG_SOME]),
          CLValueParsers.toBytes(value.data.unwrap()).unwrap()
        ])
      );
    }

    return Err(CLErrorCodes.UnknownValue);
  }

  fromBytesWithRemainder(
    bytes: Uint8Array,
    type: CLOptionType<CLType>
  ): ResultAndRemainder<CLOption<CLValue>, CLErrorCodes> {
    const {
      result: U8Res,
      remainder: U8Rem
    } = new CLU8BytesParser().fromBytesWithRemainder(bytes);

    const optionTag = U8Res.unwrap()
      .value()
      .toNumber();

    if (optionTag === OPTION_TAG_NONE) {
      return resultHelper(Ok(new CLOption(None, type.inner)), U8Rem);
    }

    if (optionTag === OPTION_TAG_SOME) {
      if (!U8Rem) return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
      const parser = matchByteParserByCLType(type.inner).unwrap();
      const {
        result: valRes,
        remainder: valRem
      } = parser.fromBytesWithRemainder(U8Rem, type.inner);

      const clValue = valRes.unwrap();
      return resultHelper(Ok(new CLOption(Some(clValue))), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
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

  toJSON(): any {
    return this.isNone() ? null : this.data.unwrap().toJSON();
  }

  clType(): CLType {
    return new CLOptionType(this.innerType);
  }
}
