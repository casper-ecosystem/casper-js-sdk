import { jsonObject, jsonMember, AnyT } from 'typedjson';

@jsonObject
export class RpcError extends Error {
  @jsonMember({ constructor: Number })
  code: number;

  @jsonMember({ isRequired: false, constructor: AnyT })
  data?: any;

  constructor(code = 0, message = '', data?: any) {
    super(message);
    this.code = code;
    this.data = data;
  }

  toString(): string {
    return `key: ${this.message}, data: ${JSON.stringify(this.data)}`;
  }
}

@jsonObject
export class HttpError<T extends Error = Error> extends Error {
  @jsonMember({ constructor: Error })
  sourceErr: T;

  @jsonMember({ constructor: Number })
  statusCode: number;

  constructor(statusCode = 0, sourceErr: T) {
    super(`Code: ${statusCode}, err: ${sourceErr.message}`);
    this.sourceErr = sourceErr;
    this.statusCode = statusCode;
  }

  unwrap(): T {
    return this.sourceErr;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  static isHttpError<E extends Error = Error>(
    err: any | HttpError<E>
  ): err is HttpError<E> {
    return Boolean(err?.statusCode && err?.sourceErr);
  }
}
