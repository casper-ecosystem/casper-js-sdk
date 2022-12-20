import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLValueParsers,
  CLErrorCodes,
  resultHelper,
  ResultAndRemainder,
  ToBytesResult,
  CLU32BytesParser,
  CLValueBytesParsers,
  matchByteParserByCLType
} from './index';
import { MAP_ID, CLTypeTag } from './constants';
import { toBytesU32 } from '../ByteConverters';

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

type KeyVal = CLValue;

export class CLMapType<K extends CLType, V extends CLType> extends CLType {
  tag = CLTypeTag.Map;
  linksTo = CLMap;

  innerKey: K;
  innerValue: V;

  constructor([keyType, valueType]: [K, V]) {
    super();
    this.innerKey = keyType;
    this.innerValue = valueType;
  }

  toString(): string {
    return `${MAP_ID} (${this.innerKey.toString()}: ${this.innerValue.toString()})`;
  }

  toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.tag]),
      this.innerKey.toBytes(),
      this.innerValue.toBytes()
    ]);
  }

  toJSON(): any {
    return {
      [MAP_ID]: {
        key: this.innerKey.toJSON(),
        value: this.innerValue.toJSON()
      }
    };
  }
}

export class CLMapBytesParser extends CLValueBytesParsers {
  toBytes(value: CLMap<CLValue, CLValue>): ToBytesResult {
    const kvBytes: Uint8Array[] = Array.from(value.data).map(([key, value]) => {
      const byteKey = CLValueParsers.toBytes(key).unwrap();
      const byteVal = CLValueParsers.toBytes(value).unwrap();
      return concat([byteKey, byteVal]);
    });
    return Ok(concat([toBytesU32(value.data.length), ...kvBytes]));
  }

  fromBytesWithRemainder(
    bytes: Uint8Array,
    mapType: CLMapType<CLType, CLType>
  ): ResultAndRemainder<CLMap<KeyVal, KeyVal>, CLErrorCodes> {
    const {
      result: u32Res,
      remainder: u32Rem
    } = new CLU32BytesParser().fromBytesWithRemainder(bytes);

    const size = u32Res
      .unwrap()
      .value()
      .toNumber();
    const vec: [KeyVal, KeyVal][] = [];

    let remainder = u32Rem;

    if (size === 0) {
      return resultHelper(
        Ok(new CLMap([mapType.innerKey, mapType.innerValue])),
        remainder
      );
    }

    for (let i = 0; i < size; i++) {
      if (!remainder)
        return resultHelper<CLMap<KeyVal, KeyVal>, CLErrorCodes>(
          Err(CLErrorCodes.EarlyEndOfStream)
        );

      const keyParser = matchByteParserByCLType(mapType.innerKey).unwrap();
      const {
        result: kRes,
        remainder: kRem
      } = keyParser.fromBytesWithRemainder(remainder, mapType.innerKey);

      const finalKey = kRes.unwrap();
      remainder = kRem;

      if (!remainder)
        return resultHelper<CLMap<KeyVal, KeyVal>, CLErrorCodes>(
          Err(CLErrorCodes.EarlyEndOfStream)
        );

      const valParser = matchByteParserByCLType(mapType.innerValue).unwrap();
      const {
        result: vRes,
        remainder: vRem
      } = valParser.fromBytesWithRemainder(remainder, mapType.innerValue);

      const finalValue = vRes.unwrap();
      remainder = vRem;

      vec.push([finalKey, finalValue]);
    }

    if (size !== vec.length)
      return resultHelper<CLMap<KeyVal, KeyVal>, CLErrorCodes>(
        Err(CLErrorCodes.Formatting)
      );

    return resultHelper(Ok(new CLMap(vec)), remainder);
  }
}

export class CLMap<K extends CLValue, V extends CLValue> extends CLValue {
  data: [K, V][];
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
    return new CLMapType(this.refType);
  }

  toJSON(): any {
    const map = new Map();
    this.data.forEach(([k, v]) => map.set(k, v));
    return map;
  }

  value(): [K, V][] {
    return this.data;
  }

  has(k: K): boolean {
    return this.get(k) !== undefined;
  }

  get(k: K): V | undefined {
    const result = this.data.find(d => d[0].value() === k.value());
    return result ? result[1] : undefined;
  }

  set(k: K, val: V): void {
    if (this.get(k)) {
      this.data = this.data.map(d =>
        d[0].value() === k.value() ? [d[0], val] : d
      );
      return;
    }

    this.data = [...this.data, [k, val]];
  }

  delete(k: K): void {
    this.data = this.data.filter(d => d[0].value() !== k.value());
  }

  size(): number {
    return this.data.length;
  }
}
