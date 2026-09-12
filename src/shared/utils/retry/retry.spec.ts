import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../features/shows/api/apiError/error-types';
import { isRetryableError, retryWithBackoff } from './retry';

describe('retry utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects retryable ApiError and TypeError cases', () => {
    expect(isRetryableError(new ApiError('rate limited', 429))).toBe(true);
    expect(isRetryableError(new ApiError('server failure', 503))).toBe(true);
    expect(isRetryableError(new TypeError('network'))).toBe(true);
    expect(isRetryableError(new Error('bad request'))).toBe(false);
    expect(isRetryableError({})).toBe(false);
  });

  it('returns immediately when the function succeeds on the first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    await expect(retryWithBackoff(fn, { maxRetries: 3 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries and succeeds after an initial failure', async () => {
    vi.useFakeTimers();

    const fn = vi.fn().mockRejectedValueOnce(new TypeError('temporary')).mockResolvedValue('done');

    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelayMs: 100,
      maxDelayMs: 300,
      backoffMultiplier: 2,
    });

    await vi.advanceTimersByTimeAsync(100);

    await expect(promise).resolves.toBe('done');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stops retrying when the retry policy rejects the error', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError('bad request', 400));

    await expect(
      retryWithBackoff(fn, {
        maxRetries: 5,
        shouldRetry: () => false,
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
