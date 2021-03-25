import { concat } from '@ethersproject/bytes';

import { CLType, CLValue, ToBytes } from './Abstract';
import { toBytesU32 } from '../ByteConverters';

export class CLMapType<K extends CLType, V extends CLType> extends CLType {
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

export class CLMap<K extends CLValue & ToBytes, V extends CLValue & ToBytes>
  extends CLValue
  implements ToBytes {
  data: Map<K, V>;
  refType: [CLType, CLType];
  /**
   * Constructs a new `MapValue`.
   *
   * @param v array [ key, value ]
   */
  constructor(v: [K, V][] | [CLType, CLType]) {
    super();
    if (isValueConstructor(v)) {
      this.refType = [v[0][0].clType(), v[0][1].clType()];
      if (
        v.every(([key, value]) => {
          return (
            key.clType().toString() === this.refType[0].toString() &&
            value.clType().toString() === this.refType[1].toString()
          );
        })
      ) {
        this.data = new Map(v);
      } else {
        throw Error('Invalid data provided.');
      }
    } else if (v[0] instanceof CLType && v[1] instanceof CLType) {
      this.refType = v;
      this.data = new Map();
    } else {
      throw Error('Invalid data type(s) provided.');
    }
  }

  clType(): CLType {
    return new CLMapType(...this.refType);
  }

  value(): Map<K, V> {
    return this.data;
  }

  get(k: K): V | undefined {
    return this.data.get(k);
  }

  set(k: K, val: V): void {
    this.data.set(k, val);
  }

  delete(k: K): boolean {
    return this.data.delete(k);
  }

  size(): number {
    return this.data.size;
  }

  toBytes(): Uint8Array {
    const kvBytes: Uint8Array[] = Array.from(this.data).map(([key, value]) =>
      concat([key.toBytes(), value.toBytes()])
    );
    return concat([toBytesU32(this.data.size), ...kvBytes]);
  }
}
