import { CLType, CLValue } from './Abstract';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

abstract class Numeric extends CLValue {
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

export const [I32, I32Type] = generateNumericClasses(32, true, 'I32');
export const [I64, I64Type] = generateNumericClasses(64, true, 'I64');
export const [U8, U8Type] = generateNumericClasses(8, false, 'U8');
export const [U32, U32Type] = generateNumericClasses(32, false, 'U32');
export const [U64, U64Type] = generateNumericClasses(64, false, 'U64');
export const [U128, U128Type] = generateNumericClasses(128, false, 'U128');
export const [U256, U256Type] = generateNumericClasses(256, false, 'U256');
export const [U512, U512Type] = generateNumericClasses(512, false, 'U512');
