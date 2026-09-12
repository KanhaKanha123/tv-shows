import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEnvironmentConfig } from './environment';

describe('getEnvironmentConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the configured API URL and exposes mode flags', () => {
    vi.stubEnv('VITE_TVMAZE_API_URL', 'https://api.example.com');

    const config = getEnvironmentConfig();

    expect(config).toMatchObject({
      apiUrl: 'https://api.example.com',
      mode: 'test',
      isDevelopment: false,
      isProduction: false,
      isTest: true,
    });
  });

  it('falls back to the default TVMaze URL when the env var is unset', () => {
    vi.stubEnv('VITE_TVMAZE_API_URL', '');

    expect(getEnvironmentConfig().apiUrl).toBe('https://api.tvmaze.com');
  });

  it('rejects invalid URLs that are not http or https', () => {
    vi.stubEnv('VITE_TVMAZE_API_URL', 'ftp://example.com');

    expect(() => getEnvironmentConfig()).toThrow('Invalid API URL: ftp://example.com');
  });
});
