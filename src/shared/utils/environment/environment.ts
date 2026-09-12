import type { EnvironmentConfig } from '../types';

const DEFAULT_API_URL = 'https://api.tvmaze.com';

function getEnvVar(key: string, defaultValue?: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];

  if (value) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

function validateApiUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);

    const isValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';

    if (!isValidProtocol) {
      throw new Error();
    }
  } catch {
    throw new Error(`Invalid API URL: ${url}. Must be a valid HTTP or HTTPS URL.`);
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const apiUrl = getEnvVar('VITE_TVMAZE_API_URL', DEFAULT_API_URL);

  validateApiUrl(apiUrl);

  const mode = import.meta.env.MODE;

  return {
    apiUrl,
    mode,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
    isTest: mode === 'test',
  };
}
