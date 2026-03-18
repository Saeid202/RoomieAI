/**
 * Secure Logger — Deno / Supabase Edge Functions
 *
 * Drop-in replacement for console.log with automatic PII/financial data
 * redaction and structured JSON output. Compatible with Supabase logging.
 *
 * Usage:
 *   import { logger } from '../_shared/logger.ts';
 *   logger.info('Payment processed', { paymentIntentId: pi.id });
 */

// ─── Data Classification Registry ────────────────────────────────────────────

const SENSITIVE_FIELD_NAMES = new Set([
  'password', 'passwd', 'pass',
  'token', 'access_token', 'refresh_token', 'id_token',
  'api_key', 'apikey', 'api_secret',
  'secret', 'client_secret',
  'authorization', 'auth',
  'credit_score', 'creditscore',
  'ssn', 'sin', 'social_security', 'social_insurance',
  'bank_account', 'account_number', 'routing_number', 'transit_number',
  'income', 'salary', 'annual_income', 'monthly_income', 'gross_income', 'net_income',
  'credit_card', 'card_number', 'cvv', 'cvc', 'expiry', 'expiration',
  'loan_amount', 'mortgage_amount', 'down_payment', 'downpayment',
  'stripe_key', 'stripe_secret', 'webhook_secret',
  'private_key', 'public_key',
  'dob', 'date_of_birth', 'birth_date',
  'phone', 'phone_number', 'mobile',
  'address', 'street_address', 'postal_code', 'zip_code',
]);

const SENSITIVE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'creditCard', pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,4}\b/g },
  { name: 'ssn',        pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { name: 'sin',        pattern: /\b\d{3}\s\d{3}\s\d{3}\b/g },
  { name: 'jwt',        pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g },
  { name: 'currency',   pattern: /\$[\d,]+(\.\d{2})?/g },
];

// ─── Sanitizer ────────────────────────────────────────────────────────────────

function sanitizeString(value: string): string {
  let result = value;
  for (const { pattern } of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function sanitize(value: unknown, seen = new WeakSet()): unknown {
  try {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value === 'string') return sanitizeString(value);

    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, seen));
    }

    if (typeof value === 'object') {
      if (seen.has(value as object)) return '[CIRCULAR]';
      seen.add(value as object);

      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitize(val, seen);
        }
      }
      return result;
    }

    return value;
  } catch {
    return '[SANITIZATION_ERROR]';
  }
}

// ─── Environment & Log Level Config ──────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getEnvironment(): string {
  try {
    return (
      Deno.env.get('APP_ENV') ||
      Deno.env.get('ENVIRONMENT') ||
      'production'
    );
  } catch {
    return 'production';
  }
}

function getConfiguredLevel(): LogLevel {
  try {
    const override = Deno.env.get('LOG_LEVEL');
    if (override && override in LOG_LEVEL_ORDER) return override as LogLevel;
  } catch { /* ignore */ }

  const env = getEnvironment();
  if (env === 'development') return 'debug';
  if (env === 'staging') return 'info';
  return 'warn';
}

const ENV = getEnvironment();
const IS_DEV = ENV === 'development';
const CONFIGURED_LEVEL = getConfiguredLevel();

// ─── Logger Implementation ────────────────────────────────────────────────────

let _context: Record<string, unknown> = {};

function emit(level: LogLevel, message: string, args: unknown[]): void {
  if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[CONFIGURED_LEVEL]) return;

  if (IS_DEV) {
    // Plain output in dev for readability
    const prefix = `[${level.toUpperCase()}]`;
    if (args.length > 0) {
      console[level](prefix, message, ...args);
    } else {
      console[level](prefix, message);
    }
    return;
  }

  // Always structured JSON in edge functions (Supabase captures stdout)
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: ENV,
    version: '1',
    context: sanitize(_context),
    args: args.map((a) => sanitize(a)),
  };

  console[level](JSON.stringify(entry));
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => emit('debug', message, args),
  info:  (message: string, ...args: unknown[]) => emit('info',  message, args),
  warn:  (message: string, ...args: unknown[]) => emit('warn',  message, args),
  error: (message: string, ...args: unknown[]) => emit('error', message, args),

  setContext: (ctx: Record<string, unknown>) => {
    _context = { ..._context, ...ctx };
  },

  clearContext: () => {
    _context = {};
  },
};
