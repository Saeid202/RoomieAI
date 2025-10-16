// Payment System Type Definitions
export interface PaymentAccount {
  id: string;
  userId: string;
  accountType: 'tenant' | 'landlord';
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'closed';
  stripeAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  methodType: 'card' | 'bank_account' | 'wallet';
  provider: string;
  providerId: string;
  isDefault: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface RentPayment {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'late' | 'failed' | 'refunded';
  paymentMethodId?: string;
  transactionId?: string;
  lateFee: number;
  platformFee: number;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  transactionType: 'payment' | 'refund' | 'fee' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  providerTransactionId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AutoPayConfig {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  paymentMethodId: string;
  scheduleType: 'monthly' | 'biweekly' | 'weekly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  nextPaymentDate: string;
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  message: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  message: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  error?: string;
  message: string;
}

export interface RentCollection {
  id: string;
  landlordId: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'late' | 'failed';
  lateFee: number;
  platformFee: number;
  netAmount: number;
}

export interface PaymentAnalytics {
  totalPayments: number;
  totalAmount: number;
  averageAmount: number;
  successRate: number;
  latePayments: number;
  failedPayments: number;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  platformFees: number;
  lateFees: number;
  properties: Array<{
    propertyId: string;
    propertyName: string;
    income: number;
    expenses: number;
    netIncome: number;
  }>;
}

export interface PaymentMethodData {
  methodType: 'card' | 'bank_account';
  provider: string;
  providerId: string;
  metadata?: Record<string, any>;
}

export interface RentPaymentData {
  propertyId: string;
  tenantId: string;
  landlordId: string;
  amount: number;
  dueDate: string;
  paymentMethodId: string;
  currency?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface PaymentDashboardData {
  upcomingPayments: RentPayment[];
  recentPayments: RentPayment[];
  paymentMethods: PaymentMethod[];
  autoPayConfigs: AutoPayConfig[];
  analytics: PaymentAnalytics;
}

export interface RentCollectionDashboardData {
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
  recentCollections: RentCollection[];
  tenantPayments: Array<{
    tenantId: string;
    tenantName: string;
    propertyId: string;
    propertyName: string;
    lastPayment: RentPayment;
    nextDueDate: string;
    status: 'current' | 'late' | 'overdue';
  }>;
  analytics: PaymentAnalytics;
}
