import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  ResultAndRemainder,
  ToBytesResult,
  CLErrorCodes,
  resultHelper
} from './index';
import { BOOL_ID, CLTypeTag } from './constants';

export class CLBoolType extends CLType {
  linksTo = CLBool;
  tag = CLTypeTag.Bool;

  toString(): string {
    return BOOL_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLBool extends CLValue {
  data: boolean;

  constructor(v: boolean) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new CLBoolType();
  }

  value(): boolean {
    return this.data;
  }

  toBytes(): ToBytesResult {
    return Ok(new Uint8Array([this.data ? 1 : 0]));
  }

  static fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLBool, CLErrorCodes> {
    if (bytes.length === 0) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    if (bytes[0] === 1) {
      return resultHelper(Ok(new CLBool(true)), bytes.subarray(1));
    } else if (bytes[0] === 0) {
      return resultHelper(Ok(new CLBool(false)), bytes.subarray(1));
    } else {
      return resultHelper(Err(CLErrorCodes.Formatting));
    }
  }
}
