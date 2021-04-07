import { Result } from 'ts-results';

export abstract class CLType {
  abstract toString(): string;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;
}

export abstract class ToBytes {
  toBytes: () => Uint8Array;
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
