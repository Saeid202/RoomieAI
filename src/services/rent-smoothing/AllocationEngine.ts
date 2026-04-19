import { WalletService } from './WalletService';
import { LedgerService } from './LedgerService';
import { 
  RentSmoothingProfile, 
  PaycheckEvent, 
  AllocationResult, 
  CentsAmount, 
  RentSmoothingError,
  ValidationError 
} from '@/types/rent-smoothing';

export class AllocationEngine {
  /**
   * Process a paycheck and allocate funds according to rent smoothing rules
   */
  static async processPaycheck(
    userId: string,
    paycheckAmount: CentsAmount,
    profile: RentSmoothingProfile,
    externalReference?: string
  ): Promise<{
    allocationResult: AllocationResult;
    transactionIds: string[];
  }> {
    try {
      // Validate inputs
      this.validatePaycheck(paycheckAmount, profile);

      // Get user's wallet accounts
      const mainWallet = await WalletService.getWalletByType(userId, 'main');
      const rentWallet = await WalletService.getWalletByType(userId, 'rent_lock');
      const forwardingWallet = await WalletService.getWalletByType(userId, 'forwarding');

      if (!mainWallet || !rentWallet || !forwardingWallet) {
        throw new RentSmoothingError(
          'User wallet accounts not found',
          'WALLETS_NOT_FOUND',
          { userId }
        );
      }

      const transactionIds: string[] = [];
      let allocationResult: AllocationResult;

      // Determine allocation strategy
      if (paycheckAmount >= profile.rent_amount) {
        allocationResult = await this.handleSufficientFunds(
          userId,
          paycheckAmount,
          profile.rent_amount,
          mainWallet.id,
          rentWallet.id,
          forwardingWallet.id,
          transactionIds
        );
      } else {
        allocationResult = await this.handleInsufficientFunds(
          userId,
          paycheckAmount,
          profile.rent_amount,
          mainWallet.id,
          rentWallet.id,
          forwardingWallet.id,
          transactionIds
        );
      }

      return { allocationResult, transactionIds };
    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to process paycheck allocation',
        'ALLOCATION_FAILED',
        { userId, paycheckAmount, profileId: profile.id, error }
      );
    }
  }

  /**
   * Handle case where paycheck covers full rent
   */
  private static async handleSufficientFunds(
    userId: string,
    paycheckAmount: CentsAmount,
    rentAmount: CentsAmount,
    mainAccountId: string,
    rentAccountId: string,
    forwardingAccountId: string,
    transactionIds: string[]
  ): Promise<AllocationResult> {
    const forwardingAmount = paycheckAmount - rentAmount;

    // First, deposit the paycheck to main account
    const depositTxId = await LedgerService.recordTransaction(
      userId,
      'system', // System account as source
      mainAccountId,
      paycheckAmount,
      'deposit',
      `Paycheck deposit: $${(paycheckAmount / 100).toFixed(2)}`
    );
    transactionIds.push(depositTxId);

    // Allocate rent to locked account
    const rentTxId = await LedgerService.recordTransaction(
      userId,
      mainAccountId,
      rentAccountId,
      rentAmount,
      'allocation',
      `Rent allocation: $${(rentAmount / 100).toFixed(2)}`
    );
    transactionIds.push(rentTxId);

    // Forward remainder to forwarding account
    if (forwardingAmount > 0) {
      const forwardingTxId = await LedgerService.recordTransaction(
        userId,
        mainAccountId,
        forwardingAccountId,
        forwardingAmount,
        'forwarding',
        `Forwarding remainder: $${(forwardingAmount / 100).toFixed(2)}`
      );
      transactionIds.push(forwardingTxId);
    }

    return {
      rent_allocated: rentAmount,
      forwarding_allocated: forwardingAmount,
      shortfall_created: 0,
      rent_account_id: rentAccountId,
      forwarding_account_id: forwardingAccountId
    };
  }

  /**
   * Handle case where paycheck doesn't cover full rent
   */
  private static async handleInsufficientFunds(
    userId: string,
    paycheckAmount: CentsAmount,
    rentAmount: CentsAmount,
    mainAccountId: string,
    rentAccountId: string,
    forwardingAccountId: string,
    transactionIds: string[]
  ): Promise<AllocationResult> {
    const shortfallAmount = rentAmount - paycheckAmount;

    // First, deposit the paycheck to main account
    const depositTxId = await LedgerService.recordTransaction(
      userId,
      'system', // System account as source
      mainAccountId,
      paycheckAmount,
      'deposit',
      `Paycheck deposit: $${(paycheckAmount / 100).toFixed(2)}`
    );
    transactionIds.push(depositTxId);

    // Allocate entire paycheck to rent account
    const rentTxId = await LedgerService.recordTransaction(
      userId,
      mainAccountId,
      rentAccountId,
      paycheckAmount,
      'allocation',
      `Partial rent allocation: $${(paycheckAmount / 100).toFixed(2)}`
    );
    transactionIds.push(rentTxId);

    // Create shortfall record (this would trigger the shortfall engine)
    const shortfallTxId = await LedgerService.recordTransaction(
      userId,
      'system', // System covers shortfall
      rentAccountId,
      shortfallAmount,
      'shortfall',
      `Shortfall coverage: $${(shortfallAmount / 100).toFixed(2)}`
    );
    transactionIds.push(shortfallTxId);

    return {
      rent_allocated: paycheckAmount,
      forwarding_allocated: 0,
      shortfall_created: shortfallAmount,
      rent_account_id: rentAccountId,
      forwarding_account_id: forwardingAccountId
    };
  }

  /**
   * Validate paycheck before processing
   */
  private static validatePaycheck(
    amount: CentsAmount,
    profile: RentSmoothingProfile
  ): void {
    if (amount <= 0) {
      throw new ValidationError(
        'Paycheck amount must be positive',
        'paycheck_amount'
      );
    }

    if (!profile.is_active) {
      throw new ValidationError(
        'Rent smoothing profile is not active',
        'profile_status'
      );
    }

    if (amount < 10000) { // $100 minimum
      throw new ValidationError(
        'Paycheck amount is below minimum threshold',
        'paycheck_amount'
      );
    }
  }

  /**
   * Calculate projected allocation for a given paycheck amount
   */
  static calculateProjectedAllocation(
    paycheckAmount: CentsAmount,
    rentAmount: CentsAmount
  ): AllocationResult {
    if (paycheckAmount >= rentAmount) {
      return {
        rent_allocated: rentAmount,
        forwarding_allocated: paycheckAmount - rentAmount,
        shortfall_created: 0,
        rent_account_id: '',
        forwarding_account_id: ''
      };
    } else {
      return {
        rent_allocated: paycheckAmount,
        forwarding_allocated: 0,
        shortfall_created: rentAmount - paycheckAmount,
        rent_account_id: '',
        forwarding_account_id: ''
      };
    }
  }

  /**
   * Get next paycheck projection based on profile
   */
  static getNextPaycheckProjection(profile: RentSmoothingProfile): {
    projectedAmount: CentsAmount;
    nextPayDate: string;
    allocation: AllocationResult;
  } {
    const projectedAmount = profile.average_paycheck_amount || 0;
    const nextPayDate = profile.next_pay_date || new Date().toISOString();
    
    const allocation = this.calculateProjectedAllocation(
      projectedAmount,
      profile.rent_amount
    );

    return {
      projectedAmount,
      nextPayDate,
      allocation
    };
  }

  /**
   * Simulate multiple paycheck scenarios
   */
  static simulateScenarios(
    paycheckAmounts: CentsAmount[],
    rentAmount: CentsAmount
  ): Array<{
    paycheckAmount: CentsAmount;
    allocation: AllocationResult;
    totalForwarded: CentsAmount;
    totalShortfall: CentsAmount;
  }> {
    let totalForwarded = 0;
    let totalShortfall = 0;

    return paycheckAmounts.map((amount, index) => {
      const allocation = this.calculateProjectedAllocation(amount, rentAmount);
      
      totalForwarded += allocation.forwarding_allocated;
      totalShortfall += allocation.shortfall_created;

      return {
        paycheckAmount: amount,
        allocation,
        totalForwarded,
        totalShortfall
      };
    });
  }

  /**
   * Validate allocation rules
   */
  static validateAllocationRules(
    profile: RentSmoothingProfile,
    proposedAllocation: AllocationResult
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Rule 1: Rent allocation cannot exceed rent amount
    if (proposedAllocation.rent_allocated > profile.rent_amount) {
      errors.push('Rent allocation cannot exceed monthly rent amount');
    }

    // Rule 2: Total allocation must equal paycheck amount
    const totalAllocated = proposedAllocation.rent_allocated + 
                         proposedAllocation.forwarding_allocated + 
                         proposedAllocation.shortfall_created;
    
    // Note: This validation would need the actual paycheck amount
    // For now, we'll just check that allocations are non-negative
    if (proposedAllocation.rent_allocated < 0) {
      errors.push('Rent allocation cannot be negative');
    }

    if (proposedAllocation.forwarding_allocated < 0) {
      errors.push('Forwarding allocation cannot be negative');
    }

    if (proposedAllocation.shortfall_created < 0) {
      errors.push('Shortfall cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
