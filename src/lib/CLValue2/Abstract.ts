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

// export interface ResultAndRemainder<T, E> {
//   0: Result<T, E>,
//   1?: Uint8Array | null
// }

// export type ResultAndRemainder<T, E> = [Result<T, E>, (Uint8Array | null)?];

export const resultHelper = <T, E>(
  arg1: Result<T, E>,
  arg2?: Uint8Array
): ResultAndRemainder<T, E> => {
  return { result: arg1, remainder: arg2 };
};

// const myRes: ResultAndRemainder<number, string> = [Ok(1), null];

// const [res] = myRes;
// console.log(res);
