import { CLType, CLValue, ToBytes } from './Abstract';
import { toBytesVecT } from '../byterepr';

export class CLListType<T extends CLType> extends CLType {
  inner: T;
  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    return `List (${this.inner.toString()})`;
  }
}

export class CLList<T extends CLValue & ToBytes> extends CLValue
  implements ToBytes {
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
    return this.data[index];
  }

  set(index: number, item: T): void {
    if (index >= this.data.length) {
      throw new Error("Array index out of bounds.");
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

  // TBD: we can throw an error here, but returing undefined from empty list is typical JS behavior
  pop(): T | undefined {
    return this.data.pop();
  }

  size(): number {
    return this.data.length;
  }

  toBytes(): Uint8Array {
    return toBytesVecT(this.data);
  }
}
