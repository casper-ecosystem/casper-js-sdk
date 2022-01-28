import { expect, assert } from 'chai';
import { None } from "ts-results";

import {
  CLValueBuilder,
  RuntimeArgs,
  CLOption,
  CLList,
  CLU512,
  CLByteArray,
  Keys
} from '../../src/lib';
import { decodeBase16 } from '../../src';
import { TypedJSON } from 'typedjson';

describe(`RuntimeArgs`, () => {
  it('should serialize RuntimeArgs correctly', () => {
    const args = RuntimeArgs.fromMap({
      foo: CLValueBuilder.i32(1)
    });
    const bytes = args.toBytes().unwrap();
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        1,
        0,
        0,
        0,
        3,
        0,
        0,
        0,
        102,
        111,
        111,
        4,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ])
    );
  });

  it('should serialize empty NamedArgs correctly', () => {
    const truth = decodeBase16('00000000');
    const runtimeArgs = RuntimeArgs.fromMap({});
    const bytes = runtimeArgs.toBytes().unwrap();
    expect(bytes).to.deep.eq(truth);
  });

  it('should deserialize RuntimeArgs', () => {
    let a = CLValueBuilder.u512(123);
    const runtimeArgs = RuntimeArgs.fromMap({
      a: CLValueBuilder.option(None, a.clType())
    });
    let serializer = new TypedJSON(RuntimeArgs);
    let str = serializer.stringify(runtimeArgs);
    let value = serializer.parse(str)!;
    assert.isTrue((value.args.get('a')! as CLOption<CLU512>).isNone());
  });

  it('should allow to extract lists of account hashes.', () => {
    const account0 = Keys.Ed25519.new().accountHash();
    const account1 = Keys.Ed25519.new().accountHash();
    const account0byteArray =         CLValueBuilder.byteArray(account0);
    const account1byteArray =         CLValueBuilder.byteArray(account1);
    let runtimeArgs = RuntimeArgs.fromMap({
      accounts: CLValueBuilder.list([
        account0byteArray,
        account1byteArray
      ])
    });
    let accounts = runtimeArgs.args.get('accounts')! as CLList<CLByteArray>;
    assert.deepEqual(accounts.get(0), account0byteArray);
    assert.deepEqual(accounts.get(1), account1byteArray);
  });
});
