import type { ValidationResult } from '../types'

const MAX_SEARCH_LENGTH = 150

export function validateSearchInput(query: string): ValidationResult {
  const sanitized = query.trim()

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
    }
  }

  if (sanitized.length > MAX_SEARCH_LENGTH) {
    return {
      isValid: false,
      error: `Search must be ${MAX_SEARCH_LENGTH} characters or fewer`,
      sanitized: sanitized.slice(0, MAX_SEARCH_LENGTH),
    }
  }

  return {
    isValid: true,
    sanitized,
  }
}

export function sanitizeSearchInput(input: string): string {
  return input.trim().slice(0, MAX_SEARCH_LENGTH)
}
