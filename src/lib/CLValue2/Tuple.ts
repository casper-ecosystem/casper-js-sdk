import { Ok, Err } from "ts-results";
import { concat } from '@ethersproject/bytes';

import {
  CLType,
  CLValue,
  ToBytes,
  FromBytes,
  ResultAndRemainder,
  resultHelper,
  CLErrorCodes,
} from './index';

// TBD: Do we want Tuple to have all of the values on init? If no, when it will be serialized it should throw an error that eg Tuple2 has only one element and is invalid
abstract class GenericTuple extends CLValue implements ToBytes, FromBytes{
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
      throw Error('Invalid data type(s) provided.');
    }
  }

  get(index: number): CLValue {
    return this.data[index];
  }

  set(index: number, item: CLValue & ToBytes): void {
    if (index >= this.tupleSize) {
      throw new Error('Tuple index out of bounds.');
    }
    this.data[index] = item;
  }

  push(item: CLValue & ToBytes): void {
    if (this.data.length < this.tupleSize) {
      this.data.push(item);
    } else {
      throw new Error('No more space in this tuple!');
    }
  }

  value(): Array<CLValue> {
    return this.data;
  }

  toBytes(): Uint8Array {
    return concat(this.data.map(d => d.toBytes()));
  }

  static fromBytes(
    rawBytes: Uint8Array,
    type: typeof CLTuple1Type | typeof CLTuple1Type | typeof CLTuple3Type
  ): ResultAndRemainder<GenericTuple, CLErrorCodes> {
    let rem = rawBytes;
    const val = type.inner.map((t: CLType) => {
      const referenceClass = t.linksTo;
      const { result: vRes, remainder: vRem } = referenceClass.fromBytes(rem);
      if (!vRes.ok) {
        return resultHelper(Err(vRes.val));
      }
      rem = vRem;
      return vRes.val;
    });

    if (val.length === 1) {
      return resultHelper(Ok(new CLTuple1(val)), rem);
    }
    if (val.length === 2) {
      return resultHelper(Ok(new CLTuple2(val)), rem);
    }
    if (val.length === 3) {
      return resultHelper(Ok(new CLTuple3(val)), rem);
    }
    return resultHelper(Err(CLErrorCodes.Formatting));
  }
}

// TBD: Maybe replace this with classic implementation, it will be easier to validate by compiler eg. new Tuple1<Bool>(), new Tuple2<Bool, I32>();
const generateTupleClasses = (
  size: number
  // TODO: Get rid of any below
): [any, any] => {
  class Tuple extends GenericTuple {
    constructor(value: Array<CLValue & ToBytes & FromBytes>) {
      super(size, value);
    }

    clType(): CLType {
      return new TupleType(this.data.map(e => e.clType()));
    }
  }

  class TupleType extends CLType {
    linksTo = Tuple;
    inner: Array<CLType>;

    constructor(inner: Array<CLType>) {
      super();
      this.inner = inner;
    }

    toString(): string {
      const innerTypes = this.inner.map(e => e.toString()).join(', ');
      return `Tuple${this.inner.length} (${innerTypes})`;
    }
  }

  return [Tuple, TupleType];
};

export const [CLTuple1, CLTuple1Type] = generateTupleClasses(1);
export const [CLTuple2, CLTuple2Type] = generateTupleClasses(2);
export const [CLTuple3, CLTuple3Type] = generateTupleClasses(3);
