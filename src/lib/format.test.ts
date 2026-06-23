import { describe, expect, it } from 'vitest';
import { formatRelative, initials, isOverdue } from './format';

describe('format helpers', () => {
  it('derives up to two uppercase initials', () => {
    expect(initials('Avery Quinn')).toBe('AQ');
    expect(initials('madonna')).toBe('M');
    expect(initials('Jean Luc Picard')).toBe('JL');
  });

  it('detects overdue dates relative to a reference time', () => {
    const now = new Date('2026-06-22T12:00:00Z').getTime();
    expect(isOverdue('2026-06-21T12:00:00Z', now)).toBe(true);
    expect(isOverdue('2026-06-23T12:00:00Z', now)).toBe(false);
    expect(isOverdue(null, now)).toBe(false);
  });

  it('formats relative time around a reference point', () => {
    const now = new Date('2026-06-22T12:00:00Z').getTime();
    expect(formatRelative('2026-06-19T12:00:00Z', now)).toBe('3 days ago');
    expect(formatRelative('2026-06-24T12:00:00Z', now)).toBe('in 2 days');
  });
});
