/**
 * Payment Type Definitions
 * Phase 1: TypeScript types for PAD payment system
 */

// =====================================================
// PAYMENT METHOD TYPES
// =====================================================

/**
 * Payment method type enum
 */
export type PaymentMethodType = 'card' | 'acss_debit' | 'bank_account';

/**
 * Card type enum
 */
export type CardType = 'credit' | 'debit';

/**
 * Payment method interface
 */
export interface PaymentMethod {
  id: string;
  user_id: string;
  payment_type: PaymentMethodType;
  stripe_payment_method_id: string;
  card_type?: CardType;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  bank_name?: string;
  transit_number?: string;
  institution_number?: string;
  mandate_id?: string;
  mandate_status?: MandateStatus;
  mandate_accepted_at?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// MANDATE TYPES
// =====================================================

/**
 * Mandate status enum
 */
export type MandateStatus = 'active' | 'inactive' | 'pending' | 'revoked';

/**
 * Mandate details interface
 */
export interface MandateDetails {
  id: string;
  status: MandateStatus;
  payment_method: string;
  customer: string;
  accepted_at: string;
  type: 'single_use' | 'multi_use';
  payment_schedule?: 'interval' | 'sporadic' | 'combined';
}

// =====================================================
// PAYMENT INTENT TYPES
// =====================================================

/**
 * PAD Payment Intent interface (for Stripe API)
 */
export interface PadPaymentIntent {
  amount: number;
  currency: string;
  payment_method_types: ['acss_debit'];
  payment_method: string;
  customer: string;
  payment_method_options: {
    acss_debit: {
      mandate_options: {
        payment_schedule: 'interval' | 'sporadic' | 'combined';
        interval_description?: string;
        transaction_type: 'personal' | 'business';
      };
      verification_method: 'instant' | 'microdeposits';
    };
  };
  transfer_data?: {
    destination: string;
    amount?: number;
  };
  metadata: Record<string, string>;
}

/**
 * Card Payment Intent interface (for Stripe API)
 */
export interface CardPaymentIntent {
  amount: number;
  currency: string;
  payment_method_types: ['card'];
  payment_method: string;
  customer: string;
  transfer_data?: {
    destination: string;
    amount?: number;
  };
  metadata: Record<string, string>;
}

// =====================================================
// PAYMENT STATUS TYPES
// =====================================================

/**
 * Payment status enum
 */
export type PaymentStatus =
  | 'pending'      // Initial state
  | 'initiated'    // Payment initiated
  | 'processing'   // Payment processing (Card instant, PAD 1-2 days)
  | 'clearing'     // PAD clearing (days 2-4)
  | 'succeeded'    // Payment successful and cleared
  | 'paid'         // Legacy status (backward compatibility)
  | 'late'         // Payment overdue
  | 'failed'       // Payment failed
  | 'refunded';    // Payment refunded

/**
 * Payment failure code enum
 */
export type PaymentFailureCode =
  | 'insufficient_funds'
  | 'card_declined'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'processing_error'
  | 'mandate_revoked'
  | 'account_closed'
  | 'invalid_account'
  | 'generic_decline';

// =====================================================
// RENT PAYMENT TYPES
// =====================================================

/**
 * Rent payment interface
 */
export interface RentPayment {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  payment_method_id?: string;
  payment_method_type?: PaymentMethodType;
  transaction_id?: string;
  transaction_fee?: number;
  processing_days?: number;
  payment_cleared_at?: string;
  expected_clear_date?: string;
  stripe_payment_intent_id?: string;
  stripe_mandate_id?: string;
  late_fee?: number;
  platform_fee?: number;
  failure_reason?: string;
  failure_code?: PaymentFailureCode;
  retry_count?: number;
  last_retry_at?: string;
  tenant_notified_at?: string;
  landlord_notified_at?: string;
  payment_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// FEE CALCULATION TYPES
// =====================================================

/**
 * Payment fee interface
 */
export interface PaymentFee {
  fee: number;
  total: number;
  percentage: string;
  fixed: string;
  processingTime: string;
  savings?: number;
}

/**
 * Fee comparison interface
 */
export interface FeeComparison {
  card: PaymentFee;
  pad: PaymentFee;
  savings: number;
  savingsPercentage: string;
}

// =====================================================
// PAYMENT EXECUTION TYPES
// =====================================================

/**
 * Payment execution request
 */
export interface PaymentExecutionRequest {
  rent_ledger_id: string;
  payment_method_id: string;
  payment_method_type: PaymentMethodType;
  amount: number;
  compliance_confirmation: boolean;
}

/**
 * Payment execution response
 */
export interface PaymentExecutionResponse {
  success: boolean;
  client_secret?: string;
  payment_intent_id?: string;
  expected_clear_date?: string;
  error?: string;
}

// =====================================================
// BANK CONNECTION TYPES
// =====================================================

/**
 * Bank details interface (for bank selection UI)
 */
export interface BankDetails {
  id: string;
  name: string;
  logo: string;
  color: string;
  fullName: string;
}

/**
 * Bank account details interface (for PAD payment method creation)
 */
export interface BankAccountDetails {
  accountHolderName: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  bankName?: string;
}

/**
 * Financial Connections session
 */
export interface FinancialConnectionsSession {
  id: string;
  client_secret: string;
  accounts?: FinancialConnectionsAccount[];
}

/**
 * Financial Connections account
 */
export interface FinancialConnectionsAccount {
  id: string;
  institution_name: string;
  last4: string;
  account_holder_name?: string;
  account_holder_type?: 'individual' | 'company';
  balance?: {
    current: number;
    available: number;
  };
}

// =====================================================
// WEBHOOK EVENT TYPES
// =====================================================

/**
 * Webhook event type enum
 */
export type WebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.processing'
  | 'mandate.updated'
  | 'mandate.revoked';

/**
 * Webhook event interface
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: {
    object: any;
  };
  created: number;
}

// =====================================================
// PAYOUT TYPES
// =====================================================

/**
 * Payout timeline stage
 */
export type PayoutStage =
  | 'payment_initiated'
  | 'payment_processing'
  | 'payment_clearing'
  | 'transfer_to_landlord'
  | 'payout_to_bank';

/**
 * Payout timeline interface
 */
export interface PayoutTimeline {
  stage: PayoutStage;
  date: Date;
  completed: boolean;
  estimatedDays: number;
}

// =====================================================
// VALIDATION TYPES
// =====================================================

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  PaymentMethodType,
  CardType,
  PaymentMethod,
  MandateStatus,
  MandateDetails,
  PadPaymentIntent,
  CardPaymentIntent,
  PaymentStatus,
  PaymentFailureCode,
  RentPayment,
  PaymentFee,
  FeeComparison,
  PaymentExecutionRequest,
  PaymentExecutionResponse,
  BankDetails,
  BankAccountDetails,
  FinancialConnectionsSession,
  FinancialConnectionsAccount,
  WebhookEventType,
  WebhookEvent,
  PayoutStage,
  PayoutTimeline,
  ValidationResult
};

// =====================================================
// LANDLORD PAYOUT TYPES
// =====================================================

/**
 * Landlord payout method type
 */
export type LandlordPayoutMethodType = 'bank_account' | 'debit_card';

/**
 * Payout method status
 */
export type PayoutMethodStatus = 'pending' | 'verifying' | 'verified' | 'failed';

/**
 * Payout schedule type
 */
export type PayoutSchedule = 'standard' | 'instant';

/**
 * Bank account type
 */
export type BankAccountType = 'checking' | 'savings';

/**
 * Landlord bank account details (for payout setup)
 */
export interface LandlordBankAccountDetails {
  accountHolderName: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  accountType: BankAccountType;
  bankName?: string;
}

/**
 * Landlord debit card details (for instant payout setup)
 */
export interface LandlordDebitCardDetails {
  cardholderName: string;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

/**
 * Landlord payout method interface
 */
export interface LandlordPayoutMethod {
  id: string;
  user_id: string;
  payout_method_type: LandlordPayoutMethodType;
  payout_method_status: PayoutMethodStatus;
  payout_schedule: PayoutSchedule;
  
