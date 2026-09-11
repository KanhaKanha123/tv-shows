/**
 * Categorized API error types for better error handling and user messaging
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout. The server took too long to respond.') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Invalid request parameters.') {
    super(message, 400)
    this.name = 'BadRequestError'
  }
}

export class ServerError extends ApiError {
  constructor(
    message: string = 'Server error. Please try again later.',
    status: number = 500,
  ) {
    super(message, status)
    this.name = 'ServerError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests. Please wait before trying again.') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

export type ApiErrorType = ApiError | NetworkError | TimeoutError | ServerError | NotFoundError | BadRequestError | RateLimitError

/**
 * Categorize an error for better error handling
 */
export function categorizeError(error: unknown, timeoutOccurred: boolean = false): ApiErrorType {
  if (error instanceof RateLimitError) return error
  if (error instanceof NotFoundError) return error
  if (error instanceof BadRequestError) return error
  if (error instanceof ServerError) return error
  if (error instanceof TimeoutError) return error
  if (error instanceof NetworkError) return error
  if (error instanceof ApiError) {
    if (error.status === 404) return new NotFoundError(`Resource not found: ${error.message}`)
    if (error.status === 400) return new BadRequestError(`Invalid request: ${error.message}`)
    if (error.status === 429) return new RateLimitError(`Rate limit exceeded: ${error.message}`)
    if (error.status >= 500) return new ServerError(error.message, error.status)
  }
  if (timeoutOccurred) return new TimeoutError()
  if (error instanceof TypeError) return new NetworkError(`Network error: ${(error as Error).message}`)
  if (error instanceof Error) return new NetworkError(error.message)
  return new NetworkError('An unexpected error occurred')
}
