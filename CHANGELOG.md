# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-09

### Added

- Initial release of @struktos/logger
- `ILogger` interface with `debug`, `info`, `warn`, `error` methods
- `StruktosLogger` class with automatic context enrichment
- Automatic context integration from @struktos/core
  - Auto-includes `traceId`, `userId`, `requestId` from RequestContext
- Structured JSON logging format
- Child logger support with scoped metadata
- Error serialization with stack traces
- Configurable log levels
- Custom output function support
- TypeScript type definitions
- Comprehensive POC examples
- Full documentation

### Features

- **Automatic Context Enrichment**: Logs automatically include context data without manual passing
- **Structured Logging**: All logs output as JSON for machine readability
- **Child Loggers**: Create scoped loggers with additional metadata
- **Error Handling**: Automatic error object serialization
- **Zero Config**: Works out of the box with sensible defaults
- **Framework Agnostic**: Works with Express, Fastify, or standalone

### Documentation

- Complete README with examples and API reference
- POC demonstration with 7 scenarios
- Integration examples for Express, Fastify, and standalone usage
- MIT License

[0.1.0]: https://github.com/struktosjs/logger/releases/tag/v0.1.0