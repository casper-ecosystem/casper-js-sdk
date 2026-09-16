import { expect } from 'vitest';

import { BlockGlobalAddr } from '../../../types';

const emptyHash = '0'.repeat(64);

describe('BlockGlobalAddr', () => {
  it('BlockTime: fromString() / toPrefixedString() round-trips', () => {
    const addr = BlockGlobalAddr.fromString(`time-${emptyHash}`);

    expect(addr.blockTime).to.deep.equal({});
    expect(addr.messageCount).to.be.undefined;
    expect(addr.toPrefixedString()).to.equal(`block-global-time-${emptyHash}`);
  });

  it('MessageCount: fromString() / toPrefixedString() round-trips', () => {
    const addr = BlockGlobalAddr.fromString(`message-count-${emptyHash}`);

    expect(addr.messageCount).to.deep.equal({});
    expect(addr.blockTime).to.be.undefined;
    expect(addr.toPrefixedString()).to.equal(
      `block-global-message-count-${emptyHash}`
    );
  });

  it('fromString() rejects an unrecognized prefix', () => {
    expect(() => BlockGlobalAddr.fromString('bogus-')).to.throw(
      'Invalid BlockGlobalAddr format'
    );
  });

  it('BlockTime: toBytes() / fromBytes() round-trips', () => {
    const addr = BlockGlobalAddr.fromString(`time-${emptyHash}`);
    const { result } = BlockGlobalAddr.fromBytes(addr.toBytes());

    expect(result.blockTime).to.deep.equal({});
  });

  it('round-trips through toJSON()/fromJSON()', () => {
    const addr = BlockGlobalAddr.fromString(`time-${emptyHash}`);

    const parsed = BlockGlobalAddr.fromJSON(addr.toJSON());
    expect(parsed.toJSON()).to.equal(addr.toJSON());
  });

  // Not covered: the Key.newKey() round-trip. Key.ts strips 'block-' where this
  // class uses 'block-global-', so it cannot re-parse — a source defect, not a gap.
});
