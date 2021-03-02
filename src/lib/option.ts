// copy from https://github.com/CasperLabs/casper-node/blob/master/smart_contracts/contract_as/assembly/option.ts
import {
  CLType,
  CLTypedAndToBytes,
  CLTypeHelper,
  CLValue,
  fromBytesByCLType,
  FromBytesError,
  OptionType,
  Result,
  U8
} from './CLValue';
import { concat } from '@ethersproject/bytes';

const OPTION_TAG_NONE = 0;
const OPTION_TAG_SOME = 1;

// TODO: explore Option<T> (without interfaces to constrain T with, is it practical?)
/**
 * A class representing an optional value, i.e. it might contain either a value of some type or
 * no value at all. Similar to Rust's `Option` or Haskell's `Maybe`.
 */
export class Option extends CLTypedAndToBytes {
  private innerType: CLType;

  /**
   * Constructs a new option containing the value of `CLTypedAndToBytes`. `t` can be `null`, which
   * indicates no value.
   */
  constructor(private t: CLTypedAndToBytes | null, innerType?: CLType) {
    super();
    if (t === null) {
      if (!innerType) {
        throw new Error('You had to assign innerType for None');
      }
      this.innerType = innerType;
    } else {
      this.innerType = t.clType();
    }
  }

  /**
   * Checks whether the `Option` contains no value.
   *
   * @returns True if the `Option` has no value.
   */
  public isNone(): boolean {
    return this.t === null;
  }

  /**
   * Checks whether the `Option` contains a value.
   *
   * @returns True if the `Option` has some value.
   */
  public isSome(): boolean {
    return this.t !== null;
  }

  /**
   * Extract value.
   *
   * @returns CLValue if the `Option` has some value.
   */
  public getSome(): CLValue {
    if (!this.isSome()) {
      throw new Error('Value is None');
    }
    return CLValue.fromT(this.t!);
  }

  /**
   * Serializes the `Option` into an array of bytes.
   */
  public toBytes() {
    if (this.t === null) {
      return Uint8Array.from([OPTION_TAG_NONE]);
    }
    return concat([Uint8Array.from([OPTION_TAG_SOME]), this.t.toBytes()]);
  }

  public clType(): CLType {
    return CLTypeHelper.option(this.innerType!);
  }

  public static fromBytes(type: OptionType, bytes: Uint8Array): Result<Option> {
    const u8Res = U8.fromBytes(bytes);
    if (u8Res.hasError()) {
      return Result.Err(u8Res.error);
    }
    const optionTag = u8Res.value().val.toNumber();
    if (optionTag === OPTION_TAG_NONE) {
      return Result.Ok(new Option(null, type.innerType), u8Res.remainder());
    } else if (optionTag === OPTION_TAG_SOME) {
      const innerValueRes = fromBytesByCLType(
        type.innerType,
        u8Res.remainder()
      );
      if (innerValueRes.hasError()) {
        return Result.Err(innerValueRes.error);
      }
      return Result.Ok(
        new Option(innerValueRes.value(), type.innerType),
        innerValueRes.remainder()
      );
    } else {
      return Result.Err(FromBytesError.FormattingError);
    }
  }
}
