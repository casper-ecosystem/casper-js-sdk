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

export class UnitType extends CLType {
  linksTo = Unit;

  toString(): string {
    return 'Unit';
  }
}

export class Unit extends CLValue implements ToBytes, FromBytes {
  data = undefined;

  clType(): CLType {
    return new UnitType();
  }

  value(): undefined {
    return this.data;
  }

  toBytes(): Uint8Array {
    return Uint8Array.from([]);
  }

  static fromBytes(
    rawBytes: Uint8Array
  ): ResultAndRemainder<Unit, CLErrorCodes> {
    return resultHelper(Ok(new Unit()), rawBytes);
  }
}
