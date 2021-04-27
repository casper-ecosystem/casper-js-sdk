import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  ResultAndRemainder,
  ToBytesResult,
  CLErrorCodes,
  resultHelper,
  CLValueBytesParser
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

export class CLBoolBytesParser extends CLValueBytesParser {
  toBytes(value: CLBool): ToBytesResult {
    return Ok(new Uint8Array([value.value() ? 1 : 0]));
  }

  fromBytesWithRemainder(
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

export class CLBool extends CLValue {
  data: boolean;
  bytesParser: CLBoolBytesParser;

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
