import { Result, Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLType,
  CLErrorCodes,
  ResultAndRemainder,
  resultHelper,
  CLU8
} from './index';

const RESULT_TAG_ERROR = 0;
const RESULT_TAG_OK = 1;

export class CLResultType<
  T extends CLType,
  E extends CLType
> extends CLType {
  linksTo = CLResult;
  typeId = 'Result';

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
        err: this.innerErr
      }
    };
  }
}

/**
 * Class representing a result of an operation that might have failed. Can contain either a value
 * resulting from a successful completion of a calculation, or an error. Similar to `Result` in Rust
 * or `Either` in Haskell.
 */
export class CLResult<
  T extends CLType,
  E extends CLType
> extends CLValue {
  data: Result<CLValue, CLValue>;
  innerOk: T;
  innerErr: E;

  constructor(
    data: Result<CLValue, CLValue>,
    { ok, err }: { ok: T; err: E }
  ) {
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

  toBytes(): Uint8Array {
    if (this.data instanceof Ok && this.data.val instanceof CLValue) {
      return concat([
        Uint8Array.from([RESULT_TAG_OK]),
        this.data.val.toBytes()
      ]);
    } else if (this.data instanceof Err) {
      return concat([
        Uint8Array.from([RESULT_TAG_ERROR]),
        this.data.val.toBytes()
      ]);
    } else {
      throw new Error('Unproper data stored in CLResult');
    }
  }

  static fromBytes(
    bytes: Uint8Array,
    type: CLResultType<CLType, CLType>
  ): ResultAndRemainder<CLResult<CLType, CLType>, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytes(bytes);
    if (!U8Res.ok) {
      return resultHelper(Err(U8Res.val));
    }

    const resultTag = U8Res.val.value().toNumber();
    const referenceErr = type.innerErr;
    const referenceOk = type.innerOk;

    if (resultTag === RESULT_TAG_ERROR) {
      const { result: valRes, remainder: valRem } = referenceErr.linksTo.fromBytes(
        U8Rem
      );
      const val = new CLResult(Err(valRes.val), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    if (resultTag === RESULT_TAG_OK) {
      const { result: valRes, remainder: valRem } = referenceOk.linksTo.fromBytes(
        U8Rem
      );
      const val = new CLResult(Ok(valRes.val as CLValue), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}

// const x = new CLResult(Ok(new CLU8(1)), { ok: new CLU8Type(), err: new CLU8Type() });
// const y = new CLResult(Ok(new CLU8(1)), { ok: new CLU8Type(), err: new CLU8Type() });
