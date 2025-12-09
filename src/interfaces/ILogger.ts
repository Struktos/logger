/**
 * ILogger - Enterprise-grade logging interface
 * 
 * Provides a clean, simple interface for structured logging with
 * automatic context enrichment from @struktos/core.
 */

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log metadata that can be attached to any log entry
 */
export interface LogMetadata {
  [key: string]: any;
}

/**
 * Structured log entry format
 */
export interface LogEntry {
  /**
   * Log level
   */
  level: LogLevel;
  
  /**
   * Log message
   */
  message: string;
  
  /**
   * ISO 8601 timestamp
   */
  timestamp: string;
  
  /**
   * Additional metadata (includes context data)
   */
  metadata?: LogMetadata;
  
  /**
   * TraceID from context (if available)
   */
  traceId?: string;
  
  /**
   * Request ID from context (if available)
   */
  requestId?: string;
  
  /**
   * User ID from context (if available)
   */
  userId?: string;
  
  /**
   * Error object (for error logs)
   */
  error?: {
    message: string;
    stack?: string;
    name: string;
    [key: string]: any;
  };
}

/**
 * Logger interface
 */
export interface ILogger {
  /**
   * Log a debug message
   * 
   * @param message - Log message
   * @param metadata - Additional metadata
   */
  debug(message: string, metadata?: LogMetadata): void;
  
  /**
   * Log an info message
   * 
   * @param message - Log message
   * @param metadata - Additional metadata
   */
  info(message: string, metadata?: LogMetadata): void;
  
  /**
   * Log a warning message
   * 
   * @param message - Log message
   * @param metadata - Additional metadata
   */
  warn(message: string, metadata?: LogMetadata): void;
  
  /**
   * Log an error message
   * 
   * @param message - Log message
   * @param error - Error object (optional)
   * @param metadata - Additional metadata
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void;
  
  /**
   * Create a child logger with additional context
   * 
   * @param metadata - Metadata to add to all logs from this child logger
   */
  child(metadata: LogMetadata): ILogger;
}