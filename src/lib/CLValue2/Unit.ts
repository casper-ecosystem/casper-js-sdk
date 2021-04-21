import { Ok } from 'ts-results';

import {
  CLType,
  CLValue,
  ToBytes,
  FromBytes,
  CLErrorCodes,
  ResultAndRemainder,
  resultHelper
} from './index';
import { UNIT_ID } from "./constants";

export class CLUnitType extends CLType {
  linksTo = CLUnit;

  toString(): string {
    return UNIT_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLUnit extends CLValue implements ToBytes, FromBytes {
  data = undefined;

  clType(): CLType {
    return new CLUnitType();
  }

  value(): undefined {
    return this.data;
  }

  toBytes(): Uint8Array {
    return Uint8Array.from([]);
  }

  static fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLUnit, CLErrorCodes> {
    return resultHelper(Ok(new CLUnit()), rawBytes);
  }
}
