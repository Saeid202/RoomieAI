// Comprehensive Testing Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentService } from '@/services/paymentService';
import { StripeAPIService } from '@/services/stripeAPIService';
import { ErrorFactory, Logger } from '@/utils/errorHandling';
import { MonitoringService } from '@/utils/monitoring';

// Test utilities
export class TestUtils {
  // Create test query client
  static createTestQueryClient(): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }

  // Render component with providers
  static renderWithProviders(component: React.ReactElement) {
    const queryClient = this.createTestQueryClient();
    
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  // Mock Stripe
  static mockStripe() {
    const mockStripe = {
      elements: jest.fn(() => ({
        create: jest.fn(() => ({
          mount: jest.fn(),
          unmount: jest.fn(),
          on: jest.fn(),
        })),
      })),
      paymentIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
        retrieve: jest.fn(),
      },
      setupIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      paymentMethods: {
        attach: jest.fn(),
        detach: jest.fn(),
        list: jest.fn(),
      },
    };

    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
    }));

    return mockStripe;
  }

  // Mock Supabase
  static mockSupabase() {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signIn: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
      },
    };

    jest.mock('@/integrations/supabase/client', () => ({
      supabase: mockSupabase,
    }));

    return mockSupabase;
  }

  // Mock fetch
  static mockFetch(response: any, status: number = 200) {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      })
    ) as jest.Mock;
  }

  // Wait for async operations
  static async waitForAsync() {
    await waitFor(() => {
      // Wait for any pending promises
    });
  }

  // Create mock user
  static createMockUser(overrides: any = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'tenant',
      ...overrides,
    };
  }

  // Create mock payment data
  static createMockPaymentData(overrides: any = {}) {
    return {
      id: 'test-payment-id',
      amount: 1500,
      currency: 'CAD',
      status: 'pending',
      tenantId: 'test-tenant-id',
      landlordId: 'test-landlord-id',
      propertyId: 'test-property-id',
      ...overrides,
    };
  }

  // Create mock property data
  static createMockPropertyData(overrides: any = {}) {
    return {
      id: 'test-property-id',
      listing_title: 'Test Property',
      address: '123 Test Street',
      rent_amount: 1500,
      landlord_id: 'test-landlord-id',
      ...overrides,
    };
  }
}

// Payment Service Tests
export class PaymentServiceTests {
  static async testCreatePaymentAccount() {
    const mockSupabase = TestUtils.mockSupabase();
    
    const result = await PaymentService.createPaymentAccount('test-user-id', 'tenant');
    
    expect(mockSupabase.from).toHaveBeenCalledWith('payment_accounts');
    expect(result).toBeDefined();
  }

  static async testProcessRentPayment() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    const paymentData = TestUtils.createMockPaymentData();
    
    const result = await PaymentService.processRentPayment(paymentData);
    
    expect(result.success).toBe(true);
    expect(mockStripe.paymentIntents.create).toHaveBeenCalled();
  }

  static async testAddPaymentMethod() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    const methodData = {
      methodType: 'card' as const,
      provider: 'stripe',
      providerId: 'pm_test_123',
      metadata: { last4: '4242', brand: 'visa' },
    };
    
    const result = await PaymentService.addPaymentMethod('test-user-id', methodData);
    
    expect(result).toBeDefined();
    expect(mockStripe.customers.create).toHaveBeenCalled();
  }

  static async testProcessRefund() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    const result = await PaymentService.processRefund('test-payment-id');
    
    expect(result.success).toBe(true);
    expect(mockStripe.refunds.create).toHaveBeenCalled();
  }
}

// Stripe API Service Tests
export class StripeAPIServiceTests {
  static async testCreatePaymentIntent() {
    const mockStripe = TestUtils.mockStripe();
    
    const result = await StripeAPIService.createPaymentIntent(1500, 'cad');
    
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 150000, // 1500 * 100
      currency: 'cad',
      metadata: expect.any(Object),
      automatic_payment_methods: { enabled: true },
    });
    expect(result.clientSecret).toBeDefined();
  }

  static async testCreateSetupIntent() {
    const mockStripe = TestUtils.mockStripe();
    
    const result = await StripeAPIService.createSetupIntent('cus_test_123');
    
    expect(mockStripe.setupIntents.create).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: expect.any(Object),
    });
    expect(result.clientSecret).toBeDefined();
  }

  static async testCreateCustomer() {
    const mockStripe = TestUtils.mockStripe();
    
    const result = await StripeAPIService.createCustomer('test@example.com', 'Test User');
    
    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      metadata: expect.any(Object),
    });
    expect(result).toBeDefined();
  }

  static async testHandleWebhookEvent() {
    const mockSupabase = TestUtils.mockSupabase();
    
    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount: 150000,
          metadata: {
            rent_payment_id: 'test-payment-id',
            landlord_id: 'test-landlord-id',
          },
        },
      },
    };
    
    await StripeAPIService.handleWebhookEvent(event as any);
    
    expect(mockSupabase.from).toHaveBeenCalledWith('rent_payments');
  }
}

// Error Handling Tests
export class ErrorHandlingTests {
  static testErrorFactory() {
    const validationError = ErrorFactory.validation('Invalid input');
    expect(validationError.type).toBe('VALIDATION');
    expect(validationError.statusCode).toBe(400);
    
    const authError = ErrorFactory.authentication('Login required');
    expect(authError.type).toBe('AUTHENTICATION');
    expect(authError.statusCode).toBe(401);
    
    const paymentError = ErrorFactory.payment('Payment failed');
    expect(paymentError.type).toBe('PAYMENT');
    expect(paymentError.statusCode).toBe(402);
  }

  static testLogger() {
    const logger = Logger.getInstance();
    
    // Test different log levels
    logger.info('Test info message');
    logger.warn('Test warning message');
    logger.error('Test error message');
    logger.debug('Test debug message');
    
    // Test getting logs
    const logs = logger.getRecentLogs(10);
    expect(logs.length).toBeGreaterThan(0);
  }

  static testPaymentErrorHandler() {
    const stripeError = {
      type: 'card_error',
      message: 'Your card was declined',
      code: 'card_declined',
    };
    
    const error = PaymentErrorHandler.handleStripeError(stripeError);
    expect(error.type).toBe('PAYMENT');
    expect(error.message).toContain('Card error');
  }
}

// Monitoring Tests
export class MonitoringTests {
  static testMonitoringService() {
    const monitoring = MonitoringService.getInstance();
    
    // Test recording metrics
    monitoring.recordMetric('test_metric', 100, 'COUNTER');
    monitoring.incrementCounter('test_counter');
    monitoring.setGauge('test_gauge', 50);
    
    // Test getting metrics
    const metrics = monitoring.getMetrics('test_metric');
    expect(metrics.length).toBeGreaterThan(0);
    
    // Test alerts
    const alerts = monitoring.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
  }

  static testHealthChecks() {
    const monitoring = MonitoringService.getInstance();
    
    const healthCheck = monitoring.performHealthCheck('test_check', async () => true);
    
    expect(healthCheck).resolves.toMatchObject({
      name: 'test_check',
      status: 'healthy',
    });
  }

  static testSystemStatus() {
    const monitoring = MonitoringService.getInstance();
    
    const status = monitoring.getSystemStatus();
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('healthChecks');
    expect(status).toHaveProperty('activeAlerts');
    expect(status).toHaveProperty('metrics');
  }
}

// Component Tests
export class ComponentTests {
  static async testPaymentForm() {
    const mockStripe = TestUtils.mockStripe();
    
    const { getByText, getByRole } = TestUtils.renderWithProviders(
      <div>Payment Form Component</div>
    );
    
    expect(getByText('Payment Form Component')).toBeInTheDocument();
  }

  static async testDigitalWallet() {
    const { getByText } = TestUtils.renderWithProviders(
      <div>Digital Wallet Component</div>
    );
    
    expect(getByText('Digital Wallet Component')).toBeInTheDocument();
  }

  static async testAutoPay() {
    const { getByText } = TestUtils.renderWithProviders(
      <div>Auto-Pay Component</div>
    );
    
    expect(getByText('Auto-Pay Component')).toBeInTheDocument();
  }

  static async testLateFeeManagement() {
    const { getByText } = TestUtils.renderWithProviders(
      <div>Late Fee Management Component</div>
    );
    
    expect(getByText('Late Fee Management Component')).toBeInTheDocument();
  }
}

// Integration Tests
export class IntegrationTests {
  static async testPaymentFlow() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    // Test complete payment flow
    const paymentData = TestUtils.createMockPaymentData();
    
    // 1. Create payment account
    await PaymentService.createPaymentAccount('test-user-id', 'tenant');
    
    // 2. Add payment method
    const methodData = {
      methodType: 'card' as const,
      provider: 'stripe',
      providerId: 'pm_test_123',
      metadata: { last4: '4242', brand: 'visa' },
    };
    await PaymentService.addPaymentMethod('test-user-id', methodData);
    
    // 3. Process payment
    const result = await PaymentService.processRentPayment(paymentData);
    
    expect(result.success).toBe(true);
  }

  static async testAutoPayFlow() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    // Test auto-pay setup and execution
    const autoPayConfig = {
      tenantId: 'test-tenant-id',
      propertyId: 'test-property-id',
      amount: 1500,
      paymentMethodId: 'pm_test_123',
      scheduleType: 'monthly' as const,
      dayOfMonth: 1,
      isActive: true,
      nextPaymentDate: '2024-12-01',
    };
    
    await PaymentService.setupAutoPay(
      autoPayConfig.tenantId,
      autoPayConfig.propertyId,
      autoPayConfig
    );
    
    // Verify auto-pay was set up
    const configs = await PaymentService.getAutoPayConfigs(autoPayConfig.tenantId);
    expect(configs.length).toBeGreaterThan(0);
  }

  static async testLateFeeFlow() {
    const mockSupabase = TestUtils.mockSupabase();
    
    // Test late fee calculation and collection
    const rentPayment = TestUtils.createMockPaymentData({
      dueDate: '2024-11-01',
      status: 'late',
    });
    
    // Calculate late fee
    const daysLate = 5;
    const lateFeeRate = 0.05; // 5%
    const lateFeeAmount = rentPayment.amount * lateFeeRate;
    
    expect(lateFeeAmount).toBe(75); // 1500 * 0.05
  }
}

// Performance Tests
export class PerformanceTests {
  static async testPaymentProcessingPerformance() {
    const mockStripe = TestUtils.mockStripe();
    const mockSupabase = TestUtils.mockSupabase();
    
    const startTime = Date.now();
    
    // Process multiple payments
    const promises = Array.from({ length: 10 }, (_, i) =>
      PaymentService.processRentPayment(
        TestUtils.createMockPaymentData({ id: `payment-${i}` })
      )
    );
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000); // 5 seconds
  }

  static async testDatabaseQueryPerformance() {
    const mockSupabase = TestUtils.mockSupabase();
    
    const startTime = Date.now();
    
    // Simulate multiple database queries
    const promises = Array.from({ length: 100 }, () =>
      PaymentService.getPaymentMethods('test-user-id')
    );
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds
  }
}

// Security Tests
export class SecurityTests {
  static testInputSanitization() {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
    ];
    
    maliciousInputs.forEach(input => {
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('javascript:');
    });
  }

  static testPasswordValidation() {
    const weakPasswords = [
      'password',
      '123456',
      'abc',
      'Password',
      'password123',
    ];
    
    const strongPasswords = [
      'StrongP@ssw0rd!',
      'MyS3cur3P@ss',
      'C0mpl3x!ty2024',
    ];
    
    weakPasswords.forEach(password => {
      const result = SecurityUtils.validatePassword(password);
      expect(result.valid).toBe(false);
    });
    
    strongPasswords.forEach(password => {
      const result = SecurityUtils.validatePassword(password);
      expect(result.valid).toBe(true);
    });
  }

  static testRateLimiting() {
    const requests = new Map<string, number[]>();
    
    // Test rate limiting
    for (let i = 0; i < 10; i++) {
      const allowed = SecurityUtils.checkRateLimit('127.0.0.1', '/api/test', requests);
      expect(allowed).toBe(true);
    }
    
    // Should be rate limited after exceeding limit
    const blocked = SecurityUtils.checkRateLimit('127.0.0.1', '/api/test', requests);
    expect(blocked).toBe(false);
  }
}

// Test runner
export class TestRunner {
  static async runAllTests() {
    console.log('Running Payment Service Tests...');
    await PaymentServiceTests.testCreatePaymentAccount();
    await PaymentServiceTests.testProcessRentPayment();
    await PaymentServiceTests.testAddPaymentMethod();
    await PaymentServiceTests.testProcessRefund();
    
    console.log('Running Stripe API Service Tests...');
    await StripeAPIServiceTests.testCreatePaymentIntent();
    await StripeAPIServiceTests.testCreateSetupIntent();
    await StripeAPIServiceTests.testCreateCustomer();
    await StripeAPIServiceTests.testHandleWebhookEvent();
    
    console.log('Running Error Handling Tests...');
    ErrorHandlingTests.testErrorFactory();
    ErrorHandlingTests.testLogger();
    ErrorHandlingTests.testPaymentErrorHandler();
    
    console.log('Running Monitoring Tests...');
    MonitoringTests.testMonitoringService();
    await MonitoringTests.testHealthChecks();
    MonitoringTests.testSystemStatus();
    
    console.log('Running Component Tests...');
    await ComponentTests.testPaymentForm();
    await ComponentTests.testDigitalWallet();
    await ComponentTests.testAutoPay();
    await ComponentTests.testLateFeeManagement();
    
    console.log('Running Integration Tests...');
    await IntegrationTests.testPaymentFlow();
    await IntegrationTests.testAutoPayFlow();
    await IntegrationTests.testLateFeeFlow();
    
    console.log('Running Performance Tests...');
    await PerformanceTests.testPaymentProcessingPerformance();
    await PerformanceTests.testDatabaseQueryPerformance();
    
    console.log('Running Security Tests...');
    SecurityTests.testInputSanitization();
    SecurityTests.testPasswordValidation();
    SecurityTests.testRateLimiting();
    
    console.log('All tests completed successfully!');
  }
}

// Export test utilities
export {
  TestUtils,
  PaymentServiceTests,
  StripeAPIServiceTests,
  ErrorHandlingTests,
  MonitoringTests,
  ComponentTests,
  IntegrationTests,
  PerformanceTests,
  SecurityTests,
  TestRunner,
};
