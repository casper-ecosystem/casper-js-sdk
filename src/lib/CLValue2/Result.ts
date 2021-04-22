import { Result, Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  CLU8
} from './index';
import { CLTypeTag } from "./constants";

const RESULT_TAG_ERROR = 0;
const RESULT_TAG_OK = 1;

export class CLResultType<T extends CLType, E extends CLType> extends CLType {
  linksTo = CLResult;
  typeId = 'Result';
  tag = CLTypeTag.Result;

  innerOk: T;
  innerErr: E;

  constructor({ ok, err }: { ok: T; err: E }) {
    super();
    this.innerOk = ok;
    this.innerErr = err;
  }

  toString(): string {
    return 'Result';
  }

  toJSON(): any {
    return {
      [this.typeId]: {
        ok: this.innerOk.toJSON(),
        err: this.innerErr.toJSON()
      }
    };
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
   * Checks if stored value is error
   */
  isError(): boolean {
    return this.data instanceof Err;
  }

  /**
   * Checks if stored value is valid
   */
  isOk(): boolean {
    return this.data.ok;
  }

  clType(): CLType {
    return new CLResultType({ ok: this.innerOk, err: this.innerErr });
  }

  toBytes(): ToBytesResult {
    if (this.data instanceof Ok && this.data.val instanceof CLValue) {
      return Ok(
        concat([
          Uint8Array.from([RESULT_TAG_OK]),
          this.data.val.toBytes().unwrap()
        ])
      );
    } else if (this.data instanceof Err) {
      return Ok(
        concat([
          Uint8Array.from([RESULT_TAG_ERROR]),
          this.data.val.toBytes().unwrap()
        ])
      );
    } else {
      throw new Error('Unproper data stored in CLResult');
    }
  }

  static fromBytesWithRemainder(
    bytes: Uint8Array,
    type: CLResultType<CLType, CLType>
  ): ResultAndRemainder<CLResult<CLType, CLType>, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytesWithRemainder(
      bytes
    );
    if (!U8Res.ok) {
      return resultHelper(Err(U8Res.val));
    }

    const resultTag = U8Res.val.value().toNumber();
    const referenceErr = type.innerErr;
    const referenceOk = type.innerOk;

    if (resultTag === RESULT_TAG_ERROR) {
      const {
        result: valRes,
        remainder: valRem
      } = referenceErr.linksTo.fromBytesWithRemainder(U8Rem);
      const val = new CLResult(Err(valRes.unwrap()), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    if (resultTag === RESULT_TAG_OK) {
      const {
        result: valRes,
        remainder: valRem
      } = referenceOk.linksTo.fromBytesWithRemainder(U8Rem);
      const val = new CLResult(Ok(valRes.unwrap() as CLValue), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}
