import {
  CLType,
  CLValue,
  ToBytes,
  FromBytes,
  ResultAndRemainder,
  CLErrorCodes,
  resultHelper,
} from './index';
import { BOOL_ID } from './constants';

import { Ok, Err } from 'ts-results';

export class CLBoolType extends CLType {
  linksTo = CLBool;

  toString(): string {
    return BOOL_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLBool extends CLValue implements ToBytes, FromBytes {
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

  toBytes(): Uint8Array {
    return new Uint8Array([this.data ? 1 : 0]);
  }

  static fromBytes(
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
