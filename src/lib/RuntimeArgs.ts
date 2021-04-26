/**
 * Implements a collection of runtime arguments.
 */
import { Ok, Err } from 'ts-results';
import { toBytesString, toBytesVector } from './ByteConverters';
import {
  CLValue,
  CLData,
  // Result,
  // StringValue,
  CLString,
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
  constructor(public name: string, public value: CLValue<CLData>) {}

  public toBytes(): ToBytesResult {
    const name = toBytesString(this.name);
    const value = this.value.toBytes();
    return Ok(concat([name, value.unwrap()]));
  }

  public static fromBytes(
    bytes: Uint8Array
  ): ResultAndRemainder<NamedArg, string> {
    const {
      result: nameRes,
      remainder: nameRem
    } = CLString.fromBytesWithRemainder(bytes);
    const name = nameRes.unwrap();
    if (!nameRem) {
      return resultHelper(Err('Missing data for value of named arg'));
    }
    // Maybe there should also be fromBytesWithCLTypeWithRemainder ? (ofc better named)
    const value = CLValue.fromBytes(nameRem).unwrap();
    return resultHelper(Ok(new NamedArg(name.value(), value)));
  }
}

const desRA = (_arr: any) => {
  return new Map(
    Array.from(_arr, ([key, value]) => {
      const val = CLValue.fromJSON(value);
      return [key, val.unwrap()];
    })
  );
};

const serRA = (map: Map<string, CLValue<CLData>>) => {
  return Array.from(map, ([key, value]) => {
    return [key, value.toJSON().unwrap()];
  });
};

@jsonObject()
export class RuntimeArgs implements ToBytes {
  @jsonMember({
    serializer: serRA,
    deserializer: desRA
  })
  public args: Map<string, CLValue<CLData>>;

  constructor(args: Map<string, CLValue<CLData>>) {
    this.args = args;
  }

  public static fromMap(args: Record<string, CLValue<CLData>>) {
    const map: Map<string, CLValue<CLData>> = new Map(
      Object.keys(args).map(k => [k, args[k]])
    );
    return new RuntimeArgs(map);
  }

  public static fromNamedArgs(namedArgs: NamedArg[]) {
    const args = namedArgs.reduce<Record<string, CLValue<CLData>>>((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    return RuntimeArgs.fromMap(args);
  }

  public insert(key: string, value: CLValue<CLData>) {
    this.args.set(key, value);
  }

  public toBytes(): ToBytesResult {
    const vec = Array.from(this.args.entries()).map((a: [string, CLValue<CLData>]) => {
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
