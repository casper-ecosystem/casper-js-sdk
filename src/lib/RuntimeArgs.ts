/**
 * Implements a collection of runtime arguments.
 */
import { Ok, Err } from 'ts-results';
import { toBytesString, toBytesVector } from './ByteConverters';
import {
  CLValue,
  CLValueParsers,
  // Result,
  // StringValue,
  CLStringBytesParser,
  ToBytes,
  ToBytesResult,
  ResultAndRemainder,
  resultHelper,
  // U32
  // CLU32
} from './CLValue';
import { concat } from '@ethersproject/bytes';
import { jsonMember, jsonObject } from 'typedjson';

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
      return resultHelper(Err('Missing data for value of named arg'));
    }
    const value = CLValueParsers.fromBytesWithType(nameRem).unwrap(); 
    return resultHelper(Ok(new NamedArg(name.value(), value)));
  }
}

const desRA = (_arr: any) => {
  return new Map(
    Array.from(_arr, ([key, value]) => {
      const val = CLValueParsers.fromJSON(value);
      return [key, val.unwrap()];
    })
  );
};

const serRA = (map: Map<string, CLValue>) => {
  return Array.from(map, ([key, value]) => {
    return [key, CLValueParsers.toJSON(value).unwrap()];
  });
};

@jsonObject()
export class RuntimeArgs implements ToBytes {
  @jsonMember({
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
  // public static fromBytes(bytes: Uint8Array): Result<RuntimeArgs> {
  //   const sizeRes = U32.fromBytes(bytes);
  //   if (sizeRes.hasError()) {
  //     return Result.Err(sizeRes.error);
  //   }
  //   const size = sizeRes.value().val.toNumber();
  //   let remainBytes = sizeRes.remainder();
  //   const res: NamedArg[] = [];
  //   for (let i = 0; i < size; i++) {
  //     const namedArgRes = NamedArg.fromBytes(remainBytes);
  //     if (namedArgRes.hasError()) {
  //       return Result.Err(namedArgRes.error);
  //     }
  //     res.push(namedArgRes.value());
  //     remainBytes = namedArgRes.remainder();
  //   }
  //   return Result.Ok(RuntimeArgs.fromNamedArgs(res), remainBytes);
  // }
}
