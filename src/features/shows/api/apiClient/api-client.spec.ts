import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ApiError,
  NetworkError,
  NotFoundError,
  TimeoutError,
  categorizeError,
} from '../apiError/error-types'

import { apiGet, clearResponseCache } from './api-client'

describe('apiGet', () => {
  afterEach(() => {
    clearResponseCache()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns parsed JSON when the request succeeds', async () => {
    const mockData = {
      id: 1,
      name: 'Breaking Bad',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const result = await apiGet<typeof mockData>('/shows/1')

    expect(result).toEqual(mockData)
  })

  it('sends a GET request with an Accept application/json header', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
      }),
    )

    await apiGet('/shows/1')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/shows/1'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    )
  })

  it('preserves custom request headers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
      }),
    )

    await apiGet('/shows/1', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer test-token',
        }),
      }),
    )
  })

  it('throws an ApiError for an unsuccessful response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 400,
      }),
    )

    await expect(apiGet('/shows')).rejects.toBeInstanceOf(ApiError)
  })

  it('includes the HTTP status in the categorized error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 400,
      }),
    )

    await expect(apiGet('/shows')).rejects.toMatchObject({
      status: 400,
    })
  })

  it('includes the HTTP status in the error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 400,
      }),
    )

    await expect(apiGet('/shows')).rejects.toThrow('Request failed with status 400')
  })

  it('categorizes a 404 response as NotFoundError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 404,
      }),
    )

    await expect(apiGet('/shows/999999')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('categorizes a network failure as NetworkError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiGet('/shows')).rejects.toBeInstanceOf(NetworkError)
  })

  it('categorizes an aborted request as TimeoutError when the timeout occurred', () => {
    const abortError = Object.assign(new Error('The operation was aborted'), {
      name: 'AbortError',
    })

    const error = categorizeError(abortError, true)

    expect(error).toBeInstanceOf(TimeoutError)
  })

  it('uses the cached response for repeated requests', async () => {
    const mockData = {
      id: 1,
      name: 'Breaking Bad',
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const firstResult = await apiGet<typeof mockData>('/shows/1')

    const secondResult = await apiGet<typeof mockData>('/shows/1')

    expect(firstResult).toEqual(mockData)

    expect(secondResult).toEqual(mockData)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('performs another request after the response cache is cleared', async () => {
    const mockData = {
      id: 1,
      name: 'Breaking Bad',
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    await apiGet('/shows/1')

    clearResponseCache()

    await apiGet('/shows/1')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('does not reuse cached data for different endpoints', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
          }),
          {
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 2,
          }),
          {
            status: 200,
          },
        ),
      )

    const firstResult = await apiGet<{ id: number }>('/shows/1')

    const secondResult = await apiGet<{ id: number }>('/shows/2')

    expect(firstResult.id).toBe(1)
    expect(secondResult.id).toBe(2)

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
