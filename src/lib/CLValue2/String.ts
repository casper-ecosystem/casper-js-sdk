import { CLType, CLValue } from "./Abstract"; 

export class CLStringType extends CLType {
  toString(): string {
    return 'String';
  }
}

export class CLString extends CLValue {
  data: string;

  constructor(v: string) {
    super();
    if (typeof v  !== "string") {
      throw new Error(`Wrong data type, you should provide string, but you provided ${typeof v}`);
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

