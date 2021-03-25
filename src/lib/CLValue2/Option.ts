// copy from https://github.com/CasperLabs/casper-node/blob/master/smart_contracts/contract_as/assembly/option.ts

import { concat } from '@ethersproject/bytes';

import { CLValue, CLType, ToBytes } from './index';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

export class CLOptionType<T extends CLType> extends CLType {
  inner: T;

  constructor(inner: T) {
    super();
    this.inner = inner;
  }

  toString(): string {
    return `Option (${this.inner.toString()})`;
  }
}

// TODO: Try to combine with https://github.com/vultix/ts-results/blob/master/test/option.test.ts
/**
 * A class representing an optional value, i.e. it might contain either a value of some type or
 * no value at all. Similar to Rust's `Option` or Haskell's `Maybe`.
 */
export class CLOption<T extends CLValue & ToBytes> extends CLValue
  implements ToBytes {
  private innerType: CLType;

  /**
   * Constructs a new option containing the value of `CLTypedAndToBytes`. `t` can be `null`, which
   * indicates no value.
   */
  constructor(public data: T | null, innerType?: CLType) {
    super();
    if (data === null) {
      if (!innerType) {
        throw new Error('You had to assign innerType for None');
      }
      this.innerType = innerType;
    } else {
      this.innerType = data.clType();
    }
  }

  /**
   * Checks whether the `Option` contains no value.
   *
   * @returns True if the `Option` has no value.
   */
  public isNone(): boolean {
    return this.data === null;
  }

  /**
   * Checks whether the `Option` contains a value.
   *
   * @returns True if the `Option` has some value.
   */
  public isSome(): boolean {
    return this.data !== null;
  }

  /**
   * Extract value.
   *
   * @returns CLValue if the `Option` has some value.
   */
  getSome(): CLValue {
    if (this.data !== null) {
      return this.data;
    }
    throw new Error('Value is None');
  }

  value(): CLValue | null {
    if (this.data !== null) {
      return this.data;
    }
    return null;
  }

  /**
   * Serializes the `Option` into an array of bytes.
   */
  public toBytes(): Uint8Array {
    if (this.data === null) {
      return Uint8Array.from([OPTION_TAG_NONE]);
    }
    return concat([Uint8Array.from([OPTION_TAG_SOME]), this.data.toBytes()]);
  }

  public clType(): CLType {
    return new CLOptionType(this.innerType);
  }
}
