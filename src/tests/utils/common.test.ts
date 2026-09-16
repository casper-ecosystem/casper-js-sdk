import { describe, it, expect, vi } from 'vitest';
import {
  arrayEquals,
  getEnumKeyByValue,
  isNull,
  sleep
} from '../../utils/common';

enum Sample {
  A = 'a',
  B = 'b'
}

describe('getEnumKeyByValue', () => {
  it('returns the key for a matching value', () => {
    expect(getEnumKeyByValue(Sample, Sample.B)).to.equal('B');
  });

  it('returns undefined for a value not in the enum', () => {
    expect(getEnumKeyByValue(Sample, 'not-a-member' as Sample)).to.be.undefined;
  });
});

describe('arrayEquals', () => {
  it('is true for equal arrays', () => {
    expect(arrayEquals(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 2, 3])))
      .to.be.true;
  });

  it('is false when lengths differ', () => {
    expect(arrayEquals(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 2]))).to
      .be.false;
  });

  it('is false when a byte differs', () => {
    expect(arrayEquals(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 9, 3])))
      .to.be.false;
  });

  it('is true for two empty arrays', () => {
    expect(arrayEquals(Uint8Array.from([]), Uint8Array.from([]))).to.be.true;
  });
});

describe('sleep', () => {
  it('resolves after the given duration', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();

    void sleep(1000).then(spy);
    await vi.advanceTimersByTimeAsync(999);
    expect(spy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });
});

describe('isNull', () => {
  it('is true only for null', () => {
    expect(isNull(null)).to.be.true;
    expect(isNull(undefined)).to.be.false;
    expect(isNull(0)).to.be.false;
    expect(isNull('')).to.be.false;
  });
});
