abstract class CLType {
  abstract toString(): string;
}

export class BoolType extends CLType {
  toString(): string {
    return 'Bool';
  }
}

export class ListType<T extends CLType> extends CLType {
  inner: T;
  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    return `List (${this.inner.toString()})`;
  }
}

abstract class CLValue {
  abstract clType(): CLType;
  abstract value(): any;
}

export class Bool extends CLValue {
  v: boolean;

  constructor(v: boolean) {
    super();
    this.v = v;
  }

  clType(): CLType {
    return new BoolType();
  }

  value(): boolean {
    return this.v;
  }
}

export class List<T extends CLValue> extends CLValue {
  v: Array<T>;
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
        this.v = v;
        this.vectorType = refType;
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (v instanceof CLType) {
      this.vectorType = v;
      this.v = [];
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  value(): Array<T> {
    return this.v;
  }

  clType(): CLType {
    return new ListType(this.vectorType);
  }

  get(index: number): T {
    return this.v[index];
  }

  set(index: number, item: T): void {
    if (index >= this.v.length) {
      throw new Error("Array index out of bounds.");
    }
    this.v[index] = item;
  }

  push(item: T): void {
    if (item.clType().toString() === this.vectorType.toString()) {
      this.v.push(item);
    } else {
      throw Error(`Incosnsistent data type, use ${this.vectorType.toString()}.`);
    }
  }

  remove(index: number): void {
    this.v.splice(index, 1);
  }

  // TBD: we can throw an error here, but returing undefined from empty list is typical JS behavior
  pop(): T | undefined {
    return this.v.pop();
  }

  size(): number {
    return this.v.length;
  }
}
