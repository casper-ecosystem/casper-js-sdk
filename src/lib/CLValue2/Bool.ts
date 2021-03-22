import { CLType, CLValue, ToBytes } from "./Abstract"; 

export class BoolType extends CLType {
  toString(): string {
    return 'Bool';
  }
}

export class Bool extends CLValue implements ToBytes {
  data: boolean;

  constructor(v: boolean) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new BoolType();
  }

  value(): boolean {
    return this.data;
  }

  toBytes(): Uint8Array {
    return new Uint8Array([this.data ? 1 : 0]);
  }
}
