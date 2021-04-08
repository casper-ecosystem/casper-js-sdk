import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  ToBytes,
  CLErrorCodes,
  resultHelper,
  ResultAndRemainder,
  CLU32,
  FromBytes,
} from './index';
import { toBytesVector } from '../ByteConverters';

export class CLListType<T extends CLType> extends CLType {
  inner: T;
  linksTo = CLList;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    return `List (${this.inner.toString()})`;
  }
}

export class CLList<T extends CLValue & ToBytes & FromBytes> extends CLValue
  implements ToBytes, FromBytes {
  data: Array<T>;
  vectorType: CLType;

  constructor(v: Array<T> | CLType) {
    super();
    if (Array.isArray(v) && v[0].clType) {
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

  toBytes(): Uint8Array {
    return toBytesVector(this.data);
  }

  static fromBytes(
    bytes: Uint8Array,
    listType: CLListType<CLType>
  ): ResultAndRemainder<CLList<CLValue & ToBytes & FromBytes>, CLErrorCodes> {
    const { result: u32Res, remainder: u32Rem } = CLU32.fromBytes(bytes);
    if (!u32Res.ok) {
      return resultHelper(Err(u32Res.val));
    }

    const size = u32Res.val.value().toNumber();

    const vec = [];

    let remainder = u32Rem;

    for (let i = 0; i < size; i++) {
      const referenceClass = listType.inner.linksTo;
      const { result: vRes, remainder: vRem } = referenceClass.fromBytes(
        remainder
      );
      if (!vRes.ok) {
        return resultHelper(Err(vRes.val));
      }
      vec.push(vRes.val);
      remainder = vRem;
    }

    return resultHelper(Ok(new CLList(vec)), remainder);
  }
}