  // Bank account fields
  bank_account_last4?: string;
  bank_name?: string;
  bank_routing_number?: string;
  bank_account_type?: BankAccountType;
  
  // Debit card fields
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  
  // Stripe fields
  stripe_account_id: string;
  stripe_external_account_id?: string;
  
  // Verification
  verification_attempts: number;
  verified_at?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * Payout method comparison for UI
 */
export interface PayoutMethodComparison {
  type: LandlordPayoutMethodType;
  name: string;
  speed: string;
  fee: string;
  verificationTime: string;
  bestFor: string;
  icon: string;
}

/**
 * Payout setup request
 */
export interface PayoutSetupRequest {
  methodType: LandlordPayoutMethodType;
  bankAccount?: LandlordBankAccountDetails;
  debitCard?: LandlordDebitCardDetails;
}

/**
 * Payout setup response
 */
export interface PayoutSetupResponse {
  success: boolean;
  accountId: string;
  externalAccountId: string;
  status: PayoutMethodStatus;
  requiresVerification: boolean;
  error?: string;
}

/**
 * Bank verification request (for micro-deposits)
 */
export interface BankVerificationRequest {
  accountId: string;
  amount1: number; // First micro-deposit amount in cents
  amount2: number; // Second micro-deposit amount in cents
}

/**
 * Bank verification response
 */
export interface BankVerificationResponse {
  success: boolean;
  verified: boolean;
  attemptsRemaining: number;
  error?: string;
}
