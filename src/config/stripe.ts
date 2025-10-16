// Stripe Configuration
export const STRIPE_CONFIG = {
  // Public keys (safe to expose in frontend)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SIhcgRkKDAtZpXYuvEaO11Bc76Ex8BV9Ni1FhRpv0GbBUgmvlGzFpYIRi81o5LTtG0DQekEUPc3rtLKADsj0JtZ00fzetcQZD',
  
  // API endpoints
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Webhook endpoints
  webhookEndpoint: '/api/webhooks/stripe',
  
  // Currency settings
  defaultCurrency: 'cad',
  supportedCurrencies: ['cad', 'usd'],
  
  // Fee configuration
  platformFeeRate: 0.025, // 2.5%
  lateFeeRate: 0.05, // 5%
  
  // Payment method types
  supportedPaymentMethods: ['card', 'bank_account'],
  
  // Stripe Connect settings
  connectClientId: import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || '',
  
  // Test mode
  isTestMode: import.meta.env.DEV || import.meta.env.VITE_STRIPE_TEST_MODE === 'true',
};

// Stripe Elements configuration
export const STRIPE_ELEMENTS_CONFIG = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e1e5e9',
        borderRadius: '4px',
        padding: '12px',
      },
      '.Input:focus': {
        border: '1px solid #0570de',
        boxShadow: '0 0 0 1px #0570de',
      },
      '.Label': {
        fontWeight: '500',
        marginBottom: '4px',
      },
    },
  },
  loader: 'auto',
};

// Error messages
export const STRIPE_ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Your card\'s security code is incorrect. Please try again.',
  insufficient_funds: 'Your card has insufficient funds. Please try a different payment method.',
  invalid_expiry_month: 'Your card\'s expiration month is invalid.',
  invalid_expiry_year: 'Your card\'s expiration year is invalid.',
  invalid_number: 'Your card number is invalid.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  generic_error: 'Something went wrong. Please try again.',
};

// Payment status mapping
export const PAYMENT_STATUS_MAP = {
  'payment_intent.succeeded': 'paid',
  'payment_intent.payment_failed': 'failed',
  'payment_intent.canceled': 'cancelled',
  'payment_intent.requires_action': 'pending',
  'payment_intent.requires_confirmation': 'pending',
  'payment_intent.requires_payment_method': 'pending',
  'payment_intent.processing': 'pending',
};

// Webhook event types to handle
export const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment_intent.requires_action',
  'payment_method.attached',
  'payment_method.detached',
  'customer.created',
  'customer.updated',
  'account.updated',
  'transfer.created',
  'transfer.failed',
  'charge.dispute.created',
  'charge.dispute.updated',
];

// Validation rules
export const VALIDATION_RULES = {
  minRentAmount: 100, // Minimum $100 rent
  maxRentAmount: 50000, // Maximum $50,000 rent
  maxLateFeeDays: 30, // Maximum 30 days for late fees
  autoPayMinDays: 3, // Minimum 3 days notice for auto-pay
  autoPayMaxDays: 31, // Maximum 31 days for auto-pay scheduling
};

// API endpoints
export const API_ENDPOINTS = {
  createPaymentIntent: '/api/payments/create-intent',
  confirmPaymentIntent: '/api/payments/confirm-intent',
  createSetupIntent: '/api/payments/create-setup-intent',
  attachPaymentMethod: '/api/payments/attach-method',
  detachPaymentMethod: '/api/payments/detach-method',
  createCustomer: '/api/payments/create-customer',
  updateCustomer: '/api/payments/update-customer',
  createConnectedAccount: '/api/payments/create-connected-account',
  createAccountLink: '/api/payments/create-account-link',
  createTransfer: '/api/payments/create-transfer',
  createRefund: '/api/payments/create-refund',
  getPaymentMethods: '/api/payments/methods',
  getPaymentHistory: '/api/payments/history',
  getRentCollection: '/api/payments/rent-collection',
  processRentPayment: '/api/payments/process-rent',
  setupAutoPay: '/api/payments/setup-autopay',
  cancelAutoPay: '/api/payments/cancel-autopay',
};
