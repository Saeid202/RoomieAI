// Rent Smoothing System TypeScript Types
// All monetary values are in cents (integer)

export interface WalletAccount {
  id: string;
  user_id: string;
  account_type: 'main' | 'rent_lock' | 'forwarding';
  balance: number; // in cents
  currency: string;
  is_locked: boolean;
  parent_account_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number; // in cents
  transaction_type: 'deposit' | 'allocation' | 'rent_payment' | 'shortfall' | 'forwarding';
  description?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RentSmoothingProfile {
  id: string;
  user_id: string;
  rent_amount: number; // in cents
  pay_frequency: 'weekly' | 'biweekly' | 'monthly';
  average_paycheck_amount?: number; // in cents
  next_pay_date?: string;
  rent_due_day: number; // 1-31
  landlord_id?: string;
  property_id?: string;
  is_active: boolean;
  onboarding_completed: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaycheckEvent {
  id: string;
  user_id: string;
  amount: number; // in cents
  deposit_date: string;
  processed_at?: string;
  status: 'pending' | 'processed' | 'failed';
  allocation_result?: AllocationResult;
  external_reference?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AllocationResult {
  rent_allocated: number; // in cents
  forwarding_allocated: number; // in cents
  shortfall_created: number; // in cents
  rent_account_id: string;
  forwarding_account_id: string;
}

export interface RentSmoothingPayment {
  id: string;
  user_id: string;
  profile_id: string;
  amount: number; // in cents
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'failed' | 'shortfall_covered';
  payment_method_id?: string;
  transaction_id?: string;
  late_fee: number; // in cents
  platform_fee: number; // in cents
  shortfall_amount: number; // in cents
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShortfallEvent {
  id: string;
  user_id: string;
  profile_id: string;
  rent_payment_id?: string;
  shortfall_amount: number; // in cents
  created_at: string;
  repaid_at?: string;
  repaid_amount: number; // in cents
  status: 'active' | 'partial_repaid' | 'fully_repaid';
  repayment_transactions?: string[]; // array of transaction IDs
  metadata?: Record<string, any>;
}

export interface ForwardingEvent {
  id: string;
  user_id: string;
  paycheck_event_id: string;
  amount: number; // in cents
  forwarded_at?: string;
  status: 'pending' | 'sent' | 'failed';
  external_account_last4?: string;
  transaction_reference?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// API Request/Response Types
export interface CreateProfileRequest {
  rent_amount: number; // in cents
  pay_frequency: 'weekly' | 'biweekly' | 'monthly';
  average_paycheck_amount?: number; // in cents
  rent_due_day: number; // 1-31
  landlord_id?: string;
  property_id?: string;
}

export interface SimulateDepositRequest {
  amount: number; // in cents
  deposit_date?: string; // defaults to now
  external_reference?: string;
}

export interface WalletBalances {
  main_balance: number; // in cents
  rent_lock_balance: number; // in cents
  forwarding_balance: number; // in cents
  total_balance: number; // in cents
}

export interface RentSmoothingStatus {
  profile: RentSmoothingProfile | null;
  wallet_balances: WalletBalances;
  last_paycheck?: PaycheckEvent;
  next_rent_payment?: RentSmoothingPayment;
  active_shortfall?: ShortfallEvent;
  pending_forwarding?: ForwardingEvent;
  is_active: boolean;
  status: 'inactive' | 'active' | 'shortfall' | 'processing';
}

export interface DashboardData {
  status: RentSmoothingStatus;
  recent_transactions: WalletTransaction[];
  upcoming_payments: RentSmoothingPayment[];
  total_saved: number; // in cents
  next_paycheck_date?: string;
}

// Banking Provider Interface
export interface BankingProvider {
  createAccount(userId: string): Promise<string>;
  getAccountDetails(accountId: string): Promise<any>;
  sendPayment(fromAccountId: string, toAccountId: string, amount: number): Promise<string>;
  onDeposit(callback: (userId: string, amount: number, reference: string) => void): void;
}

// Mock Banking Types
export interface MockBankAccount {
  id: string;
  user_id: string;
  account_number: string;
  routing_number: string;
  balance: number; // in cents
  type: 'checking' | 'savings';
  created_at: string;
}

export interface MockTransaction {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number; // in cents
  type: 'deposit' | 'withdrawal' | 'transfer';
  reference: string;
  created_at: string;
}

// Error Types
export class RentSmoothingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'RentSmoothingError';
  }
}

export class InsufficientFundsError extends RentSmoothingError {
  constructor(available: number, required: number) {
    super(
      `Insufficient funds: available ${available}, required ${required}`,
      'INSUFFICIENT_FUNDS',
      { available, required }
    );
    this.name = 'InsufficientFundsError';
  }
}

export class ValidationError extends RentSmoothingError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      { field }
    );
    this.name = 'ValidationError';
  }
}

// Utility Types
export type CentsAmount = number; // Always represents amount in cents
export type DollarsAmount = number; // Represents amount in dollars (for display)

export function centsToDollars(cents: CentsAmount): DollarsAmount {
  return cents / 100;
}

export function dollarsToCents(dollars: DollarsAmount): CentsAmount {
  return Math.round(dollars * 100);
}

export function formatCentsAsCurrency(cents: CentsAmount): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(centsToDollars(cents));
}

// Configuration Types
export interface RentSmoothingConfig {
  platform_fee_rate: number; // e.g., 0.025 for 2.5%
  min_paycheck_amount: number; // in cents
  max_shortfall_amount: number; // in cents
  processing_delay_hours: number;
}

export const DEFAULT_CONFIG: RentSmoothingConfig = {
  platform_fee_rate: 0.025,
  min_paycheck_amount: 10000, // $100 in cents
  max_shortfall_amount: 500000, // $5000 in cents
  processing_delay_hours: 24
};
