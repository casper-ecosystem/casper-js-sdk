import { expect } from 'vitest';

import { EntityAddr, Hash, MessageAddr } from '../../../types';

const hashHex = 'ab'.repeat(32);
const topicHex = 'cd'.repeat(32);
const entityAddr = EntityAddr.fromPrefixedString(`entity-account-${hashHex}`);
const topicNameHash = Hash.fromHex(topicHex);

describe('MessageAddr', () => {
  it('with a message index: fromString() / toPrefixedString() round-trips', () => {
    const addr = new MessageAddr(entityAddr, topicNameHash, 7);
    const str = addr.toPrefixedString();

    expect(str).to.equal(
      `message-${entityAddr.toPrefixedString()}-${topicHex}-7`
    );
    expect(MessageAddr.fromString(str).toPrefixedString()).to.equal(str);
  });

  it('topic-only (no index): fromString() / toPrefixedString() round-trips', () => {
    const addr = new MessageAddr(entityAddr, topicNameHash, undefined);
    const str = addr.toPrefixedString();

    expect(str).to.equal(
      `message-topic-${entityAddr.toPrefixedString()}-${topicHex}`
    );
    expect(MessageAddr.fromString(str).toPrefixedString()).to.equal(str);
  });

  it('fromString() requires the message- prefix', () => {
    expect(() => MessageAddr.fromString('bogus-')).to.throw(
      "Key not valid. It should start with 'message-'."
    );
  });

  it('toJSON() / fromString() round-trips', () => {
    // MessageAddr has no static fromJSON(); toJSON() is just an alias for
    // toPrefixedString(), so fromString() is its inverse.
    const addr = new MessageAddr(entityAddr, topicNameHash, 3);
    const json = addr.toJSON();

    expect(MessageAddr.fromString(json).toPrefixedString()).to.equal(json);
  });

  it('round-trips through toBytes()/fromBytes()', () => {
    const addr = new MessageAddr(entityAddr, topicNameHash, 3);
    const { result } = MessageAddr.fromBytes(addr.toBytes());

    expect(result.topicNameHash?.toHex()).to.equal(topicHex);
    expect(result.entityAddr.toPrefixedString()).to.equal(
      entityAddr.toPrefixedString()
    );
    expect(result.messageIndex).to.equal(3);
  });
});
