/**
 * Cache utility with TTL (Time-To-Live) support
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttlMs: number
}

export interface CacheOptions {
  ttlMs?: number
  maxSize?: number
}

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes
const DEFAULT_MAX_SIZE = 100

/**
 * Generic cache with TTL support
 */
export class TTLCache<K extends string | number, V> {
  private cache: Map<K, CacheEntry<V>>
  private ttlMs: number
  private maxSize: number

  constructor(options: CacheOptions = {}) {
    this.cache = new Map()
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  }

  /**
   * Get value from cache if not expired
   */
  get(key: K): V | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set value in cache with TTL
   */
  set(key: K, value: V, ttlMs?: number): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as K | undefined
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.ttlMs,
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete entry from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: K[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttlMs) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Get cache statistics
   */
  getStats() {
    this.cleanup()
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
    }
  }
}

/**
 * Simple factory function to create TTL cache
 */
export function createTTLCache<K extends string | number, V>(
  options?: CacheOptions,
): TTLCache<K, V> {
  return new TTLCache<K, V>(options)
}
