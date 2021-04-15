import { Result, Ok, Err } from 'ts-results';
import { CLErrorCodes } from './index';
import { encodeBase16, decodeBase16 } from '../Conversions';
import { matchTypeToCLType } from './utils';

export abstract class CLType {
  abstract toString(): string;
  abstract toJSON(): any;
  abstract linksTo: any;
}

export abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
  abstract data: any;

  abstract toBytes(): Uint8Array;
  static fromBytes: (
    bytes: Uint8Array,
    innerType?: CLType
  ) => ResultAndRemainder<CLValue & ToBytes & FromBytes, CLErrorCodes>;

  toJSON(): Result<CLJsonFormat, CLErrorCodes> {
    const bytes = encodeBase16(this.toBytes());
    const clType = this.clType().toJSON();
    return Ok({ bytes: bytes, cl_type: clType });
  }

  static fromJSON(
    json: CLJsonFormat
  ): ResultAndRemainder<CLValue, CLErrorCodes> {
    if (!json.bytes) return resultHelper(Err(CLErrorCodes.Formatting));
    const uint8bytes = decodeBase16(json.bytes);
    const CLTypes = matchTypeToCLType(json.cl_type);
    return this.fromBytes(uint8bytes, CLTypes);
  }
}

export abstract class ToBytes {}

export abstract class FromBytes {}

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

export interface CLJsonFormat {
  bytes: string;
  cl_type: string;
}
