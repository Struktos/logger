# @struktos/logger

> Context-aware structured logging for Struktos.js - Enterprise-grade observability with automatic context enrichment

[![npm version](https://img.shields.io/npm/v/@struktos/logger.svg)](https://www.npmjs.com/package/@struktos/logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is this?

`@struktos/logger` provides enterprise-grade structured logging with automatic context enrichment from [@struktos/core](https://www.npmjs.com/package/@struktos/core). Every log entry automatically includes `traceId`, `userId`, `requestId` and other context data without manual propagation.

**Key Features:**

- ✅ **Automatic Context Enrichment** - TraceID, UserID, RequestID automatically included
- ✅ **Structured JSON Logging** - Machine-readable logs for modern observability tools
- ✅ **Child Loggers** - Scoped logging with additional metadata
- ✅ **Error Serialization** - Automatic error object serialization with stack traces
- ✅ **Zero Configuration** - Works out of the box with sensible defaults
- ✅ **TypeScript First** - Complete type safety and IDE support
- ✅ **Framework Agnostic** - Works with Express, Fastify, or standalone

## 📦 Installation

```bash
npm install @struktos/logger @struktos/core
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { logger } from '@struktos/logger';
import { RequestContext } from '@struktos/core';

// In your middleware or request handler
app.use((req, res, next) => {
  RequestContext.run(
    {
      traceId: generateTraceId(),
      requestId: req.id,
      userId: req.user?.id,
    },
    () => next()
  );
});

// Anywhere in your application
logger.info('User logged in successfully', {
  username: 'john',
  method: 'oauth',
});

// Output (automatic context enrichment):
// {
//   "level": "info",
//   "message": "User logged in successfully",
//   "timestamp": "2024-12-08T10:30:45.123Z",
//   "traceId": "trace-abc123",
//   "requestId": "req-xyz789",
//   "userId": "user-456",
//   "metadata": {
//     "username": "john",
//     "method": "oauth"
//   }
// }
```

### With Express

```typescript
import express from 'express';
import { createStruktosMiddleware } from '@struktos/adapter-express';
import { logger } from '@struktos/logger';

const app = express();

// Setup context middleware
app.use(createStruktosMiddleware());

app.get('/api/users/:id', async (req, res) => {
  // Logger automatically includes context!
  logger.info('Fetching user', { userId: req.params.id });
  
  const user = await getUser(req.params.id);
  
  logger.info('User fetched successfully');
  
  res.json(user);
});
```

## ✨ Features

### Automatic Context Enrichment

Stop manually passing `traceId` and other context data:

```typescript
// ❌ Before: Manual context passing
logger.info('Operation started', { 
  traceId: req.traceId,
  userId: req.user.id,
  requestId: req.id 
});

// ✅ After: Automatic enrichment
logger.info('Operation started');
// Context is automatically included!
```

### Structured JSON Logging

All logs are output as structured JSON for easy parsing by observability tools:

```json
{
  "level": "info",
  "message": "Payment processed",
  "timestamp": "2024-12-08T10:30:45.123Z",
  "traceId": "trace-abc123",
  "userId": "user-456",
  "metadata": {
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": "credit_card"
  }
}
```

### Child Loggers

Create scoped loggers with additional metadata:

```typescript
// Create child logger for specific module
const authLogger = logger.child({
  module: 'auth',
  version: '2.0.0',
});

authLogger.info('Authentication attempt');
// All logs from authLogger include module and version

const dbLogger = logger.child({
  module: 'database',
  connection: 'postgres-primary',
});

dbLogger.warn('Slow query detected', { duration: 2500 });
```

### Error Logging

Automatic error serialization with stack traces:

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'user-registration',
    userId: user.id,
  });
}

// Output:
// {
//   "level": "error",
//   "message": "Operation failed",
//   "traceId": "trace-abc123",
//   "error": {
//     "name": "ValidationError",
//     "message": "Email already exists",
//     "stack": "ValidationError: Email already exists\n    at ..."
//   },
//   "metadata": {
//     "operation": "user-registration",
//     "userId": "user-456"
//   }
// }
```

### Log Levels

Four log levels with filtering support:

```typescript
logger.debug('Detailed debugging info');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

## 📖 API Reference

