import { CLType, CLValue } from "./Abstract"; 

export class UnitType extends CLType {
  toString(): string {
    return 'Unit';
  }
}

export class Unit extends CLValue {
  data = undefined;

  clType(): CLType {
    return new UnitType();
  }

  value(): undefined {
    return this.data;
  }
}

