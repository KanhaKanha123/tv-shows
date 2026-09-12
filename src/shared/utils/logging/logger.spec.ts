import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LogLevel } from '../types';
import { getLogger, resetLogger } from './logger';

describe('RequestLogger', () => {
  beforeEach(() => {
    resetLogger();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetLogger();
  });

  it('stores request logs and exposes filtered views', () => {
    const logger = getLogger({ enableConsole: false, maxLogs: 10 });

    logger.logRequestSuccess('/shows', 'GET', 200, 250);
    logger.logRequestError('/shows', 'GET', new Error('Boom'), 100);

    expect(logger.getLogs()).toHaveLength(2);
    expect(logger.getLogsByLevel(LogLevel.ERROR)).toHaveLength(1);
    expect(logger.getRecentLogs(1)[0]?.message).toContain('failed');
    expect(logger.getStats()).toMatchObject({
      total: 2,
      errors: 1,
      errorRate: 50,
      avgDurationMs: 175,
    });
    expect(JSON.parse(logger.exportJSON())).toHaveLength(2);
  });

  it('tracks request start and uses the singleton logger reset flow', () => {
    const firstLogger = getLogger({ enableConsole: false });
    const startTime = firstLogger.logRequestStart('/search', 'POST');

    expect(startTime).toBeTypeOf('number');

    resetLogger();
    const secondLogger = getLogger({ enableConsole: false });

    expect(secondLogger).not.toBe(firstLogger);
    expect(secondLogger.getLogs()).toEqual([]);
  });

  it('sends remote logs and falls back gracefully when the remote call fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('remote down'));

    const logger = getLogger({
      enableConsole: false,
      enableRemote: true,
      remoteUrl: 'https://example.com/logs',
    });

    logger.log({
      timestamp: Date.now(),
      level: LogLevel.INFO,
      endpoint: '/health',
      method: 'GET',
      duration: 25,
      message: 'ok',
    });

    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/logs',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('covers console formatting, log trimming, stats, and clear behavior', () => {
    const logger = getLogger({
      enableConsole: true,
      enableRemote: false,
      maxLogs: 2,
    });

    logger.log({
      timestamp: Date.now(),
      level: LogLevel.DEBUG,
      endpoint: '/debug',
      method: 'GET',
      duration: 10,
      message: 'debug log',
    });
    logger.logRequestStart('/health', 'POST');
    logger.logRequestSuccess('/ok', 'GET', 200, 150);
    logger.logRequestError('/fail', 'POST', new Error('bad request'), 200);

    expect(logger.getLogs()).toHaveLength(2);
    expect(logger.getRecentLogs(2)).toHaveLength(2);
    expect(logger.getLogsByLevel(LogLevel.ERROR)).toHaveLength(1);
    expect(logger.getStats()).toMatchObject({ total: 2, errors: 1, avgDurationMs: 175 });
    expect(logger.exportJSON()).toContain('bad request');

    logger.clear();
    expect(logger.getLogs()).toEqual([]);
    expect(logger.getStats()).toMatchObject({
      total: 0,
      errors: 0,
      errorRate: 0,
      avgDurationMs: 0,
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('🔍'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ℹ️'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('❌'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error: bad request'));
  });

  it('handles remote success path and status formatting', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);

    const logger = getLogger({
      enableConsole: true,
      enableRemote: true,
      remoteUrl: 'https://example.com/logs',
    });

    logger.log({
      timestamp: Date.now(),
      level: LogLevel.WARN,
      endpoint: '/warn',
      method: 'GET',
      status: 400,
      duration: 40,
      message: 'warn message',
      error: 'warn detail',
    });

    logger.log({
      timestamp: Date.now(),
      level: LogLevel.INFO,
      endpoint: '/ok',
      method: 'GET',
      status: 204,
      duration: 5,
      message: 'final status',
    });

    logger.log({
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      endpoint: '/server',
      method: 'POST',
      status: 500,
      duration: 80,
      message: 'server error',
      error: 'server issue',
    });

    logger.log({
      timestamp: Date.now(),
      level: 'CUSTOM' as LogLevel,
      endpoint: '/default',
      method: 'PATCH',
      status: 302,
      duration: 12,
      message: 'default status',
    });

    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(logger.getLogsByLevel(LogLevel.WARN)).toHaveLength(1);
    expect(logger.getLogsByLevel(LogLevel.ERROR)).toHaveLength(1);
    expect(logger.getLogsByLevel(LogLevel.INFO)).toHaveLength(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('⚠️'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📝'));
  });
});
