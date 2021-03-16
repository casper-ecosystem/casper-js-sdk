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
    this.v = BigNumber.from(value);
  }

  value(): BigNumber {
    return this.v;
  }
}

// export class I32 extends Numeric {
//   constructor(v: number) {
//     super(32, true, v);
//   }

//   clType(): CLType {
//     return new I32Type();
//   }
// }

// export class I64 extends Numeric {
//   constructor(v: number) {
//     super(64, true, v);
//   }

//   clType(): CLType {
//     return new I64Type();
//   }
// }

const generateNumericClasses = (
  bitSize: number,
  isSigned: boolean,
  type: string
): { NumericSpecific: any; NumericType: any } => {
  class NumericType extends CLType {
    toString() {
      return type;
    }
  }
  class NumericSpecific extends Numeric {
    constructor(v: number) {
      super(bitSize, isSigned, v);
    }

    clType(): CLType {
      return new NumericType();
    }
  }
  return { NumericSpecific, NumericType };
};

export const { NumericSpecific: I32, NumericType: I32Type } = generateNumericClasses(32, true, 'I32');
export const { NumericSpecific: I64, NumericType: I64Type } = generateNumericClasses(64, true, 'I64');
export const { NumericSpecific: U8, NumericType: U8Type } = generateNumericClasses(8, false, 'U8');
export const { NumericSpecific: U32, NumericType: U32Type } = generateNumericClasses(32, false, 'U32');
export const { NumericSpecific: U64, NumericType: U64Type } = generateNumericClasses(64, false, 'U64');
export const { NumericSpecific: U128, NumericType: U128Type } = generateNumericClasses(128, false, 'U128');
export const { NumericSpecific: U256, NumericType: U256Type } = generateNumericClasses(256, false, 'U256');
export const { NumericSpecific: U512, NumericType: U512Type } = generateNumericClasses(512, false, 'U512');

// const x = new I128(12);
// console.log(x.value().toNumber());
// const y = new I128(2);
// console.log(y.value().toNumber());
// console.log(x.value().toNumber());
