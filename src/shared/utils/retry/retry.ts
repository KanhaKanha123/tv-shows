import { ApiError } from '../../../features/shows/api'
import type { RetryOptions } from '../types'

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 3000,
  backoffMultiplier: 2,
  shouldRetry: isRetryableError,
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt)

  return Math.min(delay, options.maxDelayMs)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 429 || error.status >= 500
  }

  // fetch() usually throws TypeError for network failures
  if (error instanceof TypeError) {
    return true
  }

  return false
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const mergedOptions: Required<RetryOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= mergedOptions.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      const isLastAttempt = attempt === mergedOptions.maxRetries

      if (isLastAttempt) {
        break
      }

      if (!mergedOptions.shouldRetry(error, attempt)) {
        throw error
      }

      const delay = calculateDelay(attempt, mergedOptions)

      await sleep(delay)
    }
  }

  throw lastError
}
