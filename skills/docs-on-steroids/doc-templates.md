# Documentation Templates

Context-specific documentation templates for different types of software projects. Each template includes section structure, guidance comments, and placeholder Mermaid diagrams.

## Table of Contents

1. [API Service Template](#1-api-service-template)
2. [Library/Package Template](#2-librarypackage-template)
3. [CLI Tool Template](#3-cli-tool-template)
4. [Microservice Template](#4-microservice-template)
5. [Database Schema Template](#5-database-schema-template)

---

## 1. API Service Template

Use for REST APIs, GraphQL APIs, gRPC services, and any HTTP-based service.

````markdown
# [Service Name] API Documentation

## Overview

<!-- 2-3 sentences describing what this API does, who it serves, and its primary use cases. -->

```mermaid
flowchart LR
    Client([Client App]) -->|HTTPS| Gateway[API Gateway]
    Gateway --> Service[This Service]
    Service --> DB[(Database)]
    Service --> ExtSvc[External Services]
```

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://api.example.com/v1` |
| Staging     | `https://api-staging.example.com/v1` |
| Local       | `http://localhost:3000/v1` |

## Authentication

<!-- Describe the authentication mechanism: API key, JWT Bearer, OAuth2, etc. -->

**Method:** Bearer Token (JWT)

```
Authorization: Bearer <access_token>
```

**Obtaining a token:**

```bash
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "..."}'
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "dGh...",
  "expires_in": 3600
}
```

## Endpoints

### Resource: [Resource Name]

| Method | Path | Description | Auth Required |
|--------|------|-------------|:---:|
| GET | `/resources` | List all resources | Yes |
| GET | `/resources/:id` | Get a single resource | Yes |
| POST | `/resources` | Create a resource | Yes |
| PUT | `/resources/:id` | Update a resource | Yes |
| DELETE | `/resources/:id` | Delete a resource | Yes |

#### GET /resources

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `sort` | string | No | `created_at` | Sort field |
| `order` | string | No | `desc` | Sort order: `asc` or `desc` |
| `search` | string | No | - | Full-text search query |

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Example",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### POST /resources

**Request Body:**

```json
{
  "name": "New Resource",
  "description": "Optional description",
  "tags": ["tag1", "tag2"]
}
```

**Request/Response Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant DB
    participant Queue

    Client ->>+ API : POST /resources {body}
    API ->> Validator : Validate request body
    alt Validation passes
        Validator -->> API : OK
        API ->>+ DB : INSERT INTO resources
        DB -->>- API : Created record
        API ->> Queue : Publish resource.created event
        API -->>- Client : 201 Created {resource}
    else Validation fails
        Validator -->> API : Errors[]
        API -->> Client : 400 Bad Request {errors}
    end
```

## Error Codes

| HTTP Status | Error Code | Description | Resolution |
|:-----------:|------------|-------------|------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation | Check required fields and types |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token | Obtain a new token via /auth/login |
| 403 | `FORBIDDEN` | Insufficient permissions | Check user role and resource ownership |
| 404 | `NOT_FOUND` | Resource does not exist | Verify the resource ID |
| 409 | `CONFLICT` | Duplicate resource | Use a unique name/identifier |
| 422 | `UNPROCESSABLE` | Valid syntax but semantic error | Check business rule constraints |
| 429 | `RATE_LIMITED` | Too many requests | Wait and retry with backoff |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Report to the engineering team |

**Error Response Format:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## Rate Limits

| Tier | Requests/minute | Burst |
|------|:---------:|:-----:|
| Free | 60 | 10 |
| Pro | 600 | 50 |
| Enterprise | 6000 | 200 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 594
X-RateLimit-Reset: 1706789400
```

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.2.0 | 2026-02-01 | Added search parameter to GET /resources |
| v1.1.0 | 2026-01-15 | Added rate limiting |
| v1.0.0 | 2026-01-01 | Initial release |
````

---

## 2. Library/Package Template

Use for npm packages, pip packages, cargo crates, Go modules, or any reusable code library.

````markdown
# [Library Name]

<!-- One-line description of what the library does. -->

## Overview

<!-- 2-3 sentences explaining the problem this library solves and its approach. -->

```mermaid
flowchart LR
    App[Your Application] --> Lib[This Library]
    Lib --> DepA[Dependency A]
    Lib --> DepB[Dependency B]
```

## Installation

```bash
# npm
npm install library-name

# yarn
yarn add library-name

# pnpm
pnpm add library-name
```

**Requirements:** Node.js >= 18, TypeScript >= 5.0 (optional)

## Quick Start

```typescript
import { createClient } from 'library-name';

const client = createClient({
  apiKey: process.env.API_KEY,
});

const result = await client.doSomething({ input: 'value' });
console.log(result);
```

## API Reference

### Classes

```mermaid
classDiagram
    class Client {
        +ClientOptions options
        +constructor(options)
        +doSomething(input) Promise~Result~
        +close() void
    }
    class ClientOptions {
        +String apiKey
        +String baseUrl
        +Number timeout
        +Boolean debug
    }
    class Result {
        +String id
        +Object data
        +Date timestamp
    }
    Client --> ClientOptions : configured by
    Client --> Result : returns
```

#### `createClient(options: ClientOptions): Client`

Creates a new client instance.

| Parameter | Type | Required | Default | Description |
|-----------|------|:--------:|---------|-------------|
| `options.apiKey` | string | Yes | - | API authentication key |
| `options.baseUrl` | string | No | `https://api.example.com` | Base URL override |
| `options.timeout` | number | No | 30000 | Request timeout in ms |
| `options.debug` | boolean | No | false | Enable debug logging |

**Returns:** `Client` instance

#### `client.doSomething(input: DoSomethingInput): Promise<Result>`

<!-- Describe what this method does. -->

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `input.field1` | string | Yes | Description |
| `input.field2` | number | No | Description |

**Returns:** `Promise<Result>`

**Throws:**
- `ValidationError` -- when input fails validation
- `NetworkError` -- when the API is unreachable
- `AuthError` -- when the API key is invalid

### Types

```typescript
interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

interface DoSomethingInput {
  field1: string;
  field2?: number;
}

interface Result {
  id: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
```

## Examples

### Basic Usage

```typescript
// Example with description of what it demonstrates
```

### Error Handling

```typescript
import { createClient, ValidationError, NetworkError } from 'library-name';

const client = createClient({ apiKey: '...' });

try {
  const result = await client.doSomething({ field1: 'test' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.details);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  }
}
```

### With TypeScript

```typescript
// Example showing TypeScript-specific usage and type inference
```

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `LIB_API_KEY` | API key (alternative to constructor param) | - |
| `LIB_BASE_URL` | Base URL override | `https://api.example.com` |
| `LIB_LOG_LEVEL` | Log level: debug, info, warn, error | `info` |

## Migration Guide

### From v1.x to v2.x

<!-- List breaking changes and migration steps. -->

| v1.x | v2.x | Notes |
|------|------|-------|
| `new Client(key)` | `createClient({ apiKey: key })` | Constructor replaced with factory function |
| `client.run()` | `client.doSomething()` | Method renamed for clarity |

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `AuthError: Invalid API key` | Expired or malformed key | Regenerate key in dashboard |
| `TimeoutError` | Slow network or server overload | Increase `timeout` option |
| TypeScript errors after upgrade | Type definitions changed | Run `npm install` to get latest types |
````

---

## 3. CLI Tool Template

Use for command-line applications, build tools, developer utilities, and scripts.

````markdown
# [CLI Tool Name]

<!-- One-line description of what this CLI does. -->

## Overview

<!-- 2-3 sentences describing the tool's purpose and primary workflows. -->

```mermaid
flowchart TD
    Input([User Input]) --> Parse[Parse Command & Flags]
    Parse --> Route{Which Command?}
    Route -->|init| Init[Initialize Project]
    Route -->|build| Build[Build Artifacts]
    Route -->|deploy| Deploy[Deploy to Target]
    Route -->|help| Help[Show Help Text]
    Init & Build & Deploy --> Output([Output / Exit])
```

## Installation

```bash
# Install globally
npm install -g tool-name

# Or run directly with npx
npx tool-name <command>
```

## Commands

### `tool-name init [options]`

Initialize a new project in the current directory.

| Flag | Short | Type | Default | Description |
|------|:-----:|------|---------|-------------|
| `--template` | `-t` | string | `default` | Project template to use |
| `--name` | `-n` | string | directory name | Project name |
| `--skip-install` | - | boolean | false | Skip dependency installation |
| `--force` | `-f` | boolean | false | Overwrite existing files |

**Example:**

```bash
tool-name init --template typescript --name my-project
```

### `tool-name build [options]`

Build the project for production.

| Flag | Short | Type | Default | Description |
|------|:-----:|------|---------|-------------|
| `--outdir` | `-o` | string | `dist` | Output directory |
| `--minify` | `-m` | boolean | true | Minify output |
| `--sourcemap` | - | boolean | false | Generate source maps |
| `--watch` | `-w` | boolean | false | Watch mode |

**Example:**

```bash
# Production build
tool-name build --outdir ./build --sourcemap

# Development with watch
tool-name build --watch --no-minify
```

### `tool-name deploy [target] [options]`

Deploy the built project to a target environment.

| Argument/Flag | Type | Required | Default | Description |
|----------|------|:--------:|---------|-------------|
| `target` | string | No | `staging` | Deployment target: `staging`, `production` |
| `--dry-run` | boolean | No | false | Preview changes without deploying |
| `--force` | boolean | No | false | Skip confirmation prompt |

**Deployment flow:**

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant CLI
    participant Build as Build Step
    participant Target as Deploy Target

    Dev ->> CLI : tool-name deploy production
    CLI ->> Build : Run build (if not already built)
    Build -->> CLI : Build artifacts
    CLI ->> Dev : Show diff summary
    CLI ->> Dev : "Deploy to production? (y/n)"
    Dev ->> CLI : Confirm
    CLI ->>+ Target : Upload artifacts
    Target -->>- CLI : Deploy complete
    CLI ->> Dev : Deployment URL
```

## Configuration

Configuration file: `tool.config.js` or `tool.config.json` in project root.

```javascript
export default {
  build: {
    outdir: 'dist',
    minify: true,
    sourcemap: false,
    target: 'es2022',
  },
  deploy: {
    staging: {
      url: 'https://staging.example.com',
      region: 'us-east-1',
    },
    production: {
      url: 'https://example.com',
      region: 'us-east-1',
    },
  },
};
```

**Precedence:** CLI flags > Environment variables > Config file > Defaults

## Global Flags

These flags work with any command:

| Flag | Short | Description |
|------|:-----:|-------------|
| `--help` | `-h` | Show help for the command |
| `--version` | `-v` | Show version number |
| `--verbose` | - | Enable verbose logging |
| `--quiet` | `-q` | Suppress all output except errors |
| `--no-color` | - | Disable colored output |

## Exit Codes

| Code | Meaning |
|:----:|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments or flags |
| 3 | Configuration error |
| 4 | Build failure |
| 5 | Deploy failure |
| 130 | Interrupted (Ctrl+C) |

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `EACCES: permission denied` | Global install without sudo | Use `npx` or fix npm permissions |
| Build fails silently | Missing config file | Run `tool-name init` first |
| Deploy times out | Network or credentials issue | Check VPN and API credentials |
````

---

## 4. Microservice Template

Use for documenting individual microservices within a larger distributed system.

````markdown
# [Service Name] Service

## Overview

<!-- 2-3 sentences: what this service does, its domain boundary, what it owns. -->

**Domain:** <!-- e.g., User Management, Order Processing, Payment -->
**Team:** <!-- e.g., Platform Team -->
**Language:** <!-- e.g., Node.js/TypeScript -->
**Repository:** <!-- e.g., github.com/org/service-name -->

## Architecture

### System Context

```mermaid
C4Context
    title System Context - [Service Name]

    Person(user, "User", "End user of the platform")

    System(thisSvc, "[Service Name]", "Description of this service")

    System_Ext(upstreamA, "Upstream Service A", "What it provides to us")
    System_Ext(downstreamB, "Downstream Service B", "What we provide to it")
    System_Ext(extSvc, "External Service", "Third-party dependency")

    Rel(user, thisSvc, "Uses", "HTTPS")
    Rel(upstreamA, thisSvc, "Sends events", "Kafka")
    Rel(thisSvc, downstreamB, "Calls API", "gRPC")
    Rel(thisSvc, extSvc, "Calls API", "HTTPS")
```

### Component Diagram

```mermaid
C4Component
    title Component Diagram - [Service Name]

    Container_Boundary(svc, "[Service Name]") {
        Component(api, "API Layer", "Framework", "HTTP/gRPC endpoint handlers")
        Component(domain, "Domain Layer", "Language", "Business logic and rules")
        Component(repo, "Repository Layer", "ORM", "Data access abstraction")
        Component(events, "Event Publisher", "Library", "Publishes domain events")
    }

    ContainerDb_Ext(db, "Database", "Type")
    ContainerQueue_Ext(queue, "Message Queue", "Type")

    Rel(api, domain, "Calls")
    Rel(domain, repo, "Uses")
    Rel(domain, events, "Publishes")
    Rel(repo, db, "Queries")
    Rel(events, queue, "Sends events")
```

## Communication Patterns

### Synchronous (API)

<!-- List the APIs this service exposes and consumes. -->

**Exposes:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/resources` | List resources |
| POST | `/api/v1/resources` | Create resource |

**Consumes:**

| Service | Method | Path | Purpose |
|---------|--------|------|---------|
| Auth Service | GET | `/api/v1/users/:id` | Resolve user details |

### Asynchronous (Events)

**Publishes:**

| Event | Topic | Trigger | Payload |
|-------|-------|---------|---------|
| `resource.created` | `resources` | Resource created | `{ id, name, createdBy }` |
| `resource.deleted` | `resources` | Resource deleted | `{ id, deletedBy }` |

**Subscribes:**

| Event | Topic | Handler | Action |
|-------|-------|---------|--------|
| `user.deleted` | `users` | `handleUserDeleted` | Anonymize user data |

```mermaid
sequenceDiagram
    participant Upstream as Upstream Service
    participant Queue as Message Queue
    participant Svc as This Service
    participant DB as Database
    participant Downstream as Downstream Service

    Upstream ->> Queue : Publish user.deleted
    Queue ->> Svc : Consume user.deleted
    Svc ->> DB : Anonymize user references
    Svc ->> Queue : Publish resources.anonymized
    Queue ->> Downstream : Consume resources.anonymized
```

## Data Model

```mermaid
erDiagram
    TABLE_A {
        uuid id PK
        varchar name
        timestamp created_at
    }
    TABLE_B {
        uuid id PK
        uuid table_a_id FK
        text content
    }
    TABLE_A ||--o{ TABLE_B : "has many"
```

<!-- List tables this service owns. Only this service should read/write these tables directly. -->

## Deployment

```mermaid
block-beta
    columns 3
    LB["Load Balancer"]:3
    space:3
    I1["Instance 1"] I2["Instance 2"] I3["Instance 3"]
    space:3
    DB[("Database<br/>Primary")]:2 Cache[("Cache")]:1

    LB --> I1
    LB --> I2
    LB --> I3
    I1 --> DB
    I2 --> DB
    I3 --> DB
    I1 --> Cache
    I2 --> Cache
    I3 --> Cache
```

**Infrastructure:**

| Component | Type | Specs |
|-----------|------|-------|
| Compute | ECS Fargate | 2 vCPU, 4 GB RAM |
| Database | RDS PostgreSQL | db.r6g.large, Multi-AZ |
| Cache | ElastiCache Redis | cache.r6g.large |
| Queue | RabbitMQ | Managed, 3-node cluster |

**Scaling:**
- Minimum instances: 2
- Maximum instances: 10
- Scale trigger: CPU > 70% or request latency > 500ms

## Monitoring and Health Checks

### Health Endpoint

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.5.2",
  "uptime": "3d 14h 22m",
  "checks": {
    "database": "connected",
    "cache": "connected",
    "queue": "connected"
  }
}
```

### Key Metrics

| Metric | Alert Threshold | Dashboard |
|--------|:---------:|-----------|
| Request latency (p99) | > 1000ms | Grafana: Service Overview |
| Error rate (5xx) | > 1% | Grafana: Service Overview |
| Database connections | > 80% pool | Grafana: Database |
| Queue consumer lag | > 1000 messages | Grafana: Messaging |
| Memory usage | > 85% | CloudWatch |

### Runbooks

| Scenario | Runbook Link |
|----------|-------------|
| High error rate | `docs/runbooks/high-error-rate.md` |
| Database connection exhaustion | `docs/runbooks/db-connections.md` |
| Consumer lag spike | `docs/runbooks/consumer-lag.md` |
````

---

## 5. Database Schema Template

Use for documenting database design, whether SQL, NoSQL, or hybrid data stores.

````markdown
# [Database Name] Schema Documentation

## Overview

<!-- 2-3 sentences: what data this database stores, which services own it, what the primary access patterns are. -->

**Engine:** <!-- e.g., PostgreSQL 15 -->
**Service owner:** <!-- e.g., User Service -->
**Connection string pattern:** `postgresql://user:pass@host:5432/dbname`

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Replace with actual schema
    TABLE_A ||--o{ TABLE_B : "has many"
    TABLE_A ||--|| TABLE_C : "has one"
    TABLE_B }o--o{ TABLE_D : "many to many"
```

## Tables

### `table_a`

<!-- Description of what this table stores and its purpose. -->

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `name` | varchar(255) | No | - | Display name |
| `email` | varchar(255) | No | - | Unique email address |
| `status` | varchar(20) | No | `'active'` | Account status |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |
| `deleted_at` | timestamptz | Yes | null | Soft delete timestamp |

**Constraints:**
- PK: `id`
- Unique: `email`
- Check: `status IN ('active', 'inactive', 'suspended')`

**Indexes:**

| Name | Columns | Type | Purpose |
|------|---------|------|---------|
| `idx_table_a_email` | `email` | Unique B-tree | Email lookup |
| `idx_table_a_status` | `status` | B-tree | Filter by status |
| `idx_table_a_created` | `created_at` | B-tree | Sort by creation date |
| `idx_table_a_active` | `id` WHERE `deleted_at IS NULL` | Partial | Exclude soft-deleted rows |

### `table_b`

<!-- Repeat the pattern above for each table. -->

## Relationships

<!-- Explain the business meaning of each relationship, not just the technical cardinality. -->

| Parent | Child | Type | FK Column | On Delete | Business Rule |
|--------|-------|------|-----------|-----------|---------------|
| `table_a` | `table_b` | One-to-many | `table_b.table_a_id` | CASCADE | When a user is deleted, their orders are also deleted |
| `table_a` | `table_c` | One-to-one | `table_c.table_a_id` | SET NULL | Profile survives user deletion |

## Common Queries

### Fetch user with orders

```sql
SELECT u.*, json_agg(o.*) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.id = $1
  AND u.deleted_at IS NULL
GROUP BY u.id;
```

**Expected performance:** < 5ms with index `idx_orders_user_id`

## Migrations

| Version | Date | Description | Reversible |
|---------|------|-------------|:----------:|
| 001 | 2026-01-01 | Initial schema | Yes |
| 002 | 2026-01-15 | Add `status` column to table_a | Yes |
| 003 | 2026-02-01 | Create table_b with FK to table_a | Yes |
| 004 | 2026-02-10 | Add partial index on active records | Yes |

### Migration Conventions

- Migrations are numbered sequentially (001, 002, ...).
- Each migration file has an `up` and `down` function.
- All DDL changes go through migrations -- never modify schema directly.
- Test `down` migration in staging before applying `up` in production.
- Large data migrations run as background jobs, not in the migration itself.

## Backup and Recovery

| Aspect | Configuration |
|--------|---------------|
| Automated backups | Daily at 02:00 UTC, retained 30 days |
| Point-in-time recovery | Enabled, 5-minute granularity |
| Cross-region replica | us-west-2 (read replica) |
| Manual snapshots | Before major migrations |
| Recovery time objective | < 1 hour |
| Recovery point objective | < 5 minutes |
````
