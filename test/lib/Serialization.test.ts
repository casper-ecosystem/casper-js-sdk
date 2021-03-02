import { expect } from 'chai';
import 'mocha';
import * as nacl from 'tweetnacl-ts';
import { Args, PublicKeyArg, UInt64Arg } from '../../src/lib/Serialization';

describe('PublicKeyArg', () => {
  it('should serialize as 32 bytes with content using little endiannes', () => {
    const key = nacl.sign_keyPair().publicKey;
    const result = PublicKeyArg(key);
    expect(result.length).to.equal(32);
    expect(result[0]).to.equal(key[0]);
    expect(result[31]).to.equal(key[31]);
  });
});

describe('UInt64Arg', () => {
  it('should serialize as 64 bits using little endiannes', () => {
    const input = BigInt(1234567890);
    const result = UInt64Arg(input);
    expect(result.length).to.equal(64 / 8);
    const output = Buffer.from(result).readBigInt64LE();
    expect(output).to.equal(input);
  });
});

describe('Args', () => {
  it('should serialize with size ++ concatenation of parts', () => {
    const a = nacl.sign_keyPair().publicKey;
    const b = BigInt(500000);
    const result = Args(PublicKeyArg(a), UInt64Arg(b));
    const buffer = Buffer.from(result);
    expect(result[0]).to.equal(2);
    expect(result[1]).to.equal(0);
    expect(result[4]).to.equal(32);
    expect(result[5]).to.equal(0);
    expect(result[40]).to.equal(8);
    expect(buffer.slice(8, 8 + 32).equals(a)).to.equal(true);
    expect(buffer.readBigInt64LE(44)).to.equal(b);
  });

  it('should work with the hardcoded example', () => {
    const a = Buffer.alloc(32, 1);
    const b = BigInt(67305985);
    const result = Args(PublicKeyArg(a), UInt64Arg(b));
    // prettier-ignore
    const expected = Buffer.from([
      2, 0, 0, 0,
      32, 0, 0, 0,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      8, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0
    ]);
    expect(Buffer.from(result).equals(expected)).to.equal(true);
  });
});
