import { CLType, CLValue } from './Abstract';

// TBD: Do we want Tuple to have all of the values on init? If no, when it will be serialized it should throw an error that eg Tuple2 has only one element and is invalid
abstract class GenericTuple extends CLValue {
  v: Array<CLValue>;
  tupleSize: number;

  constructor(size: number, v: Array<CLValue>) {
    super();
    if (v.length > size) {
      throw new Error('Too many elements!');
    }
    if (v.every(e => e instanceof CLValue)) {
    this.tupleSize = size;
    this.v = v;
    } else {
      throw Error("Invalid data type(s) provided.");
    }
  }

  get(index: number): CLValue {
    return this.v[index];
  }

  set(index: number, item: CLValue): void {
    if (index >= this.tupleSize) {
      throw new Error("Tuple index out of bounds.");
    }
    this.v[index] = item;
  }

  push(item: CLValue): void {
    if (this.v.length < this.tupleSize) {
      this.v.push(item);
    } else {
      throw new Error("No more space in this tuple!");
    }
  }

  value(): Array<CLValue> {
    return this.v;
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
      return `Tuple (${innerTypes})`
    }
  }

  class Tuple extends GenericTuple {
    constructor(value: Array<CLValue>) {
      super(size, value);
    }

    clType(): CLType {
      return new TupleType(this.v.map(e => e.clType()));
    }
  }
  return [Tuple, TupleType];
};

export const [Tuple1, Tuple1Type] = generateTupleClasses(1);
export const [Tuple2, Tuple2Type] = generateTupleClasses(2);
export const [Tuple3, Tuple3Type] = generateTupleClasses(3);
