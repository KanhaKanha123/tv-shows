import { afterEach, describe, expect, it, vi } from 'vitest';

import { TTLCache, createTTLCache } from './cache';

describe('TTLCache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves values, and tracks size/has status', () => {
    const cache = new TTLCache<string, string>({ maxSize: 3, ttlMs: 1000 });

    expect(cache.get('missing')).toBeNull();
    expect(cache.has('missing')).toBe(false);

    cache.set('alpha', 'one');
    cache.set('beta', 'two');

    expect(cache.get('alpha')).toBe('one');
    expect(cache.has('alpha')).toBe(true);
    expect(cache.size()).toBe(2);

    expect(cache.delete('beta')).toBe(true);
    expect(cache.delete('ghost')).toBe(false);
    expect(cache.size()).toBe(1);
  });

  it('expires entries lazily and clears them when accessed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    const cache = new TTLCache<string, string>({ ttlMs: 50 });
    cache.set('alpha', 'value');

    vi.advanceTimersByTime(51);

    expect(cache.get('alpha')).toBeNull();
    expect(cache.has('alpha')).toBe(false);
  });

  it('evicts the oldest entry when the cache reaches max size', () => {
    const cache = new TTLCache<string, string>({ maxSize: 2 });

    cache.set('first', 'one');
    cache.set('second', 'two');
    cache.set('third', 'three');

    expect(cache.get('first')).toBeNull();
    expect(cache.get('second')).toBe('two');
    expect(cache.get('third')).toBe('three');
  });

  it('cleans expired entries and reports cache stats', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    const cache = new TTLCache<string, string>({ ttlMs: 20, maxSize: 2 });
    cache.set('a', 'one');
    cache.set('b', 'two');

    vi.advanceTimersByTime(21);
    cache.cleanup();

    expect(cache.size()).toBe(0);
    expect(cache.getStats()).toEqual({
      size: 0,
      maxSize: 2,
      utilizationPercent: 0,
    });
  });

  it('can clear everything and supports the factory helper', () => {
    const cache = createTTLCache<string, number>({ maxSize: 5, ttlMs: 2000 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();

    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeNull();
  });
});
