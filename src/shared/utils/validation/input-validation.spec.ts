import { describe, expect, it } from 'vitest'

import { sanitizeSearchInput, validateSearchInput } from './input-validation'

describe('validateSearchInput', () => {
  it('returns valid for a proper search query', () => {
    const result = validateSearchInput('Breaking Bad')

    expect(result).toEqual({
      isValid: true,
      sanitized: 'Breaking Bad',
    })
  })

  it('returns valid for a single character', () => {
    const result = validateSearchInput('A')

    expect(result).toEqual({
      isValid: true,
      sanitized: 'A',
    })
  })

  it('returns invalid for an empty string', () => {
    const result = validateSearchInput('')

    expect(result).toEqual({
      isValid: false,
      sanitized: '',
    })
  })

  it('returns invalid for whitespace only', () => {
    const result = validateSearchInput('   ')

    expect(result).toEqual({
      isValid: false,
      sanitized: '',
    })
  })

  it('returns invalid when query exceeds the maximum length', () => {
    const longQuery = 'a'.repeat(151)

    const result = validateSearchInput(longQuery)

    expect(result.isValid).toBe(false)

    expect(result.error).toBe('Search must be 150 characters or fewer')

    expect(result.sanitized).toHaveLength(150)
  })

  it('trims whitespace from the query', () => {
    const result = validateSearchInput('  Breaking Bad  ')

    expect(result).toEqual({
      isValid: true,
      sanitized: 'Breaking Bad',
    })
  })

  it('allows punctuation in search queries', () => {
    const result = validateSearchInput("O'Reilly & Sons: The Show!")

    expect(result.isValid).toBe(true)

    expect(result.sanitized).toBe("O'Reilly & Sons: The Show!")
  })

  it('allows unicode characters', () => {
    const result = validateSearchInput('Élite 東京')

    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Élite 東京')
  })

  it('does not remove special characters from the query', () => {
    const result = validateSearchInput('Breaking <Bad>')

    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Breaking <Bad>')
  })
})

describe('sanitizeSearchInput', () => {
  it('trims surrounding whitespace', () => {
    const result = sanitizeSearchInput('  Breaking Bad  ')

    expect(result).toBe('Breaking Bad')
  })

  it('limits the value to 150 characters', () => {
    const longString = 'a'.repeat(200)

    const result = sanitizeSearchInput(longString)

    expect(result).toHaveLength(150)
  })

  it('preserves punctuation and special characters', () => {
    const result = sanitizeSearchInput(`Breaking <Bad> "quoted" O'Reilly`)

    expect(result).toBe(`Breaking <Bad> "quoted" O'Reilly`)
  })

  it('returns an empty string for whitespace-only input', () => {
    const result = sanitizeSearchInput('   ')

    expect(result).toBe('')
  })
})
