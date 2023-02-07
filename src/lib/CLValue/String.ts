import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  CLU32BytesParser,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  CLErrorCodes,
  CLValueBytesParsers
} from './index';
import { STRING_ID, CLTypeTag } from './constants';
import { toBytesString, fromBytesString } from '../ByteConverters';

export class CLStringType extends CLType {
  linksTo = STRING_ID;
  tag = CLTypeTag.String;
}

export class CLStringBytesParser extends CLValueBytesParsers {
  toBytes(value: CLString): ToBytesResult {
    return Ok(toBytesString(value.data));
  }

  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLString, CLErrorCodes> {
    const {
      result: CLU32res,
      remainder: CLU32rem
    } = new CLU32BytesParser().fromBytesWithRemainder(rawBytes);

    const len = CLU32res.unwrap()
      .value()
      .toNumber();

    if (CLU32rem) {
      const val = fromBytesString(CLU32rem.subarray(0, len));
      return resultHelper(Ok(new CLString(val)), CLU32rem.subarray(len));
    }

    return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
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
}
