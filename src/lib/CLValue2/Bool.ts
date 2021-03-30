import { CLType, CLValue, ToBytes, CLResult, CLErrorCodes } from "./index"; 
import { Ok, Err } from "ts-results";

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

  static fromBytes(bytes: Uint8Array): CLResult {
    if (bytes.length === 0) {
      return new CLResult(Err(CLErrorCodes.EarlyEndOfStream));
    }
    if (bytes[0] === 1) {
      return new CLResult(Ok(new CLBool(true)), bytes.subarray(1));
    } else if (bytes[0] === 0) {
      return new CLResult(Ok(new CLBool(false)), bytes.subarray(1));
    } else {
      return new CLResult(Err(CLErrorCodes.Formatting));
    }
  }
}
