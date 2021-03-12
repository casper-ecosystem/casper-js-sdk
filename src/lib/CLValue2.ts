abstract class CLType {
  abstract toString(): string;
}

class BoolType extends CLType {
  toString(): string {
    return 'Bool';
  }
}

class EmptyListType extends CLType {
  toString(): string {
    return 'List (Empty)';
  }
}

class ListType<T extends CLType> extends CLType {
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

  constructor(v?: Array<T>) {
    super();
    this.v = v || [];
  }

  value(): Array<T> {
    return this.v;
  }

  clType(): CLType {
    if (this.v.length > 0) {
      return new ListType(this.v[0].clType());
    }
    return new EmptyListType();
  }

  get(index: number): T {
    return this.v[index];
  }

  set(index: number, item: T): void {
    this.v[index] = item;
  }

  push(item: T): void {
    this.v.push(item);
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
