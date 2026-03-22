# Secure Logging Practices Design Document

## Overview

This design implements a secure logging system across the React frontend and Supabase edge functions. The core deliverable is two logger utilities — one for the browser (React/TypeScript) and one for Deno (edge functions) — that act as drop-in replacements for `console.log` with automatic PII/financial data redaction, environment-based log levels, and structured JSON output.

## Architecture

```
src/utils/logger.ts                    ← React frontend logger
supabase/functions/_shared/logger.ts  ← Deno edge function logger (shared)
```

Both loggers share the same redaction logic and data classification registry. The edge function logger imports from `_shared/` which is the standard Supabase pattern for shared utilities.

## Data Classification Registry

A static registry maps field names and regex patterns to sensitivity levels:

```
SENSITIVE_FIELD_NAMES = [
  "password", "token", "api_key", "secret", "authorization",
  "credit_score", "ssn", "sin", "social_security",
  "bank_account", "account_number", "routing_number",
  "income", "salary", "annual_income", "monthly_income",
  "credit_card", "card_number", "cvv", "expiry",
  "loan_amount", "mortgage_amount", "down_payment",
  "stripe_key", "webhook_secret", "refresh_token", "access_token"
]

SENSITIVE_PATTERNS = [
  creditCard:   /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,4}\b/g
  ssn:          /\b\d{3}-\d{2}-\d{4}\b/g
  sin:          /\b\d{3}\s\d{3}\s\d{3}\b/g
  bankAccount:  /\b\d{8,17}\b/g
  email:        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  currency:     /\$[\d,]+(\.\d{2})?/g
  jwt:          /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g
]
```

## Environment Configuration

| Environment | Log Level | Redaction | Console Output |
|-------------|-----------|-----------|----------------|
| development | debug     | disabled  | full           |
| staging     | info      | enabled   | structured     |
| production  | warn      | enforced  | structured     |
| (unset)     | warn      | enforced  | structured     |

Environment is read from:
- React: `import.meta.env.VITE_APP_ENV` or `import.meta.env.MODE`
- Deno: `Deno.env.get("APP_ENV")` or `Deno.env.get("ENVIRONMENT")`

Log level can be overridden via `VITE_LOG_LEVEL` (React) or `LOG_LEVEL` (Deno).

## Redaction Pipeline

The sanitizer processes any value recursively:

```
sanitize(value):
  if value is null/undefined/boolean/number → return as-is
  if value is string → apply pattern redaction → return
  if value is array → map each element through sanitize → return
  if value is object:
    for each key:
      if key matches SENSITIVE_FIELD_NAMES → replace value with "[REDACTED]"
      else → sanitize(value[key]) recursively
    handle circular references via WeakSet tracking
  return sanitized copy
```

In development mode, the sanitizer is bypassed entirely so developers get full output.

## Structured Log Format

```json
{
  "timestamp": "2026-03-18T10:30:00.000Z",
  "level": "info",
  "message": "Payment processed",
  "environment": "production",
  "version": "1",
  "context": { "requestId": "abc123", "userId": "u_xxx" },
  "args": [{ "status": "paid", "amount": "[REDACTED]" }]
}
```

In development, output is plain `console.log` (not JSON) for readability.

## Frontend Logger (`src/utils/logger.ts`)

### API

```typescript
import { logger } from '@/utils/logger';

logger.debug('message', ...args)
logger.info('message', ...args)
logger.warn('message', ...args)
logger.error('message', ...args)
logger.setContext(ctx: Record<string, unknown>)  // set request/session context
logger.clearContext()
```

### Browser Console Protection (Production)

In production, the logger wraps `console.log`, `console.warn`, `console.error`, `console.debug` at module load time. Any direct `console.*` calls that slip through are intercepted and run through the sanitizer before output. This is a safety net — the primary protection is using `logger.*` everywhere.

```typescript
// Applied once at module init in production
if (isProd) {
  const originalConsole = { ...console };
  console.log = (...args) => originalConsole.log(...args.map(sanitize));
  // same for warn, error, debug
}
```

### Log Level Filtering

```typescript
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
// Only emit if LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel]
```

## Edge Function Logger (`supabase/functions/_shared/logger.ts`)

Identical redaction logic and API, adapted for Deno:
- Uses `Deno.env.get()` instead of `import.meta.env`
- No browser console wrapping
- Always outputs structured JSON (Supabase captures stdout as logs)
- Compatible with Supabase's logging infrastructure

### Usage in edge functions

```typescript
import { logger } from '../_shared/logger.ts';

// Replace:
console.log(`✅ Payment succeeded: ${pi.id}`)
// With:
logger.info('Payment succeeded', { paymentIntentId: pi.id })

// Replace:
console.log(`💰 Adding ${amount} to pending balance for landlord ${landlord_id}`)
// With:
logger.info('Adding to pending balance', { landlordId: landlord_id })
// amount is NOT logged — financial data
```

## Files to Create / Modify

### New Files
- `src/utils/logger.ts` — React frontend secure logger
- `supabase/functions/_shared/logger.ts` — Deno shared secure logger

### Files to Update (edge functions)
- `supabase/functions/process-property-document/index.ts` — replace console.* calls
- `supabase/functions/process-property-document-simple/index.ts` — replace console.* calls
- `supabase/functions/payment-webhook/index.ts` — replace console.* calls (financial data risk)
- `supabase/functions/admin-rate-limit-config/index.ts` — replace console.* calls

### No Frontend Changes Required Yet
The React frontend currently has no sensitive data in console logs. The logger utility will be available for future use. The browser console protection wrapper will be applied automatically on import.

## Error Handling

- If sanitization throws, the logger catches it and emits a safe fallback: `{ message: "[LOG_SANITIZATION_ERROR]", level, timestamp }`
- If circular reference is detected, the affected value is replaced with `"[CIRCULAR]"`
- Logger never throws — all errors are swallowed internally

## What's Out of Scope for This Implementation

- DLP alerting/monitoring (Req 10) — requires external alerting infrastructure
- GDPR erasure from logs (Req 4) — requires log storage system integration
- ESLint rules (Req 12) — separate tooling task
- Log retention policies (Req 4, 5) — infrastructure concern
