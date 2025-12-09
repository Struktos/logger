/**
 * @struktos/logger - Context-aware structured logging for Struktos.js
 * 
 * Enterprise-grade observability with automatic context enrichment from @struktos/core.
 * 
 * Features:
 * - Automatic context enrichment (traceId, userId, requestId)
 * - Structured JSON logging
 * - Child loggers for scoped logging
 * - Configurable log levels
 * - Error serialization
 * - TypeScript type safety
 */

// Core Logger
export {
  StruktosLogger,
  StruktosLoggerOptions,
  createLogger,
  logger,
} from './core/StruktosLogger';

// Interfaces
export type {
  ILogger,
  LogLevel,
  LogMetadata,
  LogEntry,
} from './interfaces/ILogger';

// Version
export const VERSION = '0.1.0';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { logger } from '@struktos/logger';
 * import { RequestContext } from '@struktos/core';
 * 
 * // Setup context (typically in middleware)
 * RequestContext.run({ traceId: 'trace-123', userId: 'user-456' }, async () => {
 *   // Logger automatically includes context
 *   logger.info('User logged in', { username: 'john' });
 *   // Output: { level: 'info', message: 'User logged in', traceId: 'trace-123', userId: 'user-456', ... }
 *   
 *   // Error logging
 *   try {
 *     throw new Error('Something went wrong');
 *   } catch (error) {
 *     logger.error('Operation failed', error);
 *   }
 * });
 * ```
 */