import { CLType, CLValue } from "./Abstract"; 

export class CLStringType extends CLType {
  toString(): string {
    return 'String';
  }
}

export class CLString extends CLValue {
  v: string;

  constructor(v: string) {
    super();
    if (typeof v  !== "string") {
      throw new Error(`Wrong data type, you should provide string, but you provided ${typeof v}`);
    }
    this.v = v;
  }

  clType(): CLType {
    return new CLStringType();
  }

  value(): string {
    return this.v;
  }

  size(): number {
    return this.v.length;
  }

}

