import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  CLU32,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  CLErrorCodes
} from './index';
import { STRING_ID, CLTypeTag } from './constants';
import { toBytesString, fromBytesString } from '../ByteConverters';

export class CLStringType extends CLType {
  linksTo = CLString;
  tag = CLTypeTag.String;

  toString(): string {
    return STRING_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLString extends CLValue {
  data: string;

  constructor(v: string) {
    super();
    if (typeof v !== 'string') {
      throw new Error(
        `Wrong data type, you should provide string, but you provided ${typeof v}`
      );
    }
    this.data = v;
  }

  clType(): CLType {
    return new CLStringType();
  }

  value(): string {
    return this.data;
  }

  size(): number {
    return this.data.length;
  }

  toBytes(): ToBytesResult {
    return Ok(toBytesString(this.data));
  }

  static fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLString, CLErrorCodes> {
    const {
      result: CLU32res,
      remainder: CLU32rem
    } = CLU32.fromBytesWithRemainder(rawBytes);
    if (!CLU32res.ok) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const len = CLU32res.val.value().toNumber();

    if (CLU32rem) {
      const val = fromBytesString(CLU32rem.subarray(0, len));
      return resultHelper(Ok(new CLString(val)), CLU32rem.subarray(len));
    }

    return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
  }
}
