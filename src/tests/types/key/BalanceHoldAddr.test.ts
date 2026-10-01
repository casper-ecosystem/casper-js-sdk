import { expect } from 'vitest';

import { BalanceHoldAddr, Hold, Key } from '../../../types';

const purseAddr = Uint8Array.from(Array(32).fill(0xab));
const blockTime = new Date(1700000000000);

describe('BalanceHoldAddr', () => {
  it('Gas: toBytes() / fromBytes() round-trips', () => {
    const addr = new BalanceHoldAddr(new Hold(purseAddr, blockTime), undefined);
    const { result } = BalanceHoldAddr.fromBytes(addr.toBytes());

    expect(result.gas).to.not.be.undefined;
    expect(result.processing).to.be.undefined;
    expect(result.gas?.purseAddr).to.deep.equal(purseAddr);
    expect(result.gas?.blockTime.getTime()).to.equal(blockTime.getTime());
  });

  it('Processing: toBytes() / fromBytes() round-trips', () => {
    const addr = new BalanceHoldAddr(undefined, new Hold(purseAddr, blockTime));
    const { result } = BalanceHoldAddr.fromBytes(addr.toBytes());

    expect(result.processing).to.not.be.undefined;
    expect(result.gas).to.be.undefined;
    expect(result.processing?.purseAddr).to.deep.equal(purseAddr);
  });

  it('rejects an unrecognized tag byte', () => {
    const bytes = new Uint8Array(32 + 8 + 1);
    bytes[0] = 9;

    expect(() => BalanceHoldAddr.fromBytes(bytes)).to.throw(
      'Invalid BalanceHoldAddrTag'
    );
  });

  it('rejects a byte array that is too short', () => {
    expect(() => BalanceHoldAddr.fromBytes(Uint8Array.from([0]))).to.throw(
      'Invalid BalanceHoldAddr format'
    );
  });

  it('round-trips through toJSON()/fromJSON()', () => {
    const addr = new BalanceHoldAddr(new Hold(purseAddr, blockTime), undefined);

    const parsed = BalanceHoldAddr.fromJSON(addr.toJSON());
    expect(parsed.toJSON()).to.equal(addr.toJSON());
  });

  // Reached through Key, `bytes` is a subarray with a non-zero byteOffset —
  // the case a DataView built on the raw `.buffer` decodes at the wrong place.
  it('survives Key.fromBytes(key.bytes()) with its blockTime intact', () => {
    const addr = new BalanceHoldAddr(new Hold(purseAddr, blockTime), undefined);
    const key = Key.newKey(addr.toPrefixedString());

    const { result: parsedKey } = Key.fromBytes(key.bytes());

    expect(parsedKey.balanceHold?.gas?.blockTime.getTime()).to.equal(
      blockTime.getTime()
    );
  });
});
