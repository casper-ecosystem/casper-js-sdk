import { CLType, CLValue, ToBytes } from './Abstract';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { toBytesNumber } from "../ByteConverters";

abstract class Numeric extends CLValue implements ToBytes {
  data: BigNumber;
  bitSize: number;
  signed: boolean;

  constructor(bitSize: number, isSigned: boolean, value: BigNumberish) {
    super();
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

const generateNumericClasses = (
  bitSize: number,
  isSigned: boolean,
  type: string
  // TODO: Get rid of any below
): [any, CLType] => {
  class NumericType extends CLType {
    toString() {
      return type;
    }
  }
  class NumericSpecific extends Numeric {
    constructor(v: BigNumberish) {
      if (isSigned === false && Math.sign(v as number) < 0) {
        throw new Error("Can't provide negative numbers with isSigned=false");
      }
      super(bitSize, isSigned, v);
    }

    clType(): CLType {
      return new NumericType();
    }
  }
  return [NumericSpecific, NumericType];
};

export const [CLI32, CLI32Type] = generateNumericClasses(32, true, 'I32');
export const [CLI64, CLI64Type] = generateNumericClasses(64, true, 'I64');
export const [CLU8, CLU8Type] = generateNumericClasses(8, false, 'U8');
export const [CLU32, CLU32Type] = generateNumericClasses(32, false, 'U32');
export const [CLU64, CLU64Type] = generateNumericClasses(64, false, 'U64');
export const [CLU128, CLU128Type] = generateNumericClasses(128, false, 'U128');
export const [CLU256, CLU256Type] = generateNumericClasses(256, false, 'U256');
export const [CLU512, CLU512Type] = generateNumericClasses(512, false, 'U512');
