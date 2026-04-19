import { supabase } from '@/integrations/supabase/client';
import { 
  RentSmoothingPayment,
  RentSmoothingProfile,
  CentsAmount,
  RentSmoothingError,
  ValidationError
} from '@/types/rent-smoothing';
import { WalletService } from './WalletService';
import { LedgerService } from './LedgerService';

export class RentDisbursementService {
  /**
   * Create rent payment record
   */
  static async createRentPayment(
    userId: string,
    profileId: string,
    amount: CentsAmount,
    dueDate: string
  ): Promise<RentSmoothingPayment> {
    try {
      const { data, error } = await supabase
        .from('rs_rent_payments')
        .insert({
          user_id: userId,
          profile_id: profileId,
          amount: amount,
          due_date: dueDate,
          status: 'pending',
          platform_fee: Math.round(amount * 0.025), // 2.5% platform fee
          late_fee: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create rent payment',
        'RENT_PAYMENT_CREATION_FAILED',
        { userId, profileId, amount, dueDate, error }
      );
    }
  }

  /**
   * Process rent payment from rent lock account
   */
  static async processRentPayment(
    userId: string,
    rentPaymentId: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
  }> {
    try {
      // Get rent payment record
      const rentPayment = await this.getRentPaymentById(rentPaymentId);
      if (!rentPayment) {
        return {
          success: false,
          message: 'Rent payment not found'
        };
      }

      // Get rent lock wallet
      const rentWallet = await WalletService.getWalletByType(userId, 'rent_lock');
      if (!rentWallet) {
        return {
          success: false,
          message: 'Rent lock wallet not found'
        };
      }

      // Check if sufficient funds
      if (rentWallet.balance < rentPayment.amount) {
        return {
          success: false,
          message: `Insufficient funds in rent lock wallet. Available: $${(rentWallet.balance / 100).toFixed(2)}, Required: $${(rentPayment.amount / 100).toFixed(2)}`
        };
      }

      // Record transaction
      const transactionId = await LedgerService.recordTransaction(
        userId,
        rentWallet.id,
        'system', // Landlord would be external system
        rentPayment.amount,
        'rent_payment',
        `Rent payment: ${new Date(rentPayment.due_date).toLocaleDateString()}`,
        rentPaymentId
      );

      // Update rent payment status
      const { error: updateError } = await supabase
        .from('rs_rent_payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          transaction_id: transactionId
        })
        .eq('id', rentPaymentId)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update rent payment status:', updateError);
      }

      return {
        success: true,
        transactionId,
        message: 'Rent payment processed successfully'
      };

    } catch (error) {
      throw new RentSmoothingError(
        'Failed to process rent payment',
        'RENT_PAYMENT_PROCESSING_FAILED',
        { userId, rentPaymentId, error }
      );
    }
  }

  /**
   * Get pending rent payments
   */
  static async getPendingRentPayments(userId: string): Promise<RentSmoothingPayment[]> {
    try {
      const { data, error } = await supabase
        .from('rs_rent_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get pending rent payments',
        'PENDING_RENT_PAYMENTS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get upcoming rent payments
   */
  static async getUpcomingRentPayments(userId: string, days: number = 30): Promise<RentSmoothingPayment[]> {
    try {
      const { data, error } = await supabase
        .from('rs_rent_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get upcoming rent payments',
        'UPCOMING_RENT_PAYMENTS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get rent payment by ID
   */
  static async getRentPaymentById(rentPaymentId: string): Promise<RentSmoothingPayment | null> {
    try {
      const { data, error } = await supabase
        .from('rs_rent_payments')
        .select('*')
        .eq('id', rentPaymentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get rent payment by ID',
        'RENT_PAYMENT_GET_FAILED',
        { rentPaymentId, error }
      );
    }
  }

  /**
   * Process all pending rent payments (for automation)
   */
  static async processPendingRentPayments(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Get all pending rent payments that are due today or past due
      const { data: pendingPayments, error: fetchError } = await supabase
        .from('rs_rent_payments')
        .select('*')
        .eq('status', 'pending')
        .lte('due_date', new Date().toISOString());

      if (fetchError) throw fetchError;

      if (!pendingPayments || pendingPayments.length === 0) {
        return { processed: 0, failed: 0, errors: [] };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each pending rent payment
      for (const payment of pendingPayments) {
        try {
          const result = await this.processRentPayment(payment.user_id, payment.id);
          if (result.success) {
            processed++;
          } else {
            failed++;
            errors.push(`Failed to process rent payment ${payment.id}: ${result.message}`);
          }
        } catch (error) {
          failed++;
          errors.push(`Error processing rent payment ${payment.id}: ${error.message}`);
        }
      }

      return { processed, failed, errors };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to process pending rent payments',
        'BATCH_PROCESSING_FAILED',
        { error }
      );
    }
  }

  /**
   * Get rent payment statistics
   */
  static async getRentPaymentStats(userId: string): Promise<{
    totalPayments: number;
    totalAmount: CentsAmount;
    totalLateFees: CentsAmount;
    totalPlatformFees: CentsAmount;
    averagePaymentAmount: CentsAmount;
  }> {
    try {
      const { data, error } = await supabase
        .from('rs_rent_payments')
        .select('amount, late_fee, platform_fee')
        .eq('user_id', userId)
        .eq('status', 'paid');

      if (error) throw error;

      const totalPayments = data?.length || 0;
      const totalAmount = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalLateFees = data?.reduce((sum, p) => sum + p.late_fee, 0) || 0;
      const totalPlatformFees = data?.reduce((sum, p) => sum + p.platform_fee, 0) || 0;
      const averagePaymentAmount = totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;

      return {
        totalPayments,
        totalAmount,
        totalLateFees,
        totalPlatformFees,
        averagePaymentAmount
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get rent payment statistics',
        'PAYMENT_STATS_FAILED',
        { userId, error }
      );
    }
  }
}
