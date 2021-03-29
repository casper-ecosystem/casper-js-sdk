import { concat } from '@ethersproject/bytes';

import { Option } from 'ts-results';

import { CLValue, CLType, ToBytes } from './index';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType extends CLType {
  toString(): string {
    return "Option" 
  }
}

export class GenericOption <T> {
  /**
   * Constructs a new option containing the value of Some or None from ts-result.
   */
  constructor(public data: Option<T>) {}

  /**
   * Checks whether the `Option` contains no value.
   *
   * @returns True if the `Option` has no value.
   */
  isNone(): boolean {
    return this.data.none;
  }

  /**
   * Checks whether the `Option` contains a value.
   *
   * @returns True if the `Option` has some value.
   */
  isSome(): boolean {
    return this.data.some;
  }

  /**
   * Returns Option from ts-result based on stored value
   */
  value(): Option<T> {
    return this.data;
  }
}

export class CLOption extends GenericOption<CLValue & ToBytes> implements CLValue, ToBytes {
  clType(): CLType {
    return new CLOptionType();
  }

  /**
   * Serializes the `Option` into an array of bytes.
   */
  toBytes(): Uint8Array {
    if (this.data.none) {
      return Uint8Array.from([OPTION_TAG_NONE]);
    }
    if (this.data.some) {
      return concat([Uint8Array.from([OPTION_TAG_SOME]), this.data.val.toBytes()]);
    }

    throw new Error('Unknown stored value');
  }
}
