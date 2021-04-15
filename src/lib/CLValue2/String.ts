import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  CLU32,
  ToBytes,
  FromBytes,
  ResultAndRemainder,
  resultHelper,
  CLErrorCodes
} from './index';
import { toBytesString, fromBytesString } from '../ByteConverters';

export class CLStringType extends CLType {
  linksTo = CLString;

  toString(): string {
    return 'String';
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLString extends CLValue implements ToBytes, FromBytes {
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

  toBytes(): Uint8Array {
    return toBytesString(this.data);
  };

  static fromBytes(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLString, CLErrorCodes> {
    const { result: CLU32res, remainder: CLU32rem } = CLU32.fromBytes(rawBytes);
    if (!CLU32res.ok) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const len = CLU32res.val.value().toNumber();
    const val = fromBytesString(CLU32rem!.subarray(0, len));
    // console.log(len);
    // console.log(val);
    // console.log(CLU32rem!.subarray(len));

    return resultHelper(Ok(new CLString(val)), CLU32rem!.subarray(len));
  }
}
