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
    return `Map (${this.innerKey.toString()}: ${this.innerValue.toString()}`;
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

export class MapValue<K extends CLValue, V extends CLValue> extends CLValue {
  v: Array<{ key: K; value: V }>;
  refType: MapEntryType;
  /**
   * Constructs a new `MapValue`.
   *
   * @param v object with { key: CLValue, value: CLValue }
   */
  constructor(v: Array<{ key: K; value: V }> | MapEntryType) {
    super();
    if (Array.isArray(v) && v[0].key.clType && v[0].value.clType) {
      // const refType = v[0].clType();
      this.refType = { key: v[0].key.clType(), value: v[0].value.clType() };
      if (
        v.every(({ key, value }) => {
          return (
            key.clType().toString() === this.refType.key.toString() &&
            value.clType().toString() === this.refType.value.toString()
          );
        })
      ) {
        this.v = v;
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (
      !Array.isArray(v) &&
      v.key instanceof CLType &&
      v.value instanceof CLType
    ) {
      this.refType = v;
      this.v = [];
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  clType(): CLType {
    return new MapValueType(this.v[0].key.clType(), this.v[0].value.clType());
  }

  value(): Array<{ key: K; value: V }> {
    return this.v;
  }

  get(k: K): { key: K, value: V } | undefined {
    return this.v.find(v => k === v.key);
  }

  set(k: K, val: V): void {
    const foundIdx = this.v.findIndex(v => k === v.key);
    if (foundIdx > -1) {
      this.v[foundIdx] = { key: k, value: val };
    }
    this.v.push({ key: k, value: val });
  }

  delete(k: K): void {
    this.v.filter(({ key }) => key !== k);
  }

}
