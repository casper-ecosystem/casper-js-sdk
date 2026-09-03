import { jsonMember, jsonObject } from 'typedjson';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum representing the types of block global addresses.
 */
export enum BlockGlobalAddrTag {
  BlockTime = 0,
  MessageCount = 1
}

/**
 * Custom error class for errors related to BlockGlobalAddrTag.
 */
export class BlockGlobalAddrTagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockGlobalAddrTagError';
  }
}

/**
 * Validates and returns the BlockGlobalAddrTag for a given tag number.
 * @param tag - The tag number to validate.
 * @returns The corresponding BlockGlobalAddrTag.
 * @throws BlockGlobalAddrTagError if the tag is invalid.
 */
export function getBlockGlobalAddrTag(tag: number): BlockGlobalAddrTag {
  if ((Object.values(BlockGlobalAddrTag) as unknown[]).includes(tag)) {
    return tag as BlockGlobalAddrTag;
  }
  throw new BlockGlobalAddrTagError('Invalid BlockGlobalAddrTag');
}

const BlockTimePrefix = 'time-';
const MessageCountPrefix = 'message-count-';
const PrefixNameBlockGlobal = 'block-global-';

/**
 * Represents a block global address within the system, supporting both block time and message count addresses.
 */
@jsonObject
export class BlockGlobalAddr {
  /**
   * The block time object, if this is a block time address.
   */
  @jsonMember({ name: 'BlockTime', constructor: Object })
  blockTime?: object;

  /**
   * The message count object, if this is a message count address.
   */
  @jsonMember({ name: 'MessageCount', constructor: Object })
  messageCount?: object;

  /**
   * Constructs a new BlockGlobalAddr instance.
   * @param blockTime - Optional parameter for the block time object.
   * @param messageCount - Optional parameter for the message count object.
   */
  constructor(blockTime?: object, messageCount?: object) {
    this.blockTime = blockTime;
    this.messageCount = messageCount;
  }

  /**
   * Creates a BlockGlobalAddr from a string representation.
   * @param source - The string representation of the block global address.
   * @returns A new BlockGlobalAddr instance.
   * @throws Error if the format does not match known block global address types.
   */
  static fromString(source: string): BlockGlobalAddr {
    if (source.startsWith(BlockTimePrefix)) {
      return new BlockGlobalAddr({}, undefined);
    } else if (source.startsWith(MessageCountPrefix)) {
      return new BlockGlobalAddr(undefined, {});
    }
    throw new Error('Invalid BlockGlobalAddr format');
  }

  /**
   * Returns a prefixed string representation of the BlockGlobalAddr.
   * @returns A prefixed string that includes the block global address type and a default hash value.
   */
  toPrefixedString(): string {
    const prefix = this.blockTime ? BlockTimePrefix : MessageCountPrefix;
    const emptyHash = '0'.repeat(64);
    return `${PrefixNameBlockGlobal}${prefix}${emptyHash}`;
  }

  /**
   * Creates a BlockGlobalAddr from a byte array representation.
   * @param bytes - The byte array containing the tag for the block global address type.
   * @returns An instance of BlockGlobalAddr representing the given type.
   * @throws Error if the byte array tag does not match any known BlockGlobalAddr type.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<BlockGlobalAddr> {
    const tagByte = bytes[0];
    const tag = getBlockGlobalAddrTag(tagByte);

    if (tag === BlockGlobalAddrTag.BlockTime) {
      return { result: new BlockGlobalAddr({}, undefined), bytes };
    } else if (tag === BlockGlobalAddrTag.MessageCount) {
      return { result: new BlockGlobalAddr(undefined, {}), bytes };
    }

    throw new Error('Unexpected BlockGlobalAddr type');
  }

  /**
   * Converts the BlockGlobalAddr to a byte array representation.
   * @returns A Uint8Array containing the byte tag representing the block global address type.
   */
  toBytes(): Uint8Array {
    const tag = this.messageCount
      ? BlockGlobalAddrTag.MessageCount
      : BlockGlobalAddrTag.BlockTime;
    return Uint8Array.of(tag);
  }

  /**
   * Creates a BlockGlobalAddr from a JSON string representation.
   * @param json - The JSON string representation.
   * @returns A new BlockGlobalAddr instance.
   */
  public static fromJSON(json: string): BlockGlobalAddr {
    return this.fromString(json);
  }

  /**
   * Converts the BlockGlobalAddr to its JSON string representation.
   * @returns The JSON string that represents this BlockGlobalAddr.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
