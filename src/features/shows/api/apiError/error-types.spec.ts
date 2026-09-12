import { describe, expect, it } from 'vitest';

import {
  ApiError,
  BadRequestError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  categorizeError,
} from './error-types';

describe('Error Types', () => {
  describe('ApiError', () => {
    it('creates error with message and status', () => {
      const error = new ApiError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.name).toBe('ApiError');
    });
  });

  describe('NetworkError', () => {
    it('creates error with default message', () => {
      const error = new NetworkError();

      expect(error.message).toContain('Network error');
      expect(error.name).toBe('NetworkError');
    });

    it('creates error with custom message', () => {
      const error = new NetworkError('Custom network error');

      expect(error.message).toBe('Custom network error');
    });
  });

  describe('TimeoutError', () => {
    it('creates error with default message', () => {
      const error = new TimeoutError();

      expect(error.message).toContain('timeout');
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('NotFoundError', () => {
    it('creates error with 404 status', () => {
      const error = new NotFoundError();

      expect(error.status).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('BadRequestError', () => {
    it('creates error with 400 status', () => {
      const error = new BadRequestError();

      expect(error.status).toBe(400);
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('ServerError', () => {
    it('creates error with 500 status by default', () => {
      const error = new ServerError();

      expect(error.status).toBe(500);
    });

    it('creates error with custom status', () => {
      const error = new ServerError('Service unavailable', 503);

      expect(error.status).toBe(503);
    });
  });

  describe('RateLimitError', () => {
    it('creates error with 429 status', () => {
      const error = new RateLimitError();

      expect(error.status).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('categorizeError', () => {
    it('categorizes timeout error', () => {
      const error = categorizeError(new Error('Test'), true);

      expect(error).toBeInstanceOf(TimeoutError);
    });

    it('categorizes network error from TypeError', () => {
      const error = categorizeError(new TypeError('fetch failed'));

      expect(error).toBeInstanceOf(NetworkError);
    });

    it('preserves existing error types', () => {
      const apiError = new NotFoundError('Not found');
      const error = categorizeError(apiError);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('categorizes 404 status to NotFoundError', () => {
      const apiError = new ApiError('Not found', 404);
      const error = categorizeError(apiError);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('categorizes 429 status to RateLimitError', () => {
      const apiError = new ApiError('Rate limited', 429);
      const error = categorizeError(apiError);

      expect(error).toBeInstanceOf(RateLimitError);
    });

    it('categorizes 5xx status to ServerError', () => {
      const apiError = new ApiError('Server error', 500);
      const error = categorizeError(apiError);

      expect(error).toBeInstanceOf(ServerError);
    });

    it('defaults to NetworkError for unknown errors', () => {
      const error = categorizeError('unknown error');

      expect(error).toBeInstanceOf(NetworkError);
    });
  });
});
