import { Ok, Err } from 'ts-results';
import { concat } from '@ethersproject/bytes';

import {
  CLType,
  CLValue,
  CLValueParsers,
  CLValueBytesParsers,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  matchByteParserByCLType,
  CLErrorCodes
} from './index';
import { TUPLE_MATCH_LEN_TO_ID } from './utils';
import { CLTypeTag } from './constants';

type TupleTypes = typeof CLTuple1 | typeof CLTuple2 | typeof CLTuple3;

export abstract class CLTupleType extends CLType {
  tag: CLTypeTag;
  linksTo: TupleTypes;
  inner: Array<CLType>;

  constructor(inner: Array<CLType>, linksTo: TupleTypes, tag: CLTypeTag) {
    super();
    this.inner = inner;
    this.linksTo = linksTo;
    this.tag = tag;
  }

  toString(): string {
    const innerTypes = this.inner.map(e => e.toString()).join(', ');
    return `Tuple${this.inner.length} (${innerTypes})`;
  }

  toJSON(): any {
    const id = TUPLE_MATCH_LEN_TO_ID[this.inner.length - 1];
    return {
      [id]: this.inner.map(t => t.toJSON())
    };
  }

  toBytes(): any {
    const inner = this.inner.map(t => t.toBytes());
    return concat([Uint8Array.from([this.tag]), ...inner]);
  }
}

export class CLTupleBytesParser extends CLValueBytesParsers {
  toBytes(value: CLTuple): ToBytesResult {
    return Ok(concat(value.data.map(d => CLValueParsers.toBytes(d).unwrap())));
  }

  fromBytesWithRemainder(
    rawBytes: Uint8Array,
    type: CLTuple1Type | CLTuple2Type | CLTuple3Type
  ): ResultAndRemainder<CLTuple, CLErrorCodes> {
    let rem = rawBytes;
    const val = type.inner.map((t: CLType) => {
      const parser = matchByteParserByCLType(t).unwrap();
      const { result: vRes, remainder: vRem } = parser.fromBytesWithRemainder(
        rem,
        t
      );

      rem = vRem!;
      return vRes.unwrap();
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

abstract class CLTuple extends CLValue {
  data: Array<CLValue>;
  tupleSize: number;

  constructor(size: number, v: Array<CLValue>) {
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

  set(index: number, item: CLValue): void {
    if (index >= this.tupleSize) {
      throw new Error('Tuple index out of bounds.');
    }
    this.data[index] = item;
  }

  push(item: CLValue): void {
    if (this.data.length < this.tupleSize) {
      this.data.push(item);
    } else {
      throw new Error('No more space in this tuple!');
    }
  }

  value(): Array<CLValue> {
    return this.data;
  }

  toJSON(): any {
    return this.data.map(d => d.toJSON());
  }
}

export class CLTuple1Type extends CLTupleType {
  constructor(inner: Array<CLType>) {
    super(inner, CLTuple1, CLTypeTag.Tuple1);
  }
}

export class CLTuple1 extends CLTuple {
  constructor(value: Array<CLValue>) {
    super(1, value);
  }

  clType(): CLType {
    return new CLTuple1Type(this.data.map(e => e.clType()));
  }
}

export class CLTuple2Type extends CLTupleType {
  constructor(inner: Array<CLType>) {
    super(inner, CLTuple2, CLTypeTag.Tuple2);
  }
}

export class CLTuple2 extends CLTuple {
  constructor(value: Array<CLValue>) {
    super(2, value);
  }

  clType(): CLType {
    return new CLTuple2Type(this.data.map(e => e.clType()));
  }
}

export class CLTuple3Type extends CLTupleType {
  constructor(inner: Array<CLType>) {
    super(inner, CLTuple3, CLTypeTag.Tuple3);
  }
}

export class CLTuple3 extends CLTuple {
  constructor(value: Array<CLValue>) {
    super(3, value);
  }

  clType(): CLType {
    return new CLTuple3Type(this.data.map(e => e.clType()));
  }
}
