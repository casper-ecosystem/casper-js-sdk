import { concat } from '@ethersproject/bytes';

import { CLType, CLValue, ToBytes } from './Abstract';

// TBD: Do we want Tuple to have all of the values on init? If no, when it will be serialized it should throw an error that eg Tuple2 has only one element and is invalid
abstract class GenericTuple extends CLValue {
  data: Array<CLValue & ToBytes>;
  tupleSize: number;

  constructor(size: number, v: Array<CLValue & ToBytes>) {
    super();
    if (v.length > size) {
      throw new Error('Too many elements!');
    }
    if (v.every(e => e instanceof CLValue)) {
    this.tupleSize = size;
    this.data = v;
    } else {
      throw Error("Invalid data type(s) provided.");
    }
  }

  get(index: number): CLValue {
    return this.data[index];
  }

  set(index: number, item: CLValue & ToBytes): void {
    if (index >= this.tupleSize) {
      throw new Error("Tuple index out of bounds.");
    }
    this.data[index] = item;
  }

  push(item: CLValue & ToBytes): void {
    if (this.data.length < this.tupleSize) {
      this.data.push(item);
    } else {
      throw new Error("No more space in this tuple!");
    }
  }

  value(): Array<CLValue> {
    return this.data;
  }
}

// TBD: Maybe replace this with classic implementation, it will be easier to validate by compiler eg. new Tuple1<Bool>(), new Tuple2<Bool, I32>();
const generateTupleClasses = (
  size: number
  // TODO: Get rid of any below
): [any, CLType] => {
  class TupleType extends CLType {
    inner: Array<CLType>;

    constructor(inner: Array<CLType>) {
      super();
      this.inner = inner;
    }

    toString(): string {
      const innerTypes = this.inner.map(e => e.toString()).join(", ");
      return `Tuple${this.inner.length} (${innerTypes})`
    }
  }

  class Tuple extends GenericTuple {
    constructor(value: Array<CLValue & ToBytes>) {
      super(size, value);
    }

    clType(): CLType {
      return new TupleType(this.data.map(e => e.clType()));
    }

    toBytes(): Uint8Array {
      return concat(this.data.map(d => d.toBytes()));
    }
  }
  return [Tuple, TupleType];
};

export const [CLTuple1, CLTuple1Type] = generateTupleClasses(1);
export const [CLTuple2, CLTuple2Type] = generateTupleClasses(2);
export const [CLTuple3, CLTuple3Type] = generateTupleClasses(3);
