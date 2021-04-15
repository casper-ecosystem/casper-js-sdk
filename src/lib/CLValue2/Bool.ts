import {
  CLType,
  CLValue,
  ToBytes,
  FromBytes,
  ResultAndRemainder,
  CLErrorCodes,
  resultHelper,
  CLJsonFormat
} from './index';
import { encodeBase16, decodeBase16 } from '../Conversions';

import { Result, Ok, Err } from 'ts-results';

export class CLBoolType extends CLType {
  linksTo = CLBool;

  toString(): string {
    return 'Bool';
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

  toJSON(): Result<CLJsonFormat, CLErrorCodes> {
    const bytes = encodeBase16(this.toBytes());
    const clType = this.clType().toString();
    return Ok({ bytes: bytes, cl_type: clType });
  }

  static fromJSON(json: CLJsonFormat): ResultAndRemainder<CLBool, CLErrorCodes> {
    if (!json.bytes) return resultHelper(Err(CLErrorCodes.Formatting));
    const uint8bytes = decodeBase16(json.bytes);
    return CLBool.fromBytes(uint8bytes);
  }
}
