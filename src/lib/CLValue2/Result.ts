import { concat } from '@ethersproject/bytes';
import { Ok, Err, Result } from 'ts-results';

import { CLType, CLValue, ToBytes } from './Abstract';
import { toBytesU8 } from '../ByteConverters';

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes,
  OutOfMemory
}

export class CLErrorType extends CLType {
  toString(): string {
    return 'Error';
  }
}

const RESULT_TAG_ERROR = 1;
const RESULT_TAG_OK = 1;

/**
 * Class representing a result of an operation that might have failed. Can contain either a value
 * resulting from a successful completion of a calculation, or an error. Similar to `Result` in Rust
 * or `Either` in Haskell.
 */
export class CLResultType extends CLType {
  toString(): string {
    return 'Result';
  }
}

export class CLResult<T extends CLValue & ToBytes, E extends CLErrorCodes>
  extends CLValue
  implements ToBytes {
  public data: T | null;
  public error: E | null;

  constructor(data: T | null, error: E | null) {
    super();
    if (data) this.data = data;
    if (error) this.error = error;
  }

  clType(): CLType {
    return new CLResultType();
  }

  value(): Result<T, E> {
    if (this.data) {
      return Ok(this.data);
    } else if (this.error) {
      return Err(this.error);
    }
  }

  public static OK<T extends CLValue & ToBytes, E extends CLErrorCodes>(
    val: T
  ): CLResult<T, E> {
    return new CLResult<T, E>(val, null);
  }

  public static Error<T extends CLValue & ToBytes, E extends CLErrorCodes>(
    err: E
  ): CLResult<T, E> {
    return new CLResult<T, E>(null, err);
  }

  toBytes(): Uint8Array {
    if (this.data) {
      return concat([Uint8Array.from([RESULT_TAG_OK]), this.data.toBytes()]);
    } else if (this.error) {
      return concat([Uint8Array.from([RESULT_TAG_ERROR]), toBytesU8(this.error)]);
    } else {
      throw new Error('Missing proper data');
    }
  }
}
