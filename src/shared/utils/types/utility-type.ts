export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitized: string
}

export type DebouncedFunction<T extends (...args: never[]) => void> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void
}

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface RequestLog {
  timestamp: number
  level: LogLevel
  endpoint: string
  method: string
  status?: number
  duration: number
  error?: string
  message: string
}

export interface LoggerConfig {
  maxLogs?: number
  enableConsole?: boolean
  enableRemote?: boolean
  remoteUrl?: string
}

export interface EnvironmentConfig {
  apiUrl: string
  isDevelopment: boolean
  isProduction: boolean
  mode: string
  isTest: boolean
}

export interface CacheOptions {
  ttlMs?: number
  maxSize?: number
}

export interface CacheEntry<T> {
  data: T
  createdAt: number
  ttlMs: number
}

export interface CacheStats {
  size: number
  maxSize: number
  utilizationPercent: number
}
