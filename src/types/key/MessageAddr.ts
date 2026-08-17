import { jsonMember, jsonObject } from 'typedjson';

import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';
import { EntityAddr } from './EntityAddr';

/** Prefix for topics in MessageAddr. */
const TopicPrefix = 'topic-';

/** Prefix for messages in MessageAddr. */
const PrefixNameMessage = 'message-';

/**
 * Represents an addressable message within the system. The address is composed of an associated entity address,
 * a hashed topic name, and an optional message index. It offers various utilities for serialization, deserialization,
 * and converting the address into prefixed string and byte representations.
 */
@jsonObject
export class MessageAddr {
  /** The address of the associated entity. */
  @jsonMember({
    name: 'EntityAddr',
    constructor: EntityAddr,
    deserializer: json => {
      if (!json) return;
      return EntityAddr.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  public entityAddr: EntityAddr;

  /** The hash of the topic name associated with this message. */
  @jsonMember({ name: 'TopicNameHash', constructor: Hash })
  public topicNameHash: Hash;

  /** The optional index of the message within the topic. */
  @jsonMember({ name: 'MessageIndex', constructor: Number })
  public messageIndex?: number;

  /**
   * Creates an instance of MessageAddr.
   * @param entityAddr - The address of the associated entity.
   * @param topicNameHash - The hash of the topic name.
   * @param messageIndex - Optional index of the message.
   */
  constructor(
    entityAddr: EntityAddr,
    topicNameHash: Hash,
    messageIndex?: number
  ) {
    this.entityAddr = entityAddr;
    this.topicNameHash = topicNameHash;
    this.messageIndex = messageIndex;
  }

  /**
   * Instantiates a `MessageAddr` from its string representation.
   * The string should follow the prefixed format used in the system.
   * @param source - The string representation of the MessageAddr.
   * @returns A new MessageAddr instance.
   * @throws Error if the provided string does not match the expected format.
   */
  static fromString(source: string): MessageAddr {
    if (!source.startsWith(PrefixNameMessage)) {
      throw new Error(
        `Key not valid. It should start with '${PrefixNameMessage}'.`
      );
    }

    let remaining = source.substring(PrefixNameMessage.length);

    let hashAddr: string;
    let topicHash: string;
    let index: number | undefined;

    if (remaining.startsWith(TopicPrefix)) {
      remaining = remaining.substring(TopicPrefix.length);
      const parts = remaining.split('-');

      if (parts.length !== 4) {
        throw new Error(
          'Key not valid. It should have a hash address and a topic hash.'
        );
      }

      hashAddr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      topicHash = parts[3];
    } else {
      const parts = remaining.split('-');

      if (parts.length !== 5) {
        throw new Error(
          'Key not valid. It should have a hash address, a topic hash, and a message index.'
        );
      }

      hashAddr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      topicHash = parts[3];

      if (parts[4].length === 0) {
        throw new Error('Key not valid. Expected a non-empty message index.');
      }

      index = parseInt(parts[4], 16);
    }

    return new MessageAddr(
      EntityAddr.fromPrefixedString(hashAddr),
      Hash.fromHex(topicHash),
      index
    );
  }

  /**
   * Converts the `MessageAddr` into a standardized prefixed string format.
   * Useful for displaying or storing the address in text format.
   * @returns A prefixed string representation of the `MessageAddr`.
   */
  toPrefixedString(): string {
    let result = PrefixNameMessage;
    if (!this.messageIndex) {
      result += TopicPrefix;
    }
    result += this.entityAddr.toPrefixedString();
    result += '-' + this.topicNameHash.toHex();

    if (this.messageIndex !== undefined) {
      result += `-${this.messageIndex}`;
    }

    return result;
  }

  /**
   * Serializes the `MessageAddr` into a JSON-compatible string format.
   * Primarily used for JSON-based data exchange.
   * @returns A JSON string representation of the `MessageAddr`.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Constructs a `MessageAddr` instance from a byte array.
   * Interprets the byte array in a structured format to extract
   * the entity address, topic name hash, and optionally, the message index.
   * @param bytes - The byte array representing the MessageAddr.
   * @returns A new `MessageAddr` instance wrapped in an `IResultWithBytes`.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<MessageAddr> {
    // Each reader consumes from the previous one's remainder; handed the
    // original buffer, the topic hash would re-read the entity's own bytes.
    const entityAddr = EntityAddr.fromBytes(bytes);
    const topicNameHash = Hash.fromBytes(entityAddr.bytes);
    let remainder = topicNameHash.bytes;

    let messageIndex: number | undefined;
    if (remainder.length >= 4) {
      messageIndex = new DataView(
        remainder.buffer,
        remainder.byteOffset,
        4
      ).getUint32(0, true);
      remainder = remainder.subarray(4);
    }

    return {
      result: new MessageAddr(
        entityAddr?.result,
        topicNameHash?.result,
        messageIndex
      ),
      bytes: remainder
    };
  }

  /**
   * Converts the `MessageAddr` to a byte array, enabling binary data storage.
   * Useful for transmission or storage where a compact format is needed.
   * @returns A `Uint8Array` representing the `MessageAddr`.
   */
  toBytes(): Uint8Array {
    const entityBytes = this.entityAddr.toBytes();
    const topicBytes = this.topicNameHash.toBytes();
    const result = new Uint8Array(
      entityBytes.length +
        topicBytes.length +
        (this.messageIndex !== undefined ? 4 : 0)
    );

    result.set(entityBytes);
    result.set(topicBytes, entityBytes.length);

    if (this.messageIndex !== undefined) {
      const indexBuffer = new Uint8Array(4);
      new DataView(indexBuffer.buffer).setUint32(0, this.messageIndex, true);
      result.set(indexBuffer, entityBytes.length + topicBytes.length);
    }

    return result;
  }
}
