import { supabase } from '@/integrations/supabase/client';
import { 
  ShortfallEvent,
  RentSmoothingPayment,
  CentsAmount,
  RentSmoothingError,
  ValidationError
} from '@/types/rent-smoothing';
import { WalletService } from './WalletService';
import { LedgerService } from './LedgerService';

export class ShortfallService {
  /**
   * Create a shortfall record when rent payment fails
   */
  static async createShortfall(
    userId: string,
    profileId: string,
    rentPaymentId: string,
    shortfallAmount: CentsAmount
  ): Promise<ShortfallEvent> {
    try {
      const { data, error } = await supabase
        .from('rs_shortfall_events')
        .insert({
          user_id: userId,
          profile_id: profileId,
          rent_payment_id: rentPaymentId,
          shortfall_amount: shortfallAmount,
          created_at: new Date().toISOString(),
          repaid_amount: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create shortfall record',
        'SHORTFALL_CREATION_FAILED',
        { userId, profileId, rentPaymentId, shortfallAmount, error }
      );
    }
  }

  /**
   * Get active shortfall for a user
   */
  static async getActiveShortfall(userId: string): Promise<ShortfallEvent | null> {
    try {
      const { data, error } = await supabase
        .from('rs_shortfall_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get active shortfall',
        'ACTIVE_SHORTFALL_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Repay shortfall amount
   */
  static async repayShortfall(
    userId: string,
    shortfallId: string,
    repaymentAmount: CentsAmount,
    description?: string
  ): Promise<ShortfallEvent> {
    try {
      // Get current shortfall
      const currentShortfall = await this.getShortfallById(shortfallId);
      if (!currentShortfall) {
        throw new ValidationError(
          'Shortfall not found',
          'shortfall_id'
        );
      }

      if (repaymentAmount > currentShortfall.shortfall_amount - currentShortfall.repaid_amount) {
        throw new ValidationError(
          'Repayment amount exceeds remaining shortfall',
          'repayment_amount'
        );
      }

      // Record repayment transaction
      const rentWallet = await WalletService.getWalletByType(userId, 'rent_lock');
      const systemAccount = 'system'; // This would be a special system account
      
      if (!rentWallet) {
        throw new RentSmoothingError(
          'Rent lock wallet not found',
          'WALLET_NOT_FOUND',
          { userId }
        );
      }

      const transactionId = await LedgerService.recordTransaction(
        userId,
        systemAccount,
        rentWallet.id,
        repaymentAmount,
        'shortfall',
        description || `Shortfall repayment: ${description}`,
        shortfallId
      );

      // Update shortfall record
      const newRepaidAmount = currentShortfall.repaid_amount + repaymentAmount;
      const newStatus = newRepaidAmount >= currentShortfall.shortfall_amount ? 'fully_repaid' : 'partial_repaid';

      const { data: updatedShortfall, error: updateError } = await supabase
        .from('rs_shortfall_events')
        .update({
          repaid_amount: newRepaidAmount,
          repaid_at: newStatus === 'fully_repaid' ? new Date().toISOString() : null,
          status: newStatus,
          repayment_transactions: [
            ...(currentShortfall.repayment_transactions || []),
            transactionId
          ]
        })
        .eq('id', shortfallId)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update shortfall record:', updateError);
      }

      return updatedShortfall || currentShortfall;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to repay shortfall',
        'SHORTFALL_REPAYMENT_FAILED',
        { userId, shortfallId, repaymentAmount, error }
      );
    }
  }

  /**
   * Get shortfall by ID
   */
  static async getShortfallById(shortfallId: string): Promise<ShortfallEvent | null> {
    try {
      const { data, error } = await supabase
        .from('rs_shortfall_events')
        .select('*')
        .eq('id', shortfallId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get shortfall by ID',
        'SHORTFALL_GET_FAILED',
        { shortfallId, error }
      );
    }
  }

  /**
   * Get all shortfalls for a user
   */
  static async getUserShortfalls(userId: string): Promise<ShortfallEvent[]> {
    try {
      const { data, error } = await supabase
        .from('rs_shortfall_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get user shortfalls',
        'USER_SHORTFALLS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get shortfall statistics
   */
  static async getShortfallStats(userId: string): Promise<{
    totalShortfalls: number;
    totalShortfallAmount: CentsAmount;
    totalRepaidAmount: CentsAmount;
    outstandingAmount: CentsAmount;
  }> {
    try {
      const shortfalls = await this.getUserShortfalls(userId);
      
      const totalShortfalls = shortfalls.length;
      const totalShortfallAmount = shortfalls.reduce((sum, s) => sum + s.shortfall_amount, 0);
      const totalRepaidAmount = shortfalls.reduce((sum, s) => sum + s.repaid_amount, 0);
      const outstandingAmount = totalShortfallAmount - totalRepaidAmount;

      return {
        totalShortfalls,
        totalShortfallAmount,
        totalRepaidAmount,
        outstandingAmount
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get shortfall statistics',
        'SHORTFALL_STATS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Check if user has outstanding shortfalls
   */
  static async hasOutstandingShortfalls(userId: string): Promise<boolean> {
    try {
      const stats = await this.getShortfallStats(userId);
      return stats.outstandingAmount > 0;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to check outstanding shortfalls',
        'OUTSTANDING_CHECK_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get next repayment amount from future paychecks
   */
  static async calculateNextRepaymentAmount(
    userId: string,
    nextPaycheckAmount: CentsAmount,
    profile: RentSmoothingProfile
  ): Promise<CentsAmount> {
    try {
      const outstandingAmount = (await this.getShortfallStats(userId)).outstandingAmount;
      
      if (outstandingAmount <= 0) {
        return 0; // No outstanding shortfalls
      }

      // Calculate 10% of paycheck for repayment
      const repaymentAmount = Math.min(
        Math.round(nextPaycheckAmount * 0.10), // 10% repayment
        outstandingAmount // Don't repay more than outstanding
      );

      return repaymentAmount;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to calculate next repayment amount',
        'REPAYMENT_CALCULATION_FAILED',
        { userId, error }
      );
    }
  }
}
