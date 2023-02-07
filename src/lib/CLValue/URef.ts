import { concat } from '@ethersproject/bytes';
import { Ok, Err } from 'ts-results';

import {
  CLType,
  CLValue,
  CLValueBytesParsers,
  CLErrorCodes,
  ResultAndRemainder,
  ToBytesResult,
  resultHelper,
  padNum
} from './index';
import { UREF_ID, CLTypeTag } from './constants';
import { decodeBase16, encodeBase16 } from '../Conversions';

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
  linksTo = UREF_ID;
  tag = CLTypeTag.URef;

  toString(): string {
    return UREF_ID;
  }

  toJSON(): string {
    return this.toString();
  }
}

const FORMATTED_STRING_PREFIX = 'uref';
/**
 * Length of [[URef]] address field.
 * @internal
 */
const UREF_ADDR_LENGTH = 32;
/**
 * Length of [[ACCESS_RIGHT]] field.
 * @internal
 */
const ACCESS_RIGHT_LENGTH = 1;

const UREF_BYTES_LENGTH = UREF_ADDR_LENGTH + ACCESS_RIGHT_LENGTH;

export class CLURefBytesParser extends CLValueBytesParsers {
  toBytes(val: CLURef): ToBytesResult {
    return Ok(concat([val.data, Uint8Array.from([val.accessRights])]));
  }

  fromBytesWithRemainder(
    bytes: Uint8Array
  ): ResultAndRemainder<CLURef, CLErrorCodes> {
    if (bytes.length < UREF_BYTES_LENGTH) {
      return resultHelper(Err(CLErrorCodes.EarlyEndOfStream));
    }

    const urefBytes = bytes.subarray(0, UREF_ADDR_LENGTH);
    const accessRights = bytes[UREF_BYTES_LENGTH - 1];
    const uref = new CLURef(urefBytes, accessRights);
    return resultHelper(Ok(uref), bytes.subarray(UREF_BYTES_LENGTH));
  }
}

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

    if (!Object.values(AccessRights).includes(accessRights)) {
      throw new Error('Unsuported AccessRights');
    }

    this.data = v;
    this.accessRights = accessRights;
  }

  /**
   * Parses a casper-client supported string formatted argument into a `URef`.
   */
  static fromFormattedStr(input: string): CLURef {
    if (!input.startsWith(`${FORMATTED_STRING_PREFIX}-`)) {
      throw new Error("Prefix is not 'uref-'");
    }
    const parts = input
      .substring(`${FORMATTED_STRING_PREFIX}-`.length)
      .split('-', 2);
    if (parts.length !== 2) {
      throw new Error('No access rights as suffix');
    }

    const addr = decodeBase16(parts[0]);
    const accessRight = parseInt(parts[1], 8) as AccessRights;

    return new CLURef(addr, accessRight);
  }

  toFormattedStr(): string {
    return [
      FORMATTED_STRING_PREFIX,
      encodeBase16(this.data),
      padNum(this.accessRights.toString(8), 3)
    ].join('-');
  }

  toJSON(): string {
    return this.toFormattedStr();
  }

  clType(): CLType {
    return new CLURefType();
  }

  value(): { data: Uint8Array; accessRights: AccessRights } {
    return { data: this.data, accessRights: this.accessRights };
  }
}
