/**
 * Map Error Handling Service
 * Provides centralized error handling, retry logic, and user-friendly messages
 * for the interactive property map feature.
 */

export type MapErrorType =
  | 'MAPBOX_INIT_FAILED'
  | 'GEOCODING_FAILED'
  | 'AMENITIES_FETCH_FAILED'
  | 'BOUNDARY_FETCH_FAILED'
  | 'ISOCHRONE_FETCH_FAILED'
  | 'STREET_VIEW_UNAVAILABLE'
  | 'INVALID_COORDINATES'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface MapError {
  type: MapErrorType;
  message: string;
  userMessage: string;
  originalError?: Error;
  retryable: boolean;
  code?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Validates latitude and longitude coordinates
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Classifies an error and returns a MapError object
 */
export const classifyError = (error: unknown, context: string): MapError => {
  const err = error instanceof Error ? error : new Error(String(error));

  // Network errors
  if (err.message.includes('fetch') || err.message.includes('network')) {
    return {
      type: 'NETWORK_ERROR',
      message: `Network error in ${context}: ${err.message}`,
      userMessage: 'Network connection failed. Please check your internet and try again.',
      originalError: err,
      retryable: true,
    };
  }

  // Timeout errors
  if (err.message.includes('timeout') || err.message.includes('timed out')) {
    return {
      type: 'TIMEOUT',
      message: `Timeout in ${context}: ${err.message}`,
      userMessage: 'Request took too long. Please try again.',
      originalError: err,
      retryable: true,
    };
  }

  // Mapbox-specific errors
  if (err.message.includes('mapbox') || err.message.includes('Mapbox')) {
    return {
      type: 'MAPBOX_INIT_FAILED',
      message: `Mapbox error in ${context}: ${err.message}`,
      userMessage: 'Map failed to load. Please refresh the page.',
      originalError: err,
      retryable: true,
    };
  }

  // Geocoding errors
  if (context.includes('geocod')) {
    return {
      type: 'GEOCODING_FAILED',
      message: `Geocoding error: ${err.message}`,
      userMessage: 'Unable to locate property. Please verify the address.',
      originalError: err,
      retryable: true,
    };
  }

  // Default unknown error
  return {
    type: 'UNKNOWN',
    message: `Unknown error in ${context}: ${err.message}`,
    userMessage: 'Something went wrong. Please try again.',
    originalError: err,
    retryable: false,
  };
};

/**
 * Retries an async operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operationName: string = 'operation'
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxAttempts) {
        const delayMs = finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
        console.warn(
          `${operationName} attempt ${attempt} failed. Retrying in ${delayMs}ms...`,
          lastError
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error(`${operationName} failed after ${finalConfig.maxAttempts} attempts`);
};

/**
 * Validates and sanitizes property data
 */
export const validatePropertyData = (property: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!property) {
    errors.push('Property data is missing');
    return { valid: false, errors };
  }

  if (!property.address) {
    errors.push('Property address is missing');
  }

  if (!property.city) {
    errors.push('Property city is missing');
  }

  if (!property.state) {
    errors.push('Property state is missing');
  }

  if (!property.zip_code) {
    errors.push('Property zip code is missing');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Handles API response errors
 */
export const handleApiError = (
  status: number,
  statusText: string,
  context: string
): MapError => {
  const statusMap: Record<number, { type: MapErrorType; message: string }> = {
    400: { type: 'INVALID_COORDINATES', message: 'Invalid request parameters' },
    401: { type: 'UNKNOWN', message: 'Authentication failed' },
    403: { type: 'UNKNOWN', message: 'Access denied' },
    404: { type: 'GEOCODING_FAILED', message: 'Resource not found' },
    429: { type: 'NETWORK_ERROR', message: 'Rate limit exceeded' },
    500: { type: 'UNKNOWN', message: 'Server error' },
    503: { type: 'NETWORK_ERROR', message: 'Service unavailable' },
  };

  const errorInfo = statusMap[status] || {
    type: 'UNKNOWN' as MapErrorType,
    message: `HTTP ${status}: ${statusText}`,
  };

  return {
    type: errorInfo.type,
    message: `${context}: ${errorInfo.message}`,
    userMessage: `Request failed (${status}). Please try again.`,
    retryable: status >= 500 || status === 429,
    code: String(status),
  };
};

/**
 * Logs errors with context for debugging
 */
export const logMapError = (error: MapError, additionalContext?: Record<string, any>): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    code: error.code,
    ...additionalContext,
  };

  console.error('[MapError]', logEntry);

  // In production, you might send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToLoggingService(logEntry);
  }
};

/**
 * Gracefully degrades map features when APIs fail
 */
export const createDegradedMapState = () => {
  return {
    amenitiesAvailable: false,
    boundariesAvailable: false,
    commuteTimesAvailable: false,
    streetViewAvailable: false,
    searchAvailable: false,
  };
};

/**
 * Checks if an error is recoverable
 */
export const isRecoverableError = (error: MapError): boolean => {
  return error.retryable && error.type !== 'INVALID_COORDINATES';
};

/**
 * Formats error message for display to users
 */
export const formatErrorForDisplay = (error: MapError): string => {
  return error.userMessage;
};

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
};
