import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  CLValueBytesParsers,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper
} from './Abstract';
import { CLErrorCodes } from './constants';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { toBytesNumber } from '../ByteConverters';
import {
  CLTypeTag,
  I32_ID,
  I64_ID,
  U8_ID,
  U32_ID,
  U64_ID,
  U128_ID,
  U256_ID,
  U512_ID
} from './constants';

abstract class NumericBytesParser extends CLValueBytesParsers {
  toBytes(value: Numeric): ToBytesResult {
    return Ok(toBytesNumber(value.bitSize, value.signed)(value.data));
  }
}

abstract class Numeric extends CLValue {
  data: BigNumber;
  bitSize: number;
  signed: boolean;

  constructor(bitSize: number, isSigned: boolean, value: BigNumberish) {
    super();
    if (isSigned === false && Math.sign(value as number) < 0) {
      throw new Error("Can't provide negative numbers with isSigned=false");
    }
    this.bitSize = bitSize;
    this.signed = isSigned;
    this.data = BigNumber.from(value);
  }

  value(): BigNumber {
    return this.data;
  }
}

// CLI32
export class CLI32Type extends CLType {
  linksTo = CLI32;
  tag = CLTypeTag.I32;

  toString(): string {
    return I32_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLI32BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLI32, CLErrorCodes> {
    if (bytes.length < 4) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const i32Bytes = Uint8Array.from(bytes.subarray(0, 4));
    const i32 = BigNumber.from(i32Bytes.reverse()).fromTwos(32);
    const remainder = bytes.subarray(4);

    return resultHelper(Ok(new CLI32(i32)), remainder);
  }
}

export class CLI32 extends Numeric {
  constructor(num: BigNumberish) {
    super(32, true, num);
  }

  clType(): CLType {
    return new CLI32Type();
  }
}

// CLI64
export class CLI64Type extends CLType {
  linksTo = CLI64;
  tag = CLTypeTag.I64;

  toString(): string {
    return I64_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLI64BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLI64, CLErrorCodes> {
    if (rawBytes.length < 8) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const bytes = Uint8Array.from(rawBytes.subarray(0, 8));
    const val = BigNumber.from(bytes.reverse()).fromTwos(64);
    const remainder = rawBytes.subarray(8);

    return resultHelper(Ok(new CLI64(val)), remainder);
  }
}

export class CLI64 extends Numeric {
  constructor(num: BigNumberish) {
    super(64, true, num);
  }

  clType(): CLType {
    return new CLI64Type();
  }
}

// CLU8
export class CLU8Type extends CLType {
  linksTo = CLU8;
  tag = CLTypeTag.U8;

  toString(): string {
    return U8_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU8BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLU8, CLErrorCodes> {
    if (bytes.length === 0) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    return resultHelper(Ok(new CLU8(bytes[0])), bytes.subarray(1));
  }
}

export class CLU8 extends Numeric {
  constructor(num: BigNumberish) {
    super(8, false, num);
  }

  clType(): CLType {
    return new CLU8Type();
  }
}

// CLU32
export class CLU32Type extends CLType {
  linksTo = CLU32;
  tag = CLTypeTag.U32;

  toString(): string {
    return U32_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU32BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLU32, CLErrorCodes> {
    if (bytes.length < 4) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const u32Bytes = Uint8Array.from(bytes.subarray(0, 4));
    const u32 = BigNumber.from(u32Bytes.reverse());

    return resultHelper(Ok(new CLU32(u32)), bytes.subarray(4));
  }
}

export class CLU32 extends Numeric {
  constructor(num: BigNumberish) {
    super(32, false, num);
  }

  clType(): CLType {
    return new CLU32Type();
  }
}

// CLU64
export class CLU64Type extends CLType {
  linksTo = CLU64;
  tag = CLTypeTag.U64;

  toString(): string {
    return U64_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU64BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLU64, CLErrorCodes> {
    if (bytes.length < 8) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }
    const u64Bytes = Uint8Array.from(bytes.subarray(0, 8));
    const u64 = BigNumber.from(u64Bytes.reverse());

    return resultHelper(Ok(new CLU64(u64)), bytes.subarray(8));
  }
}

export class CLU64 extends Numeric {
  constructor(num: BigNumberish) {
    super(64, false, num);
  }

  clType(): CLType {
    return new CLU64Type();
  }
}

// CLU128
export class CLU128Type extends CLType {
  linksTo = CLU128;
  tag = CLTypeTag.U128;

  toString(): string {
    return U128_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU128BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLU128, CLErrorCodes> {
    return fromBytesBigInt(rawBytes, 128);
  }
}

export class CLU128 extends Numeric {
  constructor(num: BigNumberish) {
    super(128, false, num);
  }

  clType(): CLType {
    return new CLU128Type();
  }
}

// CLU256
export class CLU256Type extends CLType {
  linksTo = CLU256;
  tag = CLTypeTag.U256;

  toString(): string {
    return U256_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU256BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLU256, CLErrorCodes> {
    return fromBytesBigInt(rawBytes, 256);
  }
}

export class CLU256 extends Numeric {
  constructor(num: BigNumberish) {
    super(256, false, num);
  }

  clType(): CLType {
    return new CLU256Type();
  }
}

// CLU512
export class CLU512Type extends CLType {
  linksTo = CLU512;
  tag = CLTypeTag.U512;

  toString(): string {
    return U512_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

export class CLU512BytesParser extends NumericBytesParser {
  fromBytesWithRemainder(
    rawBytes: Uint8Array
  ): ResultAndRemainder<CLU512, CLErrorCodes> {
    return fromBytesBigInt(rawBytes, 512);
  }
}

export class CLU512 extends Numeric {
  constructor(num: BigNumberish) {
    super(512, false, num);
  }

  clType(): CLType {
    return new CLU512Type();
  }
}

const fromBytesBigInt = (
  rawBytes: Uint8Array,
  bitSize: number
): ResultAndRemainder<CLU128 | CLU256 | CLU512, CLErrorCodes> => {
  if (rawBytes.length < 1) {
    return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
  }

  const byteSize = bitSize / 8;
  const n = rawBytes[0];

  if (n > byteSize) {
    return resultHelper(Err(CLErrorCodes.Formatting));
  }

  if (n + 1 > rawBytes.length) {
    return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
  }

  const bigIntBytes = n === 0 ? [0] : rawBytes.subarray(1, 1 + n);

  const remainder = rawBytes.subarray(1 + n);

  const value = BigNumber.from(bigIntBytes.reverse());

  // TODO: Refactor so this can be more generic
  if (bitSize === 128) {
    return resultHelper(Ok(new CLU128(value)), remainder);
  }
  if (bitSize === 256) {
    return resultHelper(Ok(new CLU256(value)), remainder);
  }
  if (bitSize === 512) {
    return resultHelper(Ok(new CLU512(value)), remainder);
  }

  return resultHelper(Err(CLErrorCodes.Formatting));
};
