import { CLType, CLValue, ToBytes } from './Abstract';

export class UnitType extends CLType {
  toString(): string {
    return 'Unit';
  }
}

export class Unit extends CLValue implements ToBytes {
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
}
