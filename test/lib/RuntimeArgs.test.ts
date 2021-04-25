import { expect, assert } from 'chai';
import { None } from "ts-results";

import {
  CLValue,
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
      foo: CLValue.i32(1)
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

  // it('should deserialize U512', () => {
  //   let value = CLValue.u512(43000000000);
  //   let serializer = new TypedJSON(CLValue);
  //   let str = serializer.stringify(value);
  //   assert.deepEqual(value, serializer.parse(str));
  // });

  // it('should deserialize Option of U512', () => {
  //   let a = CLValue.u512(123);
  //   let value = CLValue.option(Some(a), a.clType());
  //   let serializer = new TypedJSON(CLValue);
  //   let str = serializer.stringify(value);
  //   let parsed = serializer.parse(str)!;
  //   assert.deepEqual(
  //     value.value(),
  //     parsed.getSome().asBigNumber()
  //   );
  // });

  it('should deserialize RuntimeArgs', () => {
    let a = CLValue.u512(123);
    const runtimeArgs = RuntimeArgs.fromMap({
      a: CLValue.option(None, a.clType())
    });
    let serializer = new TypedJSON(RuntimeArgs);
    let str = serializer.stringify(runtimeArgs);
    let value = serializer.parse(str)!;
    assert.isTrue((value.args.get('a') as CLOption<CLU512>).isNone());
  });

  it('should allow to extract lists of account hashes.', () => {
    const account0 = Keys.Ed25519.new().accountHash();
    const account1 = Keys.Ed25519.new().accountHash();
    const account0byteArray =         CLValue.byteArray(account0);
    const account1byteArray =         CLValue.byteArray(account1);
    let runtimeArgs = RuntimeArgs.fromMap({
      accounts: CLValue.list([
        account0byteArray,
        account1byteArray
      ])
    });
    let accounts = runtimeArgs.args.get('accounts') as CLList<CLByteArray>;
    assert.deepEqual(accounts.get(0), account0byteArray);
    assert.deepEqual(accounts.get(1), account1byteArray);
  });
});
