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
  data: Array<[K, V]>;
  refType: [CLType, CLType];
  /**
   * Constructs a new `MapValue`.
   *
   * @param v array [ key, value ]
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
        this.data = v;
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (v[0] instanceof CLType && v[1] instanceof CLType) {
      this.refType = v;
      this.data = [];
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  clType(): CLType {
    return new MapValueType(this.data[0][0].clType(), this.data[0][1].clType());
  }

  value(): Array<[K, V]> {
    return this.data;
  }

  get(k: K): V | undefined {
    const found = this.data.find(v => k === v[0]);
    if (found) return found[1];
    return undefined;
  }

  set(k: K, val: V): void {
    const foundIdx = this.data.findIndex(v => k === v[0]);
    if (foundIdx > -1) {
      this.data[foundIdx] = [k, val];
      return;
    }
    this.data.push([k, val]);
  }

  delete(k: K): void {
    this.data = this.data.filter(([key]) => key !== k);
  }

  size(): number {
    return this.data.length;
  }
}
