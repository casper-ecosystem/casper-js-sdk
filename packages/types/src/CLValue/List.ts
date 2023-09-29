import { Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLValue,
  CLType,
  ToBytes,
  CLErrorCodes,
  resultHelper,
  ResultAndRemainder,
  ToBytesResult,
  CLValueBytesParsers,
  CLU32BytesParser,
  matchByteParserByCLType
} from './index';
import { toBytesVectorNew } from '../ByteConverters';

import { LIST_TYPE, CLTypeTag } from './constants';

export class CLListType<T extends CLType> extends CLType {
  inner: T;
  linksTo = LIST_TYPE;
  tag = CLTypeTag.List;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    return `${LIST_TYPE} (${this.inner.toString()})`;
  }

  toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.tag]), this.inner.toBytes()]);
  }

  toJSON(): any {
    const inner = this.inner.toJSON();
    return {
      [LIST_TYPE]: inner
    };
  }
}

export class CLListBytesParser extends CLValueBytesParsers {
  toBytes(value: CLList<CLValue & ToBytes>): ToBytesResult {
    // TODO: Change when there will not be any legacy code
    return Ok(toBytesVectorNew(value.data));
  }

  fromBytesWithRemainder(
    bytes: Uint8Array,
    listType: CLListType<CLType>
  ): ResultAndRemainder<CLList<CLValue>, CLErrorCodes> {
    const {
      result: u32Res,
      remainder: u32Rem
    } = new CLU32BytesParser().fromBytesWithRemainder(bytes);

    if (!u32Res.ok) {
      return resultHelper<CLList<CLValue>, CLErrorCodes>(Err(u32Res.val));
    }

    const size = u32Res.val.value().toNumber();

    const vec = [];

    let remainder = u32Rem;

    const parser = matchByteParserByCLType(listType.inner).unwrap();

    for (let i = 0; i < size; i++) {
      if (!remainder)
        return resultHelper<CLList<CLValue>, CLErrorCodes>(
          Err(CLErrorCodes.EarlyEndOfStream)
        );

      const { result: vRes, remainder: vRem } = parser.fromBytesWithRemainder(
        remainder,
        listType.inner
      );

      if (!vRes.ok) {
        return resultHelper<CLList<CLValue>, CLErrorCodes>(Err(vRes.val));
      }
      vec.push(vRes.val);
      remainder = vRem;
    }

    // Support for creating empty lists from bytes
    if (vec.length === 0) {
      return resultHelper(Ok(new CLList(listType.inner)), remainder);
    }

    return resultHelper(Ok(new CLList(vec)), remainder);
  }
}

export class CLList<T extends CLValue> extends CLValue {
  data: Array<T>;
  vectorType: CLType;

  constructor(v: Array<T> | CLType) {
    super();
    if (Array.isArray(v) && v[0].clType && v[0].clType()) {
      const refType = v[0].clType();
      if (
        v.every(i => {
          return i.clType().toString() === refType.toString();
        })
      ) {
        this.data = v;
        this.vectorType = refType;
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (v instanceof CLType) {
      this.vectorType = v;
      this.data = [];
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  value(): Array<T> {
    return this.data;
  }

  clType(): CLType {
    return new CLListType(this.vectorType);
  }

  toJSON(): any {
    return this.data.map(d => d.toJSON());
  }

  get(index: number): T {
    if (index >= this.data.length) {
      throw new Error('List index out of bounds.');
    }
    return this.data[index];
  }

  set(index: number, item: T): void {
    if (index >= this.data.length) {
      throw new Error('List index out of bounds.');
    }
    this.data[index] = item;
  }

  push(item: T): void {
    if (item.clType().toString() === this.vectorType.toString()) {
      this.data.push(item);
    } else {
      throw Error(
        `Incosnsistent data type, use ${this.vectorType.toString()}.`
      );
    }
  }

  remove(index: number): void {
    this.data.splice(index, 1);
  }

  pop(): T | undefined {
    return this.data.pop();
  }

  size(): number {
    return this.data.length;
  }
}
