import { expect } from 'vitest';

import { Duration } from '../../types';

describe('Duration.parseDurationString', () => {
  it('sums every unit-suffixed component', () => {
    expect(Duration.parseDurationString('1d 2h 3m 4s')).toBe(
      86400000 + 2 * 3600000 + 3 * 60000 + 4 * 1000
    );
    expect(Duration.parseDurationString('30m')).toBe(30 * 60000);
  });

  it('skips digit runs without a unit', () => {
    expect(Duration.parseDurationString('123x 5m')).toBe(5 * 60000);
  });

  it('throws when no component has a unit', () => {
    expect(() => Duration.parseDurationString('12345')).toThrow(
      'Invalid duration format'
    );
  });

  it('rejects a long unit-less digit run in linear time', () => {
    const start = Date.now();
    expect(() => Duration.parseDurationString('9'.repeat(50_000))).toThrow(
      'Invalid duration format'
    );
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
