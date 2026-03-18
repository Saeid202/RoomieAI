# Secure Logging Practices - Implementation Tasks

## Task 1: Create Data Classification Registry and Sanitizer

**References:** Requirements 1, 3, 14

Create the shared sanitization core used by both loggers.

- Define `SENSITIVE_FIELD_NAMES` array with all sensitive key names (password, token, api_key, secret, credit_score, ssn, sin, bank_account, income, salary, stripe_key, etc.)
- Define `SENSITIVE_PATTERNS` map with compiled regex for: credit cards, SSN, SIN, bank accounts, emails, currency values, JWTs
- Implement `sanitize(value: unknown): unknown` function that:
  - Returns primitives (null, boolean, number) unchanged
  - Applies pattern redaction to strings
  - Recursively sanitizes arrays
  - Recursively sanitizes objects, replacing values for sensitive key names with `"[REDACTED]"`
  - Handles circular references via `WeakSet`
  - Wraps in try/catch, returns `"[SANITIZATION_ERROR]"` on failure
- This logic will be duplicated (not imported) between the two logger files since they run in different runtimes

**Acceptance:** `sanitize({ password: "abc", name: "John" })` → `{ password: "[REDACTED]", name: "John" }`

---

## Task 2: Create React Frontend Logger (`src/utils/logger.ts`)

**References:** Requirements 2, 6, 7, 8, 9

- Read environment from `import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE`
- Read log level override from `import.meta.env.VITE_LOG_LEVEL`
- Implement log level filtering: `debug=0, info=1, warn=2, error=3`
- Default levels: dev=debug, staging=info, prod=warn, unset=warn
- Implement `logger` object with methods: `debug`, `info`, `warn`, `error`
- In development: call `console[level](message, ...args)` directly (no sanitization, no JSON)
- In staging/production: sanitize all args, output structured JSON via `console[level]`
- Implement `logger.setContext(ctx)` and `logger.clearContext()` for request tracking
- In production only: wrap `console.log`, `console.warn`, `console.error`, `console.debug` to run args through `sanitize()` as a safety net
- Export as named export: `export const logger`

**Acceptance:** In prod, `logger.info('test', { credit_score: 750 })` outputs JSON with `"[REDACTED]"` for credit_score

---

## Task 3: Create Deno Edge Function Logger (`supabase/functions/_shared/logger.ts`)

**References:** Requirements 2, 6, 7, 9, 13

- Read environment from `Deno.env.get("APP_ENV") ?? Deno.env.get("ENVIRONMENT") ?? "production"`
- Read log level override from `Deno.env.get("LOG_LEVEL")`
- Same log level filtering logic as Task 2
- Same `logger` object API: `debug`, `info`, `warn`, `error`, `setContext`, `clearContext`
- Always output structured JSON (no plain console mode) — Supabase captures stdout
- In development env only: skip sanitization
- In all other envs: sanitize all args before output
- No browser console wrapping (not applicable in Deno)
- Export as named export: `export const logger`

**Acceptance:** Edge function can `import { logger } from '../_shared/logger.ts'` and call `logger.info()`

---

## Task 4: Update `payment-webhook` Edge Function

**References:** Requirement 13, design section "Files to Update"

Replace all `console.log/warn/error` calls in `supabase/functions/payment-webhook/index.ts`:

- Add import: `import { logger } from '../_shared/logger.ts'`
- `console.log('Payment processing: ...')` → `logger.info('Payment processing', { paymentIntentId: pi.id })`
- `console.log('Payment succeeded: ...')` → `logger.info('Payment succeeded', { paymentIntentId: pi.id })`
- `console.log('Reporting Metrics: ...')` → `logger.info('Payment reporting metrics', { onTime, daysLate })` — do NOT log amount
- `console.log('Adding ${amount} to pending balance...')` → `logger.info('Updating landlord wallet', { landlordId: landlord_id })` — do NOT log amount
- `console.log('Recording payout...')` → `logger.info('Recording payout', { userId: account.user_id })` — do NOT log amount
- `console.error(...)` → `logger.error(...)`
- `console.log('Event already processed...')` → `logger.info('Duplicate webhook event skipped', { eventId: event.id })`

**Acceptance:** No financial amounts appear in any log statement

---

## Task 5: Update `process-property-document` Edge Function

**References:** Requirement 13

Replace all `console.*` calls in `supabase/functions/process-property-document/index.ts`:

- Add import: `import { logger } from '../_shared/logger.ts'`
- Replace all `console.log(...)` → `logger.info(...)` or `logger.debug(...)`
- Replace all `console.warn(...)` → `logger.warn(...)`
- Replace all `console.error(...)` → `logger.error(...)`
- For the rate limit log: `logger.warn('Rate limit exceeded', { userId: user.id, count: rateLimit.count, limit: rateLimit.limit })` — userId is acceptable in warn logs
- Remove emoji prefixes from log messages (they're fine in dev but noisy in structured logs)

**Acceptance:** Function uses `logger.*` exclusively, no `console.*` calls remain

---

## Task 6: Update `process-property-document-simple` Edge Function

**References:** Requirement 13

Same as Task 5 but for `supabase/functions/process-property-document-simple/index.ts`.

---

## Task 7: Update `admin-rate-limit-config` Edge Function

**References:** Requirement 13

Replace all `console.*` calls in `supabase/functions/admin-rate-limit-config/index.ts` with `logger.*` calls. No sensitive financial data expected here, but structured logging is still required.

---

## Task Order

1 → 2 → 3 → 4 → 5 → 6 → 7

Tasks 2 and 3 depend on Task 1 (sanitizer logic).
Tasks 4–7 depend on Task 3 (edge logger).
