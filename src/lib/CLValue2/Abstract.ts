import { Result, Ok, Err } from 'ts-results';
import { CLErrorCodes } from "./index";
import { encodeBase16, decodeBase16 } from '../Conversions';

export abstract class CLType {
  abstract toString(): string;
  abstract linksTo: any;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
  static fromBytes: (bytes: Uint8Array, innerType?: CLType) => ResultAndRemainder<CLValue & ToBytes & FromBytes, CLErrorCodes>;
  abstract toBytes(): Uint8Array;


  toJSON(): Result<CLJsonFormat, CLErrorCodes> {
    const bytes = encodeBase16(this.toBytes());
    const clType = this.clType().toString();
    return Ok({ bytes: bytes, cl_type: clType });
  }

  static fromJSON(json: CLJsonFormat): ResultAndRemainder<CLValue, CLErrorCodes> {
    if (!json.bytes) return resultHelper(Err(CLErrorCodes.Formatting));
    const uint8bytes = decodeBase16(json.bytes);
    return this.fromBytes(uint8bytes);
  }
}

export abstract class ToBytes {
}

export abstract class FromBytes {
}

export interface ResultAndRemainder<T, E> {
  result: Result<T, E>;
  remainder?: Uint8Array;
}

export const resultHelper = <T, E>(
  arg1: Result<T, E>,
  arg2?: Uint8Array
): ResultAndRemainder<T, E> => {
  return { result: arg1, remainder: arg2 };
};

export interface CLJsonFormat { bytes: string; cl_type: string };
