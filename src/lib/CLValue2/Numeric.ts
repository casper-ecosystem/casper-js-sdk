import { CLType, CLValue } from './Abstract';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

abstract class Numeric extends CLValue {
  v: BigNumber;
  bitSize: number;
  signed: boolean;

  constructor(bitSize: number, isSigned: boolean, value: BigNumberish) {
    super();
    this.bitSize = bitSize;
    this.signed = isSigned;
    // TBD: we need to check here. Unsigned and negative value etc
    this.v = BigNumber.from(value);
  }

  value(): BigNumber {
    return this.v;
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

// const x = new I128(12);
// console.log(x.value().toNumber());
// const y = new I128(2);
// console.log(y.value().toNumber());
// console.log(x.value().toNumber());
