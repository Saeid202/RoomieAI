// KYC Configuration Constants
export const KYC_CONFIG = {
  // Timeout settings
  VERIFICATION_TIMEOUT_MINUTES: 30, // Auto-expire pending verifications after 30 minutes
  WEBHOOK_TTL_MINUTES: 5, // Webhook duplicate prevention window
  
  // Retry settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Status management
  PENDING_EXPIRATION_MINUTES: 30,
  FAILED_RETRY_COOLDOWN_MINUTES: 60,
  
  // Rate limiting
  MAX_VERIFICATION_REQUESTS_PER_HOUR: 5,
  MAX_WEBHOOK_EVENTS_PER_MINUTE: 10,
  
  // Cache settings
  STATUS_CACHE_TTL_MINUTES: 5,
  CONSENT_CACHE_TTL_MINUTES: 30,
  
  // Provider settings
  PROVIDER_TIMEOUT_SECONDS: 300, // 5 minutes for provider responses
  PROVIDER_RETRY_ATTEMPTS: 2,
  
  // Security
  WEBHOOK_SIGNATURE_TTL_HOURS: 24,
  AUDIT_LOG_RETENTION_DAYS: 90,
} as const;

// KYC Status Constants
export const KYC_STATUS = {
  NOT_VERIFIED: 'not_verified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

// Retry Status Constants
export const RETRY_STATUS = {
  CAN_RETRY: 'can_retry',
  EXHAUSTED: 'exhausted',
  BLOCKED: 'blocked',
} as const;

// Error Types
export const KYC_ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  PROVIDER_ERROR: 'provider_error',
  VALIDATION_ERROR: 'validation_error',
  TIMEOUT_ERROR: 'timeout_error',
  DUPLICATE_REQUEST: 'duplicate_request',
  CONSENT_REQUIRED: 'consent_required',
  RATE_LIMITED: 'rate_limited',
  WEBHOOK_INVALID: 'webhook_invalid',
  AUDIT_ERROR: 'audit_error',
} as const;

// Helper Functions
export function isVerificationExpired(lastUpdated: string): boolean {
  const now = new Date();
  const lastUpdate = new Date(lastUpdated);
  const expiryTime = new Date(lastUpdate.getTime() + KYC_CONFIG.PENDING_EXPIRATION_MINUTES * 60 * 1000);
  return now > expiryTime;
}

export function canRetryVerification(retryCount: number, lastRetryTime?: string): boolean {
  if (retryCount >= KYC_CONFIG.MAX_RETRY_ATTEMPTS) {
    return false;
  }
  
  if (lastRetryTime) {
    const now = new Date();
    const lastRetry = new Date(lastRetryTime);
    const retryCooldown = new Date(lastRetry.getTime() + (KYC_CONFIG.FAILED_RETRY_COOLDOWN_MINUTES * 60 * 1000));
    return now >= retryCooldown;
  }
  
  return true;
}

export function getRetryDelay(retryCount: number): number {
  return KYC_CONFIG.RETRY_DELAY_MS * Math.pow(KYC_CONFIG.RETRY_BACKOFF_MULTIPLIER, retryCount);
}

export function shouldRateLimit(lastRequestTime?: string): boolean {
  if (!lastRequestTime) return false;
  
  const now = new Date();
  const lastRequest = new Date(lastRequestTime);
  const requestWindow = KYC_CONFIG.MAX_VERIFICATION_REQUESTS_PER_HOUR * 60 * 60 * 1000;
  const nextAllowedTime = new Date(lastRequest.getTime() + requestWindow);
  
  return now < nextAllowedTime;
}

export function formatVerificationDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case KYC_STATUS.NOT_VERIFIED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case KYC_STATUS.PENDING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case KYC_STATUS.VERIFIED:
      return 'bg-green-100 text-green-800 border-green-200';
    case KYC_STATUS.REJECTED:
    case KYC_STATUS.FAILED:
    case KYC_STATUS.EXPIRED:
      return 'bg-red-100 text-red-800 border-red-200';
    case KYC_STATUS.CANCELLED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
}

export function getVerificationStatusIndicatorColor(status: string): string {
  switch (status) {
    case KYC_STATUS.NOT_VERIFIED:
      return 'bg-yellow-500';
    case KYC_STATUS.PENDING:
      return 'bg-blue-500';
    case KYC_STATUS.VERIFIED:
      return 'bg-green-500';
    case KYC_STATUS.REJECTED:
    case KYC_STATUS.FAILED:
    case KYC_STATUS.EXPIRED:
      return 'bg-red-500';
    case KYC_STATUS.CANCELLED:
      return 'bg-gray-500';
    default:
      return 'bg-yellow-500';
  }
}
