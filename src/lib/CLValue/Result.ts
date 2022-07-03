import { Result, Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLValueParsers,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  CLU8BytesParser,
  CLValueBytesParsers,
  matchByteParserByCLType
} from './index';
import { CLTypeTag, RESULT_ID } from './constants';

const RESULT_TAG_ERROR = 0;
const RESULT_TAG_OK = 1;

export class CLResultType<T extends CLType, E extends CLType> extends CLType {
  linksTo = CLResult;
  tag = CLTypeTag.Result;

  innerOk: T;
  innerErr: E;

  constructor({ ok, err }: { ok: T; err: E }) {
    super();
    this.innerOk = ok;
    this.innerErr = err;
  }

  toString(): string {
    return `${RESULT_ID} (OK: ${this.innerOk.toString()}, ERR: ${this.innerOk.toString()})`;
  }

  toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      this.innerOk.toBytes(),
      this.innerErr.toBytes()
    ]);
  }

  toJSON(): any {
    return {
      [RESULT_ID]: {
        ok: this.innerOk.toJSON(),
        err: this.innerErr.toJSON()
      }
    };
  }
}

export class CLResultBytesParser extends CLValueBytesParsers {
  toBytes(value: CLResult<CLType, CLType>): ToBytesResult {
    if (value.isOk() && value.data.val.isCLValue) {
      return Ok(
        concat([
          Uint8Array.from([RESULT_TAG_OK]),
          CLValueParsers.toBytes(value.data.val).unwrap()
        ])
      );
    } else if (value.isError()) {
      return Ok(
        concat([
          Uint8Array.from([RESULT_TAG_ERROR]),
          CLValueParsers.toBytes(value.data.val).unwrap()
        ])
      );
    } else {
      throw new Error('Unproper data stored in CLResult');
    }
  }

  fromBytesWithRemainder(
    bytes: Uint8Array,
    type: CLResultType<CLType, CLType>
  ): ResultAndRemainder<CLResult<CLType, CLType>, CLErrorCodes> {
    const {
      result: U8Res,
      remainder: U8Rem
    } = new CLU8BytesParser().fromBytesWithRemainder(bytes);

    if (!U8Rem) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const resultTag = U8Res.unwrap()
      .value()
      .toNumber();
    const referenceErr = type.innerErr;
    const referenceOk = type.innerOk;

    if (resultTag === RESULT_TAG_ERROR) {
      const parser = matchByteParserByCLType(referenceErr).unwrap();
      const {
        result: valRes,
        remainder: valRem
      } = parser.fromBytesWithRemainder(U8Rem, type.innerErr);

      const val = new CLResult(Err(valRes.unwrap()), {
        ok: referenceOk,
        err: referenceErr
      });

      return resultHelper(Ok(val), valRem);
    }

    if (resultTag === RESULT_TAG_OK) {
      const parser = matchByteParserByCLType(referenceOk).unwrap();
      const {
        result: valRes,
        remainder: valRem
      } = parser.fromBytesWithRemainder(U8Rem, type.innerOk);

      const val = new CLResult(Ok(valRes.unwrap()), {
        ok: referenceOk,
        err: referenceErr
      });

      return resultHelper(Ok(val), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}

/**
 * Class representing a result of an operation that might have failed. Can contain either a value
 * resulting from a successful completion of a calculation, or an error. Similar to `Result` in Rust
 * or `Either` in Haskell.
 */
export class CLResult<T extends CLType, E extends CLType> extends CLValue {
  data: Result<CLValue, CLValue>;
  innerOk: T;
  innerErr: E;

  constructor(data: Result<CLValue, CLValue>, { ok, err }: { ok: T; err: E }) {
    super();
    this.data = data;
    this.innerOk = ok;
    this.innerErr = err;
  }

  /**
   * Returns Result from ts-result based on stored value
   */
  value(): Result<CLValue, CLValue> {
    return this.data;
  }

  /**
   * Returns JSON representation. If None null will be returned.
   */
  toJSON(): any {
    return this.data.unwrap().toJSON();
  }

  /**
   * Checks if stored value is error
   */
  isError(): boolean {
    return this.data.err && !this.data.ok;
  }

  /**
   * Checks if stored value is valid
   */
  isOk(): boolean {
    return this.data.ok && !this.data.err;
  }

  clType(): CLType {
    return new CLResultType({ ok: this.innerOk, err: this.innerErr });
  }
}
