/**
 * Generic in-memory cache with TTL (Time-To-Live) support.
 *
 * Entries expire after a configurable duration and are removed lazily
 * when accessed or explicitly through cleanup().
 *
 * When the cache reaches its maximum size, the oldest inserted entry
 * is removed before adding a new one.
 */

import type { CacheEntry, CacheOptions, CacheStats } from '../types'

const DEFAULT_TTL_MS = 5 * 60 * 1000
const DEFAULT_MAX_SIZE = 100

export class TTLCache<K extends string | number, V> {
  private readonly cache = new Map<K, CacheEntry<V>>()

  private readonly ttlMs: number
  private readonly maxSize: number

  constructor(options: CacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  }

  get(key: K): V | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: K, value: V, ttlMs = this.ttlMs): void {
    this.evictOldestEntryIfNeeded(key)

    this.cache.set(key, {
      data: value,
      createdAt: Date.now(),
      ttlMs,
    })
  }

  has(key: K): boolean {
    return this.get(key) !== null
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  cleanup(): void {
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): CacheStats {
    this.cleanup()

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
    }
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.createdAt > entry.ttlMs
  }

  private evictOldestEntryIfNeeded(key: K): void {
    const isNewKey = !this.cache.has(key)

    if (!isNewKey || this.cache.size < this.maxSize) {
      return
    }

    const oldestKey = this.cache.keys().next().value as K | undefined

    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey)
    }
  }
}

export function createTTLCache<K extends string | number, V>(
  options?: CacheOptions,
): TTLCache<K, V> {
  return new TTLCache<K, V>(options)
}
