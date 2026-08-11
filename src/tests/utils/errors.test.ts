import { describe, it, expect } from 'vitest';
import { toError } from '../../utils/errors';

describe('toError', () => {
  it('returns the same Error instance when given an Error', () => {
    const original = new Error('boom');
    expect(toError(original)).toBe(original);
  });

  it('wraps a thrown string without losing it', () => {
    expect(toError('boom').message).toBe('boom');
  });

  it('produces a non-empty message for undefined', () => {
    expect(toError(undefined).message).toBe('undefined');
  });

  it('produces a non-empty message for a plain object', () => {
    expect(toError({ a: 1 }).message.length).toBeGreaterThan(0);
  });
});