### Logger Methods

```typescript
interface ILogger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, error?: Error, metadata?: LogMetadata): void;
  child(metadata: LogMetadata): ILogger;
}
```

### Creating Custom Loggers

```typescript
import { createLogger } from '@struktos/logger';

const customLogger = createLogger({
  // Minimum log level (default: 'info')
  minLevel: 'debug',
  
  // Pretty print for development (default: false)
  prettyPrint: true,
  
  // Include stack traces in errors (default: true)
  includeStackTrace: true,
  
  // Default metadata for all logs
  defaultMetadata: {
    service: 'api-gateway',
    environment: 'production',
  },
  
  // Custom output function
  output: (entry) => {
    // Send to external logging service
    sendToDatadog(entry);
  },
  
  // Enable/disable context enrichment (default: true)
  enrichWithContext: true,
});
```

### Log Entry Structure

```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string; // ISO 8601
  traceId?: string;  // From context
  requestId?: string; // From context
  userId?: string;    // From context
  metadata?: {
    [key: string]: any;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

## 🏗️ Architecture

```
HTTP Request
    ↓
[Context Middleware] - Creates RequestContext with traceId, userId
    ↓
[Application Code]
    ↓
logger.info('message') ← Automatically reads RequestContext
    ↓
[Log Entry with Context] - { level, message, traceId, userId, ... }
    ↓
[JSON Output] - Structured log ready for analysis
```

## 🔄 Integration Examples

### With Express

```typescript
import express from 'express';
import { createStruktosMiddleware } from '@struktos/adapter-express';
import { logger } from '@struktos/logger';

const app = express();

app.use(createStruktosMiddleware());

app.get('/api/data', async (req, res) => {
  logger.info('Request received');
  const data = await fetchData();
  logger.info('Data fetched', { count: data.length });
  res.json(data);
});
```

### With Fastify

```typescript
import Fastify from 'fastify';
import { createStruktosPlugin } from '@struktos/adapter-fastify';
import { logger } from '@struktos/logger';

const fastify = Fastify();

await fastify.register(createStruktosPlugin());

fastify.get('/api/data', async (request, reply) => {
  logger.info('Request received');
  const data = await fetchData();
  logger.info('Data fetched', { count: data.length });
  return data;
});
```

### Standalone Usage

```typescript
import { RequestContext } from '@struktos/core';
import { logger } from '@struktos/logger';

// Manually create context
await RequestContext.run(
  {
    traceId: 'manual-trace-123',
    userId: 'user-456',
  },
  async () => {
    logger.info('Background job started');
    await processBackgroundJob();
    logger.info('Background job completed');
  }
);
```

## 📊 Observability Integration

### Datadog

```typescript
const logger = createLogger({
  output: (entry) => {
    // Send to Datadog
    datadogLogger.log(entry.level, entry.message, {
      ...entry.metadata,
      'dd.trace_id': entry.traceId,
      'usr.id': entry.userId,
    });
  },
});
```

### ELK Stack

```typescript
const logger = createLogger({
  output: (entry) => {
    // Send to Elasticsearch
    elasticsearchClient.index({
      index: 'application-logs',
      body: entry,
    });
  },
});
```

### Winston/Pino Wrapper

```typescript
import winston from 'winston';

const winstonLogger = winston.createLogger({ /* config */ });

const logger = createLogger({
  output: (entry) => {
    winstonLogger.log(entry.level, entry.message, entry);
  },
});
```

## 🤝 Related Packages

- **[@struktos/core](https://www.npmjs.com/package/@struktos/core)** - Core context propagation
- **[@struktos/adapter-express](https://www.npmjs.com/package/@struktos/adapter-express)** - Express adapter
- **[@struktos/adapter-fastify](https://www.npmjs.com/package/@struktos/adapter-fastify)** - Fastify adapter
- **@struktos/auth** (coming soon) - Authentication system

## 📄 License

MIT © Struktos.js Team

## 🔗 Links

- [GitHub Repository](https://github.com/struktosjs/logger)
- [Issue Tracker](https://github.com/struktosjs/logger/issues)
- [NPM Package](https://www.npmjs.com/package/@struktos/logger)

---

**Built with ❤️ for enterprise Node.js observability**