/**
 * Implements a collection of runtime arguments.
 */
import { Ok, Err } from 'ts-results';
import { toBytesString, toBytesVector } from './ByteConverters';
import {
  CLValue,
  CLValueParsers,
  CLStringBytesParser,
  CLU32BytesParser,
  ToBytes,
  ToBytesResult,
  ResultAndRemainder,
  resultHelper
} from './CLValue';
import { concat } from '@ethersproject/bytes';
import { jsonMapMember, jsonObject } from 'typedjson';

export class NamedArg implements ToBytes {
  constructor(public name: string, public value: CLValue) {}

  public toBytes(): ToBytesResult {
    const name = toBytesString(this.name);
    const value = CLValueParsers.toBytesWithType(this.value);
    return Ok(concat([name, value.unwrap()]));
  }

  public static fromBytes(
    bytes: Uint8Array
  ): ResultAndRemainder<NamedArg, string> {
    const {
      result: nameRes,
      remainder: nameRem
    } = new CLStringBytesParser().fromBytesWithRemainder(bytes);
    const name = nameRes.unwrap();
    if (!nameRem) {
      return resultHelper<NamedArg, string>(
        Err('Missing data for value of named arg')
      );
    }
    const value = CLValueParsers.fromBytesWithType(nameRem).unwrap();
    return resultHelper(Ok(new NamedArg(name.value(), value)));
  }
}

const desRA = (_arr: any) => {
  const parsed = new Map(
    Array.from(_arr, ([key, value]) => {
      const val = CLValueParsers.fromJSON(value);
      return [key, val.unwrap()];
    })
  );

  if (parsed.size !== Array.from(_arr).length)
    throw Error(`Duplicate key exists.`);

  return parsed;
};

const serRA = (map: Map<string, CLValue>) => {
  return Array.from(map, ([key, value]) => {
    return [key, CLValueParsers.toJSON(value).unwrap()];
  });
};

@jsonObject()
export class RuntimeArgs implements ToBytes {
  @jsonMapMember(String, CLValue, {
    serializer: serRA,
    deserializer: desRA
  })
  public args: Map<string, CLValue>;

  constructor(args: Map<string, CLValue>) {
    this.args = args;
  }

  public static fromMap(args: Record<string, CLValue>) {
    const map: Map<string, CLValue> = new Map(
      Object.keys(args).map(k => [k, args[k]])
    );
    return new RuntimeArgs(map);
  }

  public static fromNamedArgs(namedArgs: NamedArg[]) {
    const args = namedArgs.reduce<Record<string, CLValue>>((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return RuntimeArgs.fromMap(args);
  }

  public insert(key: string, value: CLValue) {
    this.args.set(key, value);
  }

  public toBytes(): ToBytesResult {
    const vec = Array.from(this.args.entries()).map((a: [string, CLValue]) => {
      return new NamedArg(a[0], a[1]);
    });
    return Ok(toBytesVector(vec));
  }

  // TODO: Add tests to check if it is working properly
  public static fromBytes(
    bytes: Uint8Array
  ): ResultAndRemainder<RuntimeArgs, string> {
    const {
      result: sizeRes,
      remainder: sizeRem
    } = new CLU32BytesParser().fromBytesWithRemainder(bytes);

    const size = sizeRes
      .unwrap()
      .value()
      .toNumber();

    let remainBytes = sizeRem;
    const res: NamedArg[] = [];
    for (let i = 0; i < size; i++) {
      if (!remainBytes)
        return resultHelper<RuntimeArgs, string>(
          Err('Error while parsing bytes')
        );
      const {
        result: namedArgRes,
        remainder: namedArgRem
      } = NamedArg.fromBytes(remainBytes);

      res.push(namedArgRes.unwrap());
      remainBytes = namedArgRem;
    }
    return resultHelper(Ok(RuntimeArgs.fromNamedArgs(res)), remainBytes);
  }
}
