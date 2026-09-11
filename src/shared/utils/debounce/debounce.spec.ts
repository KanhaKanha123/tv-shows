import { afterEach, describe, expect, it, vi } from 'vitest'

import { debounce } from './debounce'

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the callback after the delay', () => {
    vi.useFakeTimers()

    const callback = vi.fn()
    const debounced = debounce(callback, 300)

    debounced('test')

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledWith('test')
  })

  it('only calls the callback once for multiple calls within the delay', () => {
    vi.useFakeTimers()

    const callback = vi.fn()
    const debounced = debounce(callback, 300)

    debounced('a')
    debounced('ab')
    debounced('abc')

    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith('abc')
  })

  it('does not call the callback after cancel', () => {
    vi.useFakeTimers()

    const callback = vi.fn()
    const debounced = debounce(callback, 300)

    debounced('test')
    debounced.cancel()

    vi.advanceTimersByTime(300)

    expect(callback).not.toHaveBeenCalled()
  })
})
