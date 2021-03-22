import { CLType, CLValue } from './Abstract';
import { decodeBase16, encodeBase16 } from '../Conversions';

// TBD: Maybe this should be in one file like src/lib/constants.ts ?
export enum AccessRights {
  // No permissions
  None = 0b0,
  // Permission to read the value under the associated [[URef]].
  READ = 0b001,
  // Permission to write a value under the associated [[URef]].
  WRITE = 0b010,
  // Permission to add to the value under the associated [[URef]].
  ADD = 0b100,
  // Permission to read or write the value under the associated [[URef]].
  READ_WRITE = AccessRights.READ | AccessRights.WRITE,
  // Permission to read or add to the value under the associated [[URef]].
  READ_ADD = AccessRights.READ | AccessRights.ADD,
  // Permission to add to, or write the value under the associated [[URef]].
  ADD_WRITE = AccessRights.ADD | AccessRights.WRITE,
  // Permission to read, add to, or write the value under the associated [[URef]].
  READ_ADD_WRITE = AccessRights.READ | AccessRights.ADD | AccessRights.WRITE
}

export class CLURefType extends CLType {
  toString(): string {
    return 'URef';
  }
}

const FORMATTED_STRING_PREFIX = 'uref-';

export class CLURef extends CLValue {
  data: Uint8Array;
  accessRights: AccessRights;

  /**
   * Constructs new instance of URef.
   * @param uRefAddr Bytes representing address of the URef.
   * @param accessRights Access rights flag. Use [[AccessRights.NONE]] to indicate no permissions.
   */
  constructor(v: Uint8Array, accessRights: AccessRights) {
    super();
    if (v.byteLength !== 32) {
      throw new Error('The length of URefAddr should be 32');
    }
    this.data = v;
    this.accessRights = accessRights;
  }

  /**
   * Parses a casper-client supported string formatted argument into a `URef`.
   */
  static fromFormattedStr(input: string): CLURef {
    if (!input.startsWith(FORMATTED_STRING_PREFIX)) {
      throw new Error("prefix is not 'uref-'");
    }
    const parts = input.substring(FORMATTED_STRING_PREFIX.length).split('-', 2);
    if (parts.length !== 2) {
      throw new Error('no access rights as suffix');
    }

    const addr = decodeBase16(parts[0]);
    const accessRight = parseInt(parts[1], 8) as AccessRights;

    return new CLURef(addr, accessRight);
  }

  toFormattedStr(): string {
    return [
      FORMATTED_STRING_PREFIX,
      encodeBase16(this.data),
      this.accessRights.toString(8)
    ].join('-');
  }

  clType(): CLType {
    return new CLURefType();
  }

  value(): { data: Uint8Array, accessRights: AccessRights } {
    return { data: this.data, accessRights: this.accessRights };
  }
}
