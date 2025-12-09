import { RequestContext } from '@struktos/core';
import type { ILogger, LogLevel, LogMetadata, LogEntry } from '../interfaces/ILogger';

/**
 * Configuration options for StruktosLogger
 */
export interface StruktosLoggerOptions {
  /**
   * Minimum log level to output (default: 'info')
   */
  minLevel?: LogLevel;
  
  /**
   * Pretty print JSON logs (default: false)
   */
  prettyPrint?: boolean;
  
  /**
   * Include stack traces in error logs (default: true)
   */
  includeStackTrace?: boolean;
  
  /**
   * Additional metadata to include in all logs
   */
  defaultMetadata?: LogMetadata;
  
  /**
   * Custom output function (default: console.log)
   */
  output?: (entry: LogEntry) => void;
  
  /**
   * Enable/disable context auto-enrichment (default: true)
   */
  enrichWithContext?: boolean;
}

/**
 * Log level priorities for filtering
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * StruktosLogger - Context-aware structured logger
 * 
 * Automatically enriches log entries with context data from @struktos/core,
 * providing enterprise-grade observability with zero configuration.
 * 
 * Features:
 * - Automatic context enrichment (traceId, userId, requestId)
 * - Structured JSON logging
 * - Child loggers for scoped logging
 * - Configurable log levels
 * - Error serialization
 * - TypeScript type safety
 * 
 * @example
 * ```typescript
 * const logger = new StruktosLogger();
 * 
 * // Context is automatically enriched
 * logger.info('User logged in', { username: 'john' });
 * // Output: { level: 'info', message: 'User logged in', traceId: '...', ... }
 * 
 * // Error logging
 * logger.error('Database connection failed', error);
 * ```
 */
export class StruktosLogger implements ILogger {
  private options: Required<StruktosLoggerOptions>;
  private childMetadata: LogMetadata;
  
  constructor(options: StruktosLoggerOptions = {}, childMetadata: LogMetadata = {}) {
    this.options = {
      minLevel: options.minLevel || 'info',
      prettyPrint: options.prettyPrint ?? false,
      includeStackTrace: options.includeStackTrace ?? true,
      defaultMetadata: options.defaultMetadata || {},
      output: options.output || this.defaultOutput,
      enrichWithContext: options.enrichWithContext ?? true,
    };
    
    this.childMetadata = childMetadata;
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }
  
  /**
   * Log an info message
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    const errorData = this.serializeError(error);
    const mergedMetadata = {
      ...metadata,
      ...(errorData && { error: errorData }),
    };
    
    this.log('error', message, mergedMetadata);
  }
  
  /**
   * Create a child logger with additional context
   */
  child(metadata: LogMetadata): ILogger {
    const mergedMetadata = {
      ...this.childMetadata,
      ...metadata,
    };
    
    return new StruktosLogger(this.options, mergedMetadata);
  }
  
  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // Check if this log level should be output
    if (!this.shouldLog(level)) {
      return;
    }
    
    // Build log entry
    const entry = this.buildLogEntry(level, message, metadata);
    
    // Output log
    this.options.output(entry);
  }
  
  /**
   * Check if log level should be output based on minLevel
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.minLevel];
  }
  
  /**
   * Build a complete log entry with context enrichment
   */
  private buildLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): LogEntry {
    // Start with base entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    
    // Enrich with context if enabled
    if (this.options.enrichWithContext) {
      const contextData = this.extractContextData();
      Object.assign(entry, contextData);
    }
    
    // Merge all metadata
    const allMetadata = {
      ...this.options.defaultMetadata,
      ...this.childMetadata,
      ...metadata,
    };
    
    // Add metadata if any
    if (Object.keys(allMetadata).length > 0) {
      // Separate error from other metadata
      const { error, ...restMetadata } = allMetadata;
      
      if (Object.keys(restMetadata).length > 0) {
        entry.metadata = restMetadata;
      }
      
      if (error) {
        entry.error = error;
      }
    }
    
    return entry;
  }
  
  /**
   * Extract context data from @struktos/core
   */
  private extractContextData(): Partial<LogEntry> {
    try {
      const context = RequestContext.current();
      
      if (!context) {
        return {};
      }
      
      // Extract standard context fields
      const contextData: Partial<LogEntry> = {};
      
      const traceId = context.get('traceId');
      if (traceId) {
        contextData.traceId = traceId;
      }
      
      const requestId = context.get('requestId');
      if (requestId) {
        contextData.requestId = requestId;
      }
      
      const userId = context.get('userId');
      if (userId) {
        contextData.userId = userId;
      }
      
      return contextData;
    } catch (error) {
      // If context access fails, return empty object
      // This can happen if logger is used outside of RequestContext scope
      return {};
    }
  }
  
  /**
   * Serialize error objects for logging
   */
  private serializeError(error: Error | unknown): any {
    if (!error) {
      return undefined;
    }
    
    if (error instanceof Error) {
      const serialized: any = {
        name: error.name,
        message: error.message,
      };
      
      if (this.options.includeStackTrace && error.stack) {
        serialized.stack = error.stack;
      }
      
      // Include additional error properties
      Object.keys(error).forEach((key) => {
        if (key !== 'name' && key !== 'message' && key !== 'stack') {
          serialized[key] = (error as any)[key];
        }
      });
      
      return serialized;
    }
    
    // For non-Error objects, convert to string
    return {
      message: String(error),
    };
  }
  
  /**
   * Default output function - logs to console
   */
  private defaultOutput = (entry: LogEntry): void => {
    const prettyPrint = this.options.prettyPrint;
    const json = JSON.stringify(entry, null, prettyPrint ? 2 : 0);
    
    // Use appropriate console method based on level
    switch (entry.level) {
      case 'debug':
        console.debug(json);
        break;
      case 'info':
        console.info(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'error':
        console.error(json);
        break;
      default:
        console.log(json);
    }
  };
}

/**
 * Create a default logger instance
 */
export function createLogger(options?: StruktosLoggerOptions): ILogger {
  return new StruktosLogger(options);
}

/**
 * Default logger instance for convenience
 */
export const logger = createLogger();