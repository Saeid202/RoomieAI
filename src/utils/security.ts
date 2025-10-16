// Security Configuration and Utilities
export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimits: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per windowMs
      message: 'Too many authentication attempts, please try again later.'
    },
    payment: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10, // limit each IP to 10 payment requests per windowMs
      message: 'Too many payment attempts, please try again later.'
    }
  },

  // Password requirements
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPasswords: [
      'password', '123456', 'qwerty', 'abc123', 'password123',
      'admin', 'user', 'test', 'demo', 'guest'
    ]
  },

  // Session security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'strict' // CSRF protection
  },

  // CORS configuration
  cors: {
    origin: import.meta.env.PROD 
      ? ['https://yourdomain.com', 'https://www.yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },

  // Input validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    sanitizeHtml: true,
    validateEmail: true,
    validatePhone: true
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },

  // Audit logging
  audit: {
    logLevels: ['error', 'warn', 'info', 'debug'],
    logRetention: 90, // days
    sensitiveFields: ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'],
    logEvents: [
      'user_login', 'user_logout', 'user_registration',
      'payment_attempt', 'payment_success', 'payment_failure',
      'data_access', 'data_modification', 'admin_action'
    ]
  }
};

// Security utilities
export class SecurityUtils {
  // Password validation
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = SECURITY_CONFIG.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must be no more than ${policy.maxLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (policy.forbiddenPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and not allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, SECURITY_CONFIG.validation.maxStringLength);
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone validation
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }

  // Hash password (for client-side validation)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Check if field is sensitive
  static isSensitiveField(fieldName: string): boolean {
    return SECURITY_CONFIG.audit.sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  // Sanitize object for logging
  static sanitizeForLogging(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeForLogging(sanitized[key]);
      }
    }
    
    return sanitized;
  }

  // Validate file upload
  static validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
      errors.push(`File size must be less than ${SECURITY_CONFIG.validation.maxFileSize / (1024 * 1024)}MB`);
    }
    
    if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 32;
  }

  // Check for SQL injection patterns
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(;|\-\-|\/\*|\*\/)/,
      /(\b(OR|AND)\b.*\b(OR|AND)\b)/i,
      /(\b(OR|AND)\b.*=.*\b(OR|AND)\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*>/
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting check
  static checkRateLimit(ip: string, endpoint: string, requests: Map<string, number[]>): boolean {
    const now = Date.now();
    const windowMs = SECURITY_CONFIG.rateLimits.api.windowMs;
    const maxRequests = SECURITY_CONFIG.rateLimits.api.max;
    
    const key = `${ip}:${endpoint}`;
    const requestTimes = requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return true;
  }

  // Security headers
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': this.buildCSPHeader()
    };
  }

  // Build CSP header
  private static buildCSPHeader(): string {
    const directives = SECURITY_CONFIG.csp.directives;
    return Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }
}

// Security middleware
export class SecurityMiddleware {
  private static requestCounts = new Map<string, number[]>();
  
  // Rate limiting middleware
  static rateLimit = (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.path;
    
    if (!SecurityUtils.checkRateLimit(ip, endpoint, this.requestCounts)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: SECURITY_CONFIG.rateLimits.api.message
      });
    }
    
    next();
  };

  // Input validation middleware
  static validateInput = (req: any, res: any, next: any) => {
    // Check for SQL injection
    const bodyString = JSON.stringify(req.body);
    if (SecurityUtils.detectSQLInjection(bodyString)) {
      return res.status(400).json({
        error: 'Invalid input detected',
        message: 'Request contains potentially malicious content'
      });
    }

    // Check for XSS
    if (SecurityUtils.detectXSS(bodyString)) {
      return res.status(400).json({
        error: 'Invalid input detected',
        message: 'Request contains potentially malicious content'
      });
    }

    // Sanitize inputs
    if (req.body) {
      req.body = SecurityUtils.sanitizeForLogging(req.body);
    }

    next();
  };

  // Security headers middleware
  static securityHeaders = (req: any, res: any, next: any) => {
    const headers = SecurityUtils.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    next();
  };

  // CSRF protection middleware
  static csrfProtection = (req: any, res: any, next: any) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const token = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;

    if (!token || !SecurityUtils.validateCSRFToken(token, sessionToken)) {
      return res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'Invalid or missing CSRF token'
      });
    }

    next();
  };

  // Audit logging middleware
  static auditLog = (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        statusCode: res.statusCode,
        duration: duration,
        userId: req.user?.id,
        sessionId: req.session?.id
      };

      // Log security events
      if (res.statusCode >= 400) {
        console.warn('Security Event:', SecurityUtils.sanitizeForLogging(logData));
      }

      // Log all requests in development
      if (import.meta.env.DEV) {
        console.log('Request:', SecurityUtils.sanitizeForLogging(logData));
      }
    });

    next();
  };
}

// Error handling utilities
export class SecurityErrorHandler {
  // Handle security errors
  static handleSecurityError(error: Error, req: any, res: any) {
    console.error('Security Error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Don't expose internal errors in production
    const message = import.meta.env.PROD 
      ? 'An error occurred while processing your request'
      : error.message;

    res.status(500).json({
      error: 'Internal Server Error',
      message: message
    });
  }

  // Handle validation errors
  static handleValidationError(errors: string[], res: any) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input provided',
      details: errors
    });
  }

  // Handle authentication errors
  static handleAuthError(res: any, message: string = 'Authentication required') {
    res.status(401).json({
      error: 'Authentication Error',
      message: message
    });
  }

  // Handle authorization errors
  static handleAuthorizationError(res: any, message: string = 'Insufficient permissions') {
    res.status(403).json({
      error: 'Authorization Error',
      message: message
    });
  }
}
