// Error Handling and Logging System
import { toast } from "sonner";

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  PAYMENT = 'PAYMENT',
  STRIPE = 'STRIPE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
  EXTERNAL_API = 'EXTERNAL_API'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error factory functions
export class ErrorFactory {
  static validation(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 400, context);
  }

  static authentication(message: string = 'Authentication required', context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, 401, context);
  }

  static authorization(message: string = 'Insufficient permissions', context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 403, context);
  }

  static notFound(message: string = 'Resource not found', context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404, context);
  }

  static conflict(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.CONFLICT, ErrorSeverity.MEDIUM, 409, context);
  }

  static rateLimit(message: string = 'Rate limit exceeded', context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429, context);
  }

  static payment(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.PAYMENT, ErrorSeverity.HIGH, 402, context);
  }

  static stripe(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.STRIPE, ErrorSeverity.HIGH, 502, context);
  }

  static database(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.DATABASE, ErrorSeverity.HIGH, 500, context);
  }

  static network(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, 503, context);
  }

  static externalAPI(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.EXTERNAL_API, ErrorSeverity.MEDIUM, 502, context);
  }

  static internal(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.INTERNAL, ErrorSeverity.CRITICAL, 500, context);
  }
}

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: AppError;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Logger class
export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Log error
  error(message: string, error?: AppError, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, error, context);
    
    // Send to external logging service in production
    if (import.meta.env.PROD) {
      this.sendToExternalService(LogLevel.ERROR, message, error, context);
    }
  }

  // Log warning
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  // Log info
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  // Log debug
  debug(message: string, context?: Record<string, any>): void {
    if (import.meta.env.DEV) {
      this.log(LogLevel.DEBUG, message, undefined, context);
    }
  }

  // Core logging method
  private log(level: LogLevel, message: string, error?: AppError, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      error,
      context: this.sanitizeContext(context),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId()
    };

    // Add to local logs
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    this.outputToConsole(logEntry);
  }

  // Output to console with appropriate styling
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp;
    const level = entry.level;
    const message = entry.message;
    
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, entry.error, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.context);
        break;
    }
  }

  // Send to external logging service
  private async sendToExternalService(
    level: LogLevel, 
    message: string, 
    error?: AppError, 
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // In production, send to services like Sentry, LogRocket, etc.
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          type: error.type,
          severity: error.severity,
          statusCode: error.statusCode,
          stack: error.stack,
          context: error.context
        } : undefined,
        context: this.sanitizeContext(context),
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
        requestId: this.getCurrentRequestId(),
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      };

      // Example: Send to external service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // });
    } catch (err) {
      console.error('Failed to send log to external service:', err);
    }
  }

  // Sanitize context for logging
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
    const sanitized = { ...context };

    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Get current user ID (implement based on your auth system)
  private getCurrentUserId(): string | undefined {
    // Return current user ID from auth context
    return undefined;
  }

  // Get current session ID
  private getCurrentSessionId(): string | undefined {
    // Return current session ID
    return undefined;
  }

  // Get current request ID
  private getCurrentRequestId(): string | undefined {
    // Return current request ID
    return undefined;
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get error logs
  getErrorLogs(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.ERROR);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Error boundary for React components
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const logger = Logger.getInstance();
    logger.error('React Error Boundary caught an error', ErrorFactory.internal(error.message), {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
      </div>
      {import.meta.env.DEV && (
        <details className="mb-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <div className="flex space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Refresh Page
        </button>
        <button
          onClick={() => window.history.back()}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);

// Error handling hooks
export const useErrorHandler = () => {
  const logger = Logger.getInstance();

  const handleError = (error: Error | AppError, context?: Record<string, any>) => {
    if (error instanceof AppError) {
      logger.error(error.message, error, context);
    } else {
      logger.error(error.message, ErrorFactory.internal(error.message), context);
    }

    // Show user-friendly error message
    const userMessage = error instanceof AppError 
      ? error.message 
      : 'An unexpected error occurred. Please try again.';

    toast.error(userMessage);
  };

  const handleAsyncError = (error: Error | AppError, context?: Record<string, any>) => {
    handleError(error, context);
    return Promise.reject(error);
  };

  return {
    handleError,
    handleAsyncError,
    logger
  };
};

// Payment error handling
export class PaymentErrorHandler {
  static handleStripeError(error: any): AppError {
    switch (error.type) {
      case 'card_error':
        return ErrorFactory.payment(`Card error: ${error.message}`, {
          stripeError: error,
          errorCode: error.code
        });
      case 'rate_limit_error':
        return ErrorFactory.rateLimit('Too many requests to Stripe', {
          stripeError: error
        });
      case 'invalid_request_error':
        return ErrorFactory.validation(`Invalid request: ${error.message}`, {
          stripeError: error
        });
      case 'authentication_error':
        return ErrorFactory.stripe('Stripe authentication failed', {
          stripeError: error
        });
      case 'api_connection_error':
        return ErrorFactory.network('Failed to connect to Stripe', {
          stripeError: error
        });
      case 'api_error':
        return ErrorFactory.stripe('Stripe API error', {
          stripeError: error
        });
      default:
        return ErrorFactory.stripe(`Stripe error: ${error.message}`, {
          stripeError: error
        });
    }
  }

  static handlePaymentError(error: any): AppError {
    if (error.code === 'insufficient_funds') {
      return ErrorFactory.payment('Insufficient funds in your account', {
        paymentError: error
      });
    }
    
    if (error.code === 'card_declined') {
      return ErrorFactory.payment('Your card was declined', {
        paymentError: error
      });
    }

    return ErrorFactory.payment(`Payment failed: ${error.message}`, {
      paymentError: error
    });
  }
}

// Database error handling
export class DatabaseErrorHandler {
  static handleSupabaseError(error: any): AppError {
    if (error.code === '23505') {
      return ErrorFactory.conflict('Resource already exists', {
        databaseError: error
      });
    }
    
    if (error.code === '23503') {
      return ErrorFactory.validation('Referenced resource does not exist', {
        databaseError: error
      });
    }

    if (error.code === '42501') {
      return ErrorFactory.authorization('Insufficient database permissions', {
        databaseError: error
      });
    }

    return ErrorFactory.database(`Database error: ${error.message}`, {
      databaseError: error
    });
  }
}

// Export logger instance
export const logger = Logger.getInstance();
