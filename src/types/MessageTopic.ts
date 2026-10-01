import { jsonObject, jsonMember } from 'typedjson';
import { EntityAddr, Hash } from './key';
import { ModuleBytes } from './ExecutableDeployItem';

/**
 * Represents a summary of a message topic, including the number of messages and block time.
 */
@jsonObject
export class MessageTopicSummary {
  /**
   * The total number of messages in this topic.
   */
  @jsonMember({ name: 'message_count', constructor: Number })
  messageCount: number;

  /**
   * The block time associated with the topic.
   */
  @jsonMember({ name: 'blocktime', constructor: Number })
  blockTime: number;
}

/**
 * Represents a checksum for a message, stored as a string.
 */
export type MessageChecksum = string;

/**
 * Represents a message topic, including the topic name and its hash.
 */
@jsonObject
export class MessageTopic {
  /**
   * The name of the message topic.
   */
  @jsonMember({ name: 'topic_name', constructor: String })
  topicName: string;

  /**
   * The hash of the message topic name.
   */
  @jsonMember({
    name: 'topic_name_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  topicNameHash: Hash;
}

/**
 * Represents the payload of a message, which can either be a string or bytes.
 */
@jsonObject
export class MessagePayload {
  /**
   * The string payload of the message, if available.
   */
  @jsonMember({ name: 'String', constructor: String })
  string?: string;

  /**
   * The bytes payload of the message, if available.
   */
  @jsonMember({
    name: 'Bytes',
    constructor: ModuleBytes
  })
  bytes?: ModuleBytes;
}

/**
 * Represents a message with a payload, topic, and related metadata.
 */
@jsonObject
export class Message {
  /**
   * The payload of the message, which can either be a string or bytes.
   */
  @jsonMember({
    name: 'message',
    constructor: MessagePayload
  })
  message: MessagePayload;

  /**
   * The name of the topic associated with this message.
   */
  @jsonMember({ name: 'topic_name', constructor: String })
  topicName: string;

  /**
   * The hash of the topic name, which is used to identify the topic.
   */
  @jsonMember({
    name: 'topic_name_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  topicNameHash: Hash;

  /**
   * The address of the entity that emitted the message.
   */
  @jsonMember({
    name: 'entity_addr',
    constructor: EntityAddr,
    deserializer: json => EntityAddr.fromJSON(json),
    serializer: (value: EntityAddr) => value.toJSON()
  })
  entityAddr: EntityAddr;

  /**
   * The index of the block where the message was included.
   */
  @jsonMember({ name: 'block_index', constructor: Number })
  blockIndex: number;

  /**
   * The index of the topic within the block.
   */
  @jsonMember({ name: 'topic_index', constructor: Number })
  topicIndex: number;
}
