import { jsonMember, jsonObject } from 'typedjson';
import { Conversions } from '../Conversions';
import { IResultWithBytes } from '../clvalue';
import { PrefixName } from './PrefixName';

/**
 * Enum representing the types of balance hold addresses.
 */
export enum BalanceHoldAddrTag {
  Gas = 0,
  Processing = 1
}

/**
 * Custom error class for BalanceHoldAddrTag related errors.
 */
export class BalanceHoldAddrTagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BalanceHoldAddrTagError';
  }
}

/**
 * Validates and returns the BalanceHoldAddrTag for a given tag number.
 * @param tag - The tag number to validate.
 * @returns The corresponding BalanceHoldAddrTag.
 * @throws BalanceHoldAddrTagError if the tag is invalid.
 */
export function getBalanceHoldAddrTag(tag: number): BalanceHoldAddrTag {
  if (tag === BalanceHoldAddrTag.Gas || tag === BalanceHoldAddrTag.Processing) {
    return tag;
  }
  throw new BalanceHoldAddrTagError('Invalid BalanceHoldAddrTag');
}

/**
 * Constants related to the structure of a BalanceHoldAddr.
 */
const ByteHashLen = 32;
const BlockTypeBytesLen = 8;

type URefAddr = Uint8Array;

/**
 * Represents a hold on a balance, including the address of the purse and the block time.
 */
@jsonObject
export class Hold {
  /**
   * The address of the purse on which the hold is placed.
   */
  @jsonMember({ name: 'PurseAddr', constructor: Uint8Array })
  purseAddr: URefAddr;

  /**
   * The block time at which the hold was created.
   */
  @jsonMember({
    name: 'BlockTime',
    constructor: Date,
    serializer: (n: number) => new Date(n).toISOString(),
    deserializer: (s: string) => Date.parse(s)
  })
  blockTime: Date;

  constructor(purseAddr: URefAddr, blockTime: Date) {
    this.purseAddr = purseAddr;
    this.blockTime = blockTime;
  }
}

/**
 * Represents an address holding a balance, categorized by either 'Gas' or 'Processing' type.
 */
@jsonObject
export class BalanceHoldAddr {
  /**
   * The hold categorized as 'Gas', if any.
   */
  @jsonMember({ name: 'Gas', constructor: Hold })
  gas?: Hold;

  /**
   * The hold categorized as 'Processing', if any.
   */
  @jsonMember({ name: 'Processing', constructor: Hold })
  processing?: Hold;

  constructor(gas?: Hold, processing?: Hold) {
    this.gas = gas;
    this.processing = processing;
  }

  /**
   * Parses a string representation of a BalanceHoldAddr and returns a new instance.
   * @param source - The string representation of the BalanceHoldAddr.
   * @returns A new BalanceHoldAddr instance.
   */
  static fromString(source: string): BalanceHoldAddr {
    const decoded = new Uint8Array(
      source.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    return BalanceHoldAddr.fromBytes(decoded)?.result;
  }

  /**
   * Converts the BalanceHoldAddr to a prefixed string, using 'balance-hold-' as the prefix.
   * @returns The prefixed string representation of the BalanceHoldAddr.
   */
  toPrefixedString(): string {
    const bytes = this.toBytes();
    return PrefixName.BalanceHold + Conversions.encodeBase16(bytes);
  }

  /**
   * Serializes the BalanceHoldAddr to its byte representation.
   * Includes a byte for the hold type, the purse address, and an 8-byte block time.
   * @returns The serialized byte representation of the BalanceHoldAddr.
   */
  toBytes(): Uint8Array {
    let hold = this.gas;
    let holdType = BalanceHoldAddrTag.Gas;

    if (this.processing) {
      holdType = BalanceHoldAddrTag.Processing;
      hold = this.processing;
    }

    const result = new Uint8Array(ByteHashLen + BlockTypeBytesLen + 1);
    result[0] = holdType;

    result.set(hold!.purseAddr, 1);

    const blockTimeMillis = hold!.blockTime.getTime();
    const blockTimeBuffer = Buffer.alloc(8);
    blockTimeBuffer.writeBigUInt64LE(BigInt(blockTimeMillis));
    result.set(blockTimeBuffer, ByteHashLen + 1);

    return result;
  }

  /**
   * Deserializes a BalanceHoldAddr from a byte array.
   * @param bytes - The byte array containing the BalanceHoldAddr data.
   * @returns A new BalanceHoldAddr instance.
   * @throws Error if the byte format is invalid.
   * @throws BalanceHoldAddrTagError if the hold type is unexpected.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<BalanceHoldAddr> {
    if (bytes.length < ByteHashLen + BlockTypeBytesLen + 1) {
      throw new Error('Invalid BalanceHoldAddr format');
    }

    const tag = bytes[0];
    const balanceHoldAddrTag = getBalanceHoldAddrTag(tag);

    const purseAddr = bytes.slice(1, ByteHashLen + 1);
    const blockTimeMillis = new DataView(
      bytes.buffer,
      ByteHashLen + 1
    ).getBigUint64(0, true);
    const blockTime = new Date(Number(blockTimeMillis));

    const hold = new Hold(purseAddr, blockTime);

    if (balanceHoldAddrTag === BalanceHoldAddrTag.Gas) {
      return { result: new BalanceHoldAddr(hold, undefined), bytes: purseAddr };
    } else if (balanceHoldAddrTag === BalanceHoldAddrTag.Processing) {
      return { result: new BalanceHoldAddr(undefined, hold), bytes: purseAddr };
    }

    throw new BalanceHoldAddrTagError('Unexpected BalanceHoldAddr type');
  }

  /**
   * Parses a JSON string representation of a BalanceHoldAddr.
   * @param json - The JSON string.
   * @returns A new BalanceHoldAddr instance.
   */
  public static fromJSON(json: string): BalanceHoldAddr {
    return this.fromString(json);
  }

  /**
   * Serializes the BalanceHoldAddr to its JSON string representation.
   * @returns The JSON string representation of the BalanceHoldAddr.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
