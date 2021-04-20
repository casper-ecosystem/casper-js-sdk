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
import { toBytesU8 } from '../ByteConverters';

const RESULT_TAG_ERROR = 0;
const RESULT_TAG_OK = 1;

export class CLResultType<
  T extends CLType,
  E extends CLErrorCodes
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
  E extends CLErrorCodes
> extends CLValue {
  data: Result<CLValue, CLErrorCodes>;
  innerOk: T;
  innerErr: E;

  constructor(
    data: Result<CLValue, CLErrorCodes>,
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
  value(): Result<CLValue, CLErrorCodes> {
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
        toBytesU8(this.data.val as number)
      ]);
    } else {
      throw new Error('Unproper data stored in CLResult');
    }
  }

  static fromBytes(
    bytes: Uint8Array,
    type: CLResultType<CLType, CLErrorCodes>
  ): ResultAndRemainder<CLResult<CLType, CLErrorCodes>, CLErrorCodes> {
    const { result: U8Res, remainder: U8Rem } = CLU8.fromBytes(bytes);
    if (!U8Res.ok) {
      return resultHelper(Err(U8Res.val));
    }

    const resultTag = U8Res.val.value().toNumber();
    const referenceErr = type.innerErr;
    const referenceOk = type.innerOk;
    const { result: valRes, remainder: valRem } = referenceOk.linksTo.fromBytes(
      U8Rem
    );

    if (!valRes.ok) {
      return resultHelper(Err(valRes.val));
    }

    if (resultTag === RESULT_TAG_ERROR) {
      const val = new CLResult(Err(valRes.val), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    if (resultTag === RESULT_TAG_OK) {
      const val = new CLResult(Ok(valRes.val as CLValue), {
        ok: referenceOk,
        err: referenceErr
      });
      return resultHelper(Ok(val), valRem);
    }

    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}

// const x = new CLResult(Ok(new CLU8(1)), new CLU8Type(), CLErrorCodes.Formatting);
