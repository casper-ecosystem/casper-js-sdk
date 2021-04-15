import { Result } from 'ts-results';
import { CLErrorCodes } from "./index";

export abstract class CLType {
  abstract toString(): string;
  abstract linksTo: any;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
}

export abstract class ToBytes {
  toBytes: () => Uint8Array;
}

export abstract class FromBytes {
  static fromBytes: (bytes: Uint8Array) => ResultAndRemainder<CLValue & ToBytes & FromBytes, CLErrorCodes>
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
