/**
 * Implements a collection of runtime arguments.
 */
import { toBytesString, toBytesVecT } from './byterepr';
import { CLValue, Result, StringValue, ToBytes, U32 } from './CLValue';
import { concat } from '@ethersproject/bytes';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

export class NamedArg implements ToBytes {
  constructor(public name: string, public value: CLValue) {}

  public toBytes(): Uint8Array {
    const name = toBytesString(this.name);
    const value = this.value.toBytes();
    return concat([name, value]);
  }

  public static fromBytes(bytes: Uint8Array): Result<NamedArg> {
    const nameRes = StringValue.fromBytes(bytes);
    if (nameRes.hasError()) {
      return Result.Err(nameRes.error);
    }
    const clValueRes = CLValue.fromBytes(nameRes.remainder());
    if (clValueRes.hasError()) {
      return Result.Err(clValueRes.error);
    }
    return Result.Ok(
      new NamedArg(nameRes.value().val, clValueRes.value()),
      clValueRes.remainder()
    );
  }
}

const desRA = (_arr: any) => {
  const clValueSerializer = new TypedJSON(CLValue);
  return new Map(
    Array.from(_arr, ([key, value]) => {
      return [key, clValueSerializer.parse(value)];
    })
  );
};

const serRA = (map: Map<string, CLValue>) => {
  const clValueSerializer = new TypedJSON(CLValue);
  return Array.from(map, ([key, value]) => [
    key,
    clValueSerializer.toPlainJson(value)
  ]);
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

  public toBytes() {
    const vec = Array.from(this.args.entries()).map((a: [string, CLValue]) => {
      return new NamedArg(a[0], a[1]);
    });
    return toBytesVecT(vec);
  }

  public static fromBytes(bytes: Uint8Array): Result<RuntimeArgs> {
    const sizeRes = U32.fromBytes(bytes);
    if (sizeRes.hasError()) {
      return Result.Err(sizeRes.error);
    }
    const size = sizeRes.value().val.toNumber();
    let remainBytes = sizeRes.remainder();
    const res: NamedArg[] = [];
    for (let i = 0; i < size; i++) {
      const namedArgRes = NamedArg.fromBytes(remainBytes);
      if (namedArgRes.hasError()) {
        return Result.Err(namedArgRes.error);
      }
      res.push(namedArgRes.value());
      remainBytes = namedArgRes.remainder();
    }
    return Result.Ok(RuntimeArgs.fromNamedArgs(res), remainBytes);
  }
}
