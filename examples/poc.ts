/**
 * @struktos/logger POC - Context-Aware Structured Logging
 * 
 * This POC demonstrates:
 * 1. Automatic context enrichment (traceId, userId, requestId)
 * 2. Structured JSON logging
 * 3. Child loggers
 * 4. Error serialization
 * 5. Log levels
 */

import { RequestContext } from '@struktos/core';
import { createLogger, logger } from '../src/index';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                                                              ║');
console.log('║           @struktos/logger POC                               ║');
console.log('║           Context-Aware Structured Logging                   ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ============================================================
// Scenario 1: Basic Logging with Context
// ============================================================

async function scenario1_BasicLogging() {
  console.log('📋 Scenario 1: Basic Logging with Context\n');
  
  await RequestContext.run(
    {
      traceId: 'trace-001',
      requestId: 'req-001',
      userId: 'user-alice',
    },
    async () => {
      console.log('✓ Context created: { traceId: trace-001, userId: user-alice }\n');
      
      // Simple info log
      logger.info('User logged in successfully');
      console.log('');
      
      // Log with additional metadata
      logger.info('User profile accessed', {
        section: 'settings',
        action: 'view',
      });
      console.log('');
      
      // Warning log
      logger.warn('API rate limit approaching', {
        current: 95,
        limit: 100,
      });
      console.log('');
    }
  );
  
  console.log('✅ Scenario 1 Complete\n');
}

// ============================================================
// Scenario 2: Nested Context and Async Operations
// ============================================================

async function scenario2_NestedOperations() {
  console.log('📋 Scenario 2: Nested Context and Async Operations\n');
  
  await RequestContext.run(
    {
      traceId: 'trace-002',
      requestId: 'req-002',
      userId: 'user-bob',
    },
    async () => {
      logger.info('Starting order processing');
      console.log('');
      
      // Simulate nested async operations
      await validateOrder();
      await processPayment();
      await shipOrder();
      
      logger.info('Order processing completed');
      console.log('');
    }
  );
  
  console.log('✅ Scenario 2 Complete\n');
}

async function validateOrder() {
  // Context is automatically available!
  logger.debug('Validating order', { step: 'validation' });
  console.log('');
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function processPayment() {
  logger.info('Processing payment', { 
    step: 'payment',
    amount: 99.99,
    currency: 'USD',
  });
  console.log('');
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function shipOrder() {
  logger.info('Shipping order', { 
    step: 'shipping',
    carrier: 'UPS',
    trackingNumber: 'TRK123456',
  });
  console.log('');
  await new Promise(resolve => setTimeout(resolve, 100));
}

// ============================================================
// Scenario 3: Error Logging
// ============================================================

async function scenario3_ErrorLogging() {
  console.log('📋 Scenario 3: Error Logging with Stack Traces\n');
  
  await RequestContext.run(
    {
      traceId: 'trace-003',
      requestId: 'req-003',
      userId: 'user-charlie',
    },
    async () => {
      logger.info('Starting database operation');
      console.log('');
      
      try {
        throw new Error('Database connection timeout');
      } catch (error) {
        logger.error('Database operation failed', error, {
          operation: 'query',
          table: 'users',
          timeout: 5000,
        });
        console.log('');
      }
      
      // Custom error
      try {
        const customError = new Error('Invalid user input');
        (customError as any).code = 'VALIDATION_ERROR';
        (customError as any).field = 'email';
        throw customError;
      } catch (error) {
        logger.error('Validation failed', error);
        console.log('');
      }
    }
  );
  
  console.log('✅ Scenario 3 Complete\n');
}

// ============================================================
// Scenario 4: Child Loggers
// ============================================================

async function scenario4_ChildLoggers() {
  console.log('📋 Scenario 4: Child Loggers for Scoped Logging\n');
  
  await RequestContext.run(
    {
      traceId: 'trace-004',
      requestId: 'req-004',
      userId: 'user-diana',
    },
    async () => {
      // Create child logger for auth module
      const authLogger = logger.child({
        module: 'auth',
        version: '1.0.0',
      });
      
      authLogger.info('Authentication attempt');
      console.log('');
      
      authLogger.info('Checking credentials', {
        method: 'jwt',
      });
      console.log('');
      
      // Create another child logger for database module
      const dbLogger = logger.child({
        module: 'database',
        connection: 'postgres-primary',
      });
      
      dbLogger.debug('Executing query', {
        query: 'SELECT * FROM users WHERE id = ?',
      });
      console.log('');
      
      dbLogger.warn('Slow query detected', {
        duration: 2500,
        threshold: 1000,
      });
      console.log('');
    }
  );
  
  console.log('✅ Scenario 4 Complete\n');
}

// ============================================================
// Scenario 5: Without Context (Graceful Fallback)
// ============================================================

async function scenario5_WithoutContext() {
  console.log('📋 Scenario 5: Logging Without Context (Graceful Fallback)\n');
  
  // Logging outside of RequestContext.run()
  logger.info('Background job started', {
    job: 'cleanup',
    schedule: 'daily',
  });
  console.log('');
  
  logger.info('Processing batch', {
    batchSize: 1000,
    processed: 500,
  });
  console.log('');
  
  logger.info('Background job completed');
  console.log('');
  
  console.log('✅ Scenario 5 Complete\n');
}

// ============================================================
// Scenario 6: Custom Logger Configuration
// ============================================================

async function scenario6_CustomConfiguration() {
  console.log('📋 Scenario 6: Custom Logger Configuration\n');
  
  // Create logger with custom configuration
  const customLogger = createLogger({
    minLevel: 'debug', // Show all logs including debug
    prettyPrint: true, // Pretty print JSON (for development)
    defaultMetadata: {
      service: 'api-gateway',
      environment: 'production',
      version: '2.1.0',
    },
  });
  
  await RequestContext.run(
    {
      traceId: 'trace-005',
      requestId: 'req-005',
      userId: 'user-eve',
    },
    async () => {
      customLogger.debug('Debug information', {
        cacheHit: true,
        latency: 5,
      });
      console.log('');
      
      customLogger.info('Request processed successfully');
      console.log('');
    }
  );
  
  console.log('✅ Scenario 6 Complete\n');
}

// ============================================================
// Scenario 7: Multiple Concurrent Requests
// ============================================================

async function scenario7_ConcurrentRequests() {
  console.log('📋 Scenario 7: Multiple Concurrent Requests (Context Isolation)\n');
  
  // Simulate 3 concurrent requests
  const requests = [
    RequestContext.run(
      {
        traceId: 'trace-req1',
        requestId: 'req1',
        userId: 'user-1',
      },
      async () => {
        logger.info('Request 1 started');
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Request 1 completed');
        console.log('');
      }
    ),
    
    RequestContext.run(
      {
        traceId: 'trace-req2',
        requestId: 'req2',
        userId: 'user-2',
      },
      async () => {
        logger.info('Request 2 started');
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 150));
        logger.info('Request 2 completed');
        console.log('');
      }
    ),
    
    RequestContext.run(
      {
        traceId: 'trace-req3',
        requestId: 'req3',
        userId: 'user-3',
      },
      async () => {
        logger.info('Request 3 started');
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 50));
        logger.info('Request 3 completed');
        console.log('');
      }
    ),
  ];
  
  await Promise.all(requests);
  
  console.log('✅ Scenario 7 Complete - Each request has isolated context!\n');
}

// ============================================================
// Run All Scenarios
// ============================================================

async function runPOC() {
  await scenario1_BasicLogging();
  await scenario2_NestedOperations();
  await scenario3_ErrorLogging();
  await scenario4_ChildLoggers();
  await scenario5_WithoutContext();
  await scenario6_CustomConfiguration();
  await scenario7_ConcurrentRequests();
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║                     POC COMPLETE!                            ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('✅ Key Features Demonstrated:');
  console.log('   • Automatic context enrichment (traceId, userId, requestId)');
  console.log('   • Structured JSON logging');
  console.log('   • Child loggers for scoped logging');
  console.log('   • Error serialization with stack traces');
  console.log('   • Graceful fallback without context');
  console.log('   • Custom logger configuration');
  console.log('   • Context isolation in concurrent requests\n');
}

// Execute POC
runPOC().catch(console.error);