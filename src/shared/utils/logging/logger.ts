/**
 * Request logging and monitoring middleware
 */

import { LogLevel, type LoggerConfig, type RequestLog } from '../types'

const DEFAULT_CONFIG: Required<LoggerConfig> = {
  maxLogs: 1000,
  enableConsole: true,
  enableRemote: false,
  remoteUrl: '',
}

/**
 * Request logger singleton
 */
class RequestLogger {
  private logs: RequestLog[] = []
  private config: Required<LoggerConfig>

  constructor(config: LoggerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Log a request
   */
  log(log: RequestLog): void {
    this.logs.push(log)

    // Keep logs under max size
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs)
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(log)
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteUrl) {
      this.sendToRemote(log).catch((err) => {
        console.error('[Logger] Failed to send remote log:', err)
      })
    }
  }

  /**
   * Log HTTP request start
   */
  logRequestStart(endpoint: string, method: string): number {
    if (this.config.enableConsole) {
      console.log(`[${method}] ${endpoint}`)
    }
    return Date.now()
  }

  /**
   * Log HTTP request success
   */
  logRequestSuccess(endpoint: string, method: string, status: number, duration: number): void {
    const log: RequestLog = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      endpoint,
      method,
      status,
      duration,
      message: `${method} ${endpoint} completed with status ${status}`,
    }

    this.log(log)
  }

  /**
   * Log HTTP request error
   */
  logRequestError(endpoint: string, method: string, error: unknown, duration: number): void {
    const errorMessage = error instanceof Error ? error.message : String(error)

    const log: RequestLog = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      endpoint,
      method,
      duration,
      error: errorMessage,
      message: `${method} ${endpoint} failed: ${errorMessage}`,
    }

    this.log(log)
  }

  /**
   * Get all logs
   */
  getLogs(): RequestLog[] {
    return [...this.logs]
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): RequestLog[] {
    return this.logs.filter((log) => log.level === level)
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number): RequestLog[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get log statistics
   */
  getStats() {
    const total = this.logs.length
    const errors = this.logs.filter((log) => log.level === LogLevel.ERROR).length
    const avgDuration =
      total > 0 ? this.logs.reduce((sum, log) => sum + log.duration, 0) / total : 0

    return {
      total,
      errors,
      errorRate: total > 0 ? (errors / total) * 100 : 0,
      avgDurationMs: Math.round(avgDuration),
    }
  }

  /**
   * Export logs as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(log: RequestLog): void {
    const emoji = this.getEmoji(log.level)
    const statusColor = log.status ? this.getStatusColor(log.status) : ''

    console.log(`${emoji} [${log.level}] ${log.message} ${statusColor}(${log.duration}ms)`)

    if (log.error) {
      console.error(`  Error: ${log.error}`)
    }
  }

  /**
   * Send log to remote server
   */
  private async sendToRemote(log: RequestLog): Promise<void> {
    if (!this.config.remoteUrl) return

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      })
    } catch (error) {
      // Silently fail to avoid disrupting application
      console.warn('[Logger] Remote logging failed:', error)
    }
  }

  /**
   * Get emoji for log level
   */
  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍'
      case LogLevel.INFO:
        return 'ℹ️'
      case LogLevel.WARN:
        return '⚠️'
      case LogLevel.ERROR:
        return '❌'
      default:
        return '📝'
    }
  }

  /**
   * Get status color for console
   */
  private getStatusColor(status: number): string {
    if (status >= 200 && status < 300) {
      return '✅'
    }
    if (status >= 400 && status < 500) {
      return '⚠️'
    }
    if (status >= 500) {
      return '❌'
    }
    return ''
  }
}

// Singleton instance
let loggerInstance: RequestLogger | null = null

/**
 * Get or create logger instance
 */
export function getLogger(config?: LoggerConfig): RequestLogger {
  if (!loggerInstance) {
    loggerInstance = new RequestLogger(config)
  }
  return loggerInstance
}

/**
 * Reset logger (mainly for testing)
 */
export function resetLogger(): void {
  loggerInstance = null
}
