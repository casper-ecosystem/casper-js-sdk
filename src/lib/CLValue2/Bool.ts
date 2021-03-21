import { CLType, CLValue, ToBytes } from "./Abstract"; 

export class BoolType extends CLType {
  toString(): string {
    return 'Bool';
  }
}

export class Bool extends CLValue implements ToBytes {
  v: boolean;

  constructor(v: boolean) {
    super();
    this.v = v;
  }

  clType(): CLType {
    return new BoolType();
  }

  value(): boolean {
    return this.v;
  }

  toBytes(): Uint8Array {
    return new Uint8Array([this.v ? 1 : 0]);
  }
}
