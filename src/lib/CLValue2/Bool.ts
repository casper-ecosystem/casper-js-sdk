import { CLType, CLValue, ToBytes } from "./Abstract"; 

export class CLBoolType extends CLType {
  toString(): string {
    return 'Bool';
  }
}

export class CLBool extends CLValue implements ToBytes {
  data: boolean;

  constructor(v: boolean) {
    super();
    this.data = v;
  }

  clType(): CLType {
    return new CLBoolType();
  }

  value(): boolean {
    return this.data;
  }

  toBytes(): Uint8Array {
    return new Uint8Array([this.data ? 1 : 0]);
  }
}
