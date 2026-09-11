import { ApiError, categorizeError } from '../apiError/error-types'

import { createTTLCache } from '@/shared/utils/cache/cache'
import { getEnvironmentConfig } from '@/shared/utils/environment/environment'
import { getLogger } from '@/shared/utils/logging/logger'
import { isRetryableError, retryWithBackoff } from '@/shared/utils/retry/retry'

const { apiUrl, isDevelopment } = getEnvironmentConfig()

const REQUEST_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 5 * 60 * 1000

type GetRequestOptions = Omit<RequestInit, 'method' | 'body'>

const responseCache = createTTLCache<string, unknown>({
  ttlMs: CACHE_TTL_MS,
})

const logger = getLogger({
  enableConsole: isDevelopment,
})

function getCacheKey(endpoint: string, options?: GetRequestOptions): string {
  const headers = new Headers(options?.headers)

  const normalizedHeaders = Array.from(headers.entries()).sort(([a], [b]) => a.localeCompare(b))

  return JSON.stringify({
    endpoint,
    headers: normalizedHeaders,
  })
}

async function performFetch<T>(endpoint: string, options?: GetRequestOptions): Promise<T> {
  const controller = new AbortController()

  let timeoutOccurred = false

  const timeoutId = setTimeout(() => {
    timeoutOccurred = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, response.status)
    }

    return (await response.json()) as T
  } catch (error) {
    throw categorizeError(error, timeoutOccurred)
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function apiGet<T>(endpoint: string, options?: GetRequestOptions): Promise<T> {
  const cacheKey = getCacheKey(endpoint, options)

  const startTime = logger.logRequestStart('GET', endpoint)

  const cachedData = responseCache.get(cacheKey)

  if (cachedData !== null && cachedData !== undefined) {
    logger.logRequestSuccess(endpoint, 'GET', 200, Date.now() - startTime)

    return cachedData as T
  }

  try {
    const data = await retryWithBackoff(() => performFetch<T>(endpoint, options), {
      maxRetries: 2,
      initialDelayMs: 500,
      maxDelayMs: 3000,
      shouldRetry: isRetryableError,
    })

    responseCache.set(cacheKey, data, CACHE_TTL_MS)

    logger.logRequestSuccess(endpoint, 'GET', 200, Date.now() - startTime)

    return data
  } catch (error) {
    logger.logRequestError(endpoint, 'GET', error, Date.now() - startTime)

    throw error
  }
}

export function clearResponseCache(): void {
  responseCache.clear()
}
