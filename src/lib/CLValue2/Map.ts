import { CLType, CLValue } from './Abstract';

export class MapValueType<K extends CLType, V extends CLType> extends CLType {
  innerKey: K;
  innerValue: V;

  constructor(keyType: K, valueType: V) {
    super();
    this.innerKey = keyType;
    this.innerValue = valueType;
  }

  toString(): string {
    return `Map (${this.innerKey.toString()}: ${this.innerValue.toString()})`;
  }
}

export interface MapEntryType {
  key: CLType;
  value: CLType;
}

export interface MapEntryValue {
  key: CLType;
  value: CLType;
}

const isValueConstructor = (
  v: Array<[CLValue, CLValue]> | [CLType, CLType]
): v is Array<[CLValue, CLValue]> => {
  return (
    Array.isArray(v) &&
    Array.isArray(v[0]) &&
    v[0].length === 2 &&
    !!v[0][0].clType &&
    !!v[0][1].clType
  );
};

export class MapValue<K extends CLValue, V extends CLValue> extends CLValue {
  v: Array<[K, V]>;
  refType: [CLType, CLType];
  /**
   * Constructs a new `MapValue`.
   *
   * @param v object with { key: CLValue, value: CLValue }
   */
  constructor(v: [K, V][] | [CLType, CLType]) {
    super();
    if (isValueConstructor(v)) {
      // const refType = v[0].clType();
      this.refType = [v[0][0].clType(), v[0][1].clType()];
      if (
        v.every(([key, value]) => {
          return (
            key.clType().toString() === this.refType[0].toString() &&
            value.clType().toString() === this.refType[1].toString()
          );
        })
      ) {
        this.v = v;
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (v[0] instanceof CLType && v[1] instanceof CLType) {
      this.refType = v;
      this.v = [];
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  clType(): CLType {
    return new MapValueType(this.v[0][0].clType(), this.v[0][1].clType());
  }

  value(): Array<[K, V]> {
    return this.v;
  }

  get(k: K): V | undefined {
    const found = this.v.find(v => k === v[0]);
    if (found) return found[1];
    return undefined;
  }

  set(k: K, val: V): void {
    const foundIdx = this.v.findIndex(v => k === v[0]);
    if (foundIdx > -1) {
      this.v[foundIdx] = [k, val];
    }
    this.v.push([k, val]);
  }

  delete(k: K): void {
    this.v = this.v.filter(([key]) => key !== k);
  }

  size(): number {
    return this.v.length;
  }
}
