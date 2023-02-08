import { Ok } from 'ts-results';

import {
  CLType,
  CLValue,
  CLValueBytesParsers,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper
} from './index';
import { UNIT_TYPE, CLTypeTag } from './constants';

export class CLUnitType extends CLType {
  tag = CLTypeTag.Unit;
  linksTo = UNIT_TYPE;
}

export class CLUnitBytesParser extends CLValueBytesParsers {
  toBytes(): ToBytesResult {
    return Ok(Uint8Array.from([]));
  }

  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLUnit, CLErrorCodes> {
    return resultHelper(Ok(new CLUnit()), rawBytes);
  }
}

export class CLUnit extends CLValue {
  data = undefined;

  clType(): CLType {
    return new CLUnitType();
  }

  value(): undefined {
    return this.data;
  }
}
