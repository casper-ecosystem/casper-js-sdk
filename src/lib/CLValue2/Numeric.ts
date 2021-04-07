// import { Ok, Err } from 'ts-results';
import {
  CLType,
  CLValue,
  ToBytes,
  // ResultAndRemainder,
  // CLErrorCodes,
  // resultHelper
} from './index';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { toBytesNumber } from '../ByteConverters';

abstract class Numeric extends CLValue implements ToBytes {
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
    // TBD: we need to check here. Unsigned and negative value etc
    this.data = BigNumber.from(value);
  }

  value(): BigNumber {
    return this.data;
  }

  toBytes(): Uint8Array {
    return toBytesNumber(this.bitSize, this.signed)(this.data);
  }
}

export class CLI32Type extends CLType {
  toString(): string {
    return "I32";
  }
}

export class CLI64Type extends CLType {
  toString(): string {
    return "I64";
  }
}

export class CLU8Type extends CLType {
  toString(): string {
    return "U8";
  }
}

export class CLU32Type extends CLType {
  toString(): string {
    return "U32";
  }
}

export class CLU64Type extends CLType {
  toString(): string {
    return "U64";
  }
}

export class CLU128Type extends CLType {
  toString(): string {
    return "U128";
  }
}

export class CLU256Type extends CLType {
  toString(): string {
    return "U256";
  }
}

export class CLU512Type extends CLType {
  toString(): string {
    return "U512";
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

export class CLI64 extends Numeric {
  constructor(num: BigNumberish) {
    super(64, true, num);
  }

  clType(): CLType {
    return new CLI64Type();
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

export class CLU32 extends Numeric {
  constructor(num: BigNumberish) {
    super(32, false, num);
  }

  clType(): CLType {
    return new CLU32Type();
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

export class CLU128 extends Numeric {
  constructor(num: BigNumberish) {
    super(128, false, num);
  }

  clType(): CLType {
    return new CLU128Type();
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

export class CLU512 extends Numeric {
  constructor(num: BigNumberish) {
    super(512, false, num);
  }

  clType(): CLType {
    return new CLU512Type();
  }
}
