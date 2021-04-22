import { expect, assert } from 'chai';
import {
  CLValue,
  RuntimeArgs,
  CLTypedAndToBytesHelper,
  Keys
} from '../../src/lib';
import { decodeBase16 } from '../../src';
import { TypedJSON } from 'typedjson';

describe(`RuntimeArgs`, () => {
  it('should serialize RuntimeArgs correctly', () => {
    const args = RuntimeArgs.fromMap({
      foo: CLValue.i32(1)
    });
    const bytes = args.toBytes();
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
    const bytes = runtimeArgs.toBytes();
    expect(bytes).to.deep.eq(truth);
  });

  it('should deserialize U512', () => {
    let value = CLValue.u512(43000000000);
    let serializer = new TypedJSON(CLValue);
    let str = serializer.stringify(value);
    assert.deepEqual(value.asBigNumber(), serializer.parse(str)!.asBigNumber());
  });

  it('should deserialize Option of U512', () => {
    let a = CLTypedAndToBytesHelper.u512(123);
    let value = CLValue.option(a, a.clType());
    let serializer = new TypedJSON(CLValue);
    let str = serializer.stringify(value);
    let parsed = serializer.parse(str)!;
    assert.deepEqual(
      value.asOption().getSome().asBigNumber(),
      parsed.asOption().getSome().asBigNumber()
    );
  });

  it('should deserialize RuntimeArgs', () => {
    let a = CLTypedAndToBytesHelper.u512(123);
    const runtimeArgs = RuntimeArgs.fromMap({
      a: CLValue.option(null, a.clType())
    });
    let serializer = new TypedJSON(RuntimeArgs);
    let str = serializer.stringify(runtimeArgs);
    let value = serializer.parse(str)!;
    assert.isTrue(value.args.get('a')!.asOption().isNone());
  });

  it('should allow to extract lists of account hashes.', () => {
    const account0 = Keys.Ed25519.new().accountHash();
    const account1 = Keys.Ed25519.new().accountHash();
    let runtimeArgs = RuntimeArgs.fromMap({
      accounts: CLValue.list([
        CLTypedAndToBytesHelper.bytes(account0),
        CLTypedAndToBytesHelper.bytes(account1)
      ])
    });
    let accounts = runtimeArgs.args.get('accounts')!.asList();
    assert.deepEqual(accounts[0].asBytesArray(), account0);
    assert.deepEqual(accounts[1].asBytesArray(), account1);
  });
});
