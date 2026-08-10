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

describe('TransferHash', () => {
  const hashHex =
    '0e5a1a2c8b19b9c0f4d2e6f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1';

  // Regression guard for the conditional `super(...)` these constructors used to
  // have: it produced no super call on some paths, which is a ReferenceError
  // under native ES classes and silently half-built the object under `target:
  // es5`. Both source shapes must build a usable hash.
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
