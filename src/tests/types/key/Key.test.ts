import { expect } from 'vitest';

import { Key, KeyTypeID, MessageAddr, TransferHash } from '../../../types';

describe('Key', () => {
  let hashAddr =
    'entity-contract-55d4a6915291da12afded37fa5bc01f0803a2f0faf6acb7ec4c7ca6ab76f3330';
  let topicStr =
    '5721a6d9d7a9afe5dfdb35276fb823bed0f825350e4d865a5ec0110c380de4e1';
  let msgKeyStr = `message-topic-${hashAddr}-${topicStr}`;

  it('should correctly parse a key with hash address, topic hash, and index', () => {
    const messageAddr = MessageAddr.fromString(msgKeyStr);

    expect(messageAddr.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(messageAddr.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message by type', () => {
    const key = Key.createByType(msgKeyStr, KeyTypeID.Message);

    expect(key.toPrefixedString()).to.equal(msgKeyStr);
    expect(key.message?.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(key.message?.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message', () => {
    const key = Key.newKey(msgKeyStr);

    expect(key.toPrefixedString()).to.equal(msgKeyStr);
    expect(key.message?.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(key.message?.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message for entity contract with index', () => {
    hashAddr =
      'entity-contract-55d4a6915291da12afded37fa5bc01f0803a2f0faf6acb7ec4c7ca6ab76f3330';
    topicStr =
      '5721a6d9d7a9afe5dfdb35276fb823bed0f825350e4d865a5ec0110c380de4e1';
    const indexStr = '0f';
    msgKeyStr = `message-${hashAddr}-${topicStr}-${indexStr}`;
    const messageAddr = MessageAddr.fromString(msgKeyStr);

    expect(messageAddr.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(messageAddr.topicNameHash.toHex()).to.equal(topicStr);
    expect(messageAddr.messageIndex).to.equal(15);
  });
});

// Key variants a 2.x node formats but a 1.x-era SDK never saw. `Key.newKey`
// throws on an unknown prefix, so one of these sinks the whole payload.
describe('Key variants of Casper 2.x', () => {
  const contractHex =
    '4242424242424242424242424242424242424242424242424242424242424242';
  const padding = '0'.repeat(64);

  it('parses the rewards-handling key introduced in node 2.2.0', () => {
    const source = `rewards-handling-${padding}`;

    const key = Key.newKey(source);

    expect(key.type).to.equal(KeyTypeID.RewardsHandling);
    expect(key.toPrefixedString()).to.equal(source);
  });

  it('round-trips a rewards-handling key through bytes', () => {
    const key = Key.newKey(`rewards-handling-${padding}`);

    const bytes = key.bytes();

    expect(bytes.length).to.equal(33);
    expect(bytes[0]).to.equal(KeyTypeID.RewardsHandling);
    expect(Key.fromBytes(bytes).result.toPrefixedString()).to.equal(
      key.toPrefixedString()
    );
  });

  it('rejects a rewards-handling key whose padding is not 32 bytes', () => {
    expect(() => Key.newKey('rewards-handling-00')).to.throw(
      'invalid RewardsHandling key'
    );
  });

  it('parses a state key addressed by entity', () => {
    const source = `state-entity-contract-${contractHex}`;

    const key = Key.newKey(source);

    expect(key.type).to.equal(KeyTypeID.State);
    expect(key.state?.smartContract?.toHex()).to.equal(contractHex);
    expect(key.toPrefixedString()).to.equal(source);
  });

  it('round-trips a state key through bytes', () => {
    const key = Key.newKey(`state-entity-contract-${contractHex}`);

    const bytes = key.bytes();

    expect(bytes[0]).to.equal(KeyTypeID.State);
    expect(Key.fromBytes(bytes).result.toPrefixedString()).to.equal(
      key.toPrefixedString()
    );
  });

  // The node has formatted this key `system-entity-registry-` since 2.0 and
  // rejects the 1.x spelling, so these three: read both, write the node's.
  it('parses the system-entity-registry spelling a 2.x node emits', () => {
    const key = Key.newKey(`system-entity-registry-${padding}`);

    expect(key.type).to.equal(KeyTypeID.SystemContractRegistry);
    expect(key.systemContactRegistry?.toHex()).to.equal(padding);
  });

  it('writes the system-entity-registry spelling whichever one it parsed', () => {
    const fromLegacy = Key.newKey(`system-contract-registry-${padding}`);

    expect(fromLegacy.toPrefixedString()).to.equal(
      `system-entity-registry-${padding}`
    );
  });

  it('still parses the legacy system-contract-registry spelling', () => {
    const key = Key.newKey(`system-contract-registry-${padding}`);

    expect(key.type).to.equal(KeyTypeID.SystemContractRegistry);
    expect(key.systemContactRegistry?.toHex()).to.equal(padding);
  });
});

describe('TransferHash', () => {
  const hashHex =
    '0e5a1a2c8b19b9c0f4d2e6f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1';

  // Every accepted source shape is covered because the constructor must call
  // `super(...)` unconditionally: a conditional call half-builds the object
  // under `target: es5` and is a ReferenceError under native ES classes.
  it('should build from a prefixed hex string and keep the transfer prefix', () => {
    const hash = new TransferHash(`transfer-${hashHex}`);

    expect(hash.toHex()).to.equal(hashHex);
    expect(hash.originPrefix).to.equal('transfer-');
    expect(hash.toPrefixedString()).to.equal(`transfer-${hashHex}`);
  });

  it('should build from an unprefixed hex string with an empty origin prefix', () => {
    const hash = new TransferHash(hashHex);

    expect(hash.toHex()).to.equal(hashHex);
    expect(hash.originPrefix).to.equal('');
  });

  it('should build from raw bytes', () => {
    const bytes = Uint8Array.from(Buffer.from(hashHex, 'hex'));
    const hash = new TransferHash(bytes);

    expect(hash.toHex()).to.equal(hashHex);
    expect(hash.toBytes()).to.deep.equal(bytes);
  });
});
