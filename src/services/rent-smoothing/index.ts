// Rent Smoothing Services Index
// Export all rent smoothing related services and utilities

export { WalletService } from './WalletService';
export { WalletTransferService } from './WalletTransferService';
export { LedgerService } from './LedgerService';
export { AllocationEngine } from './AllocationEngine';
export { RentSmoothingService } from './RentSmoothingService';
export { PaycheckService } from './PaycheckService';
export { ShortfallService } from './ShortfallService';
export { RentDisbursementService } from './RentDisbursementService';
export { ForwardingService } from './ForwardingService';
export { AutomationService } from './AutomationService';

// Re-export types for convenience
export type {
  WalletAccount,
  WalletTransaction,
  RentSmoothingProfile,
  PaycheckEvent,
  AllocationResult,
  RentSmoothingPayment,
  ShortfallEvent,
  ForwardingEvent,
  CreateProfileRequest,
  SimulateDepositRequest,
  WalletBalances,
  RentSmoothingStatus,
  DashboardData,
  BankingProvider,
  MockBankAccount,
  MockTransaction,
  CentsAmount,
  DollarsAmount,
  RentSmoothingConfig,
  RentSmoothingError,
  InsufficientFundsError,
  ValidationError
} from '@/types/rent-smoothing';

// Export utility functions
export {
  centsToDollars,
  dollarsToCents,
  formatCentsAsCurrency,
  DEFAULT_CONFIG
} from '@/types/rent-smoothing';
