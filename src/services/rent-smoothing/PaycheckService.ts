import { supabase } from '@/integrations/supabase/client';
import { 
  PaycheckEvent, 
  CentsAmount,
  RentSmoothingProfile,
  RentSmoothingError,
  ValidationError
} from '@/types/rent-smoothing';
import { AllocationEngine } from './AllocationEngine';
import { WalletService } from './WalletService';
import { LedgerService } from './LedgerService';

export class PaycheckService {
  /**
   * Detect and process incoming paycheck
   */
  static async detectAndProcessPaycheck(
    userId: string,
    amount: CentsAmount,
    externalReference?: string,
    depositDate?: string
  ): Promise<{
    paycheckEvent: PaycheckEvent;
    allocationResult?: any;
    transactionIds: string[];
  }> {
    try {
      // Validate inputs
      this.validatePaycheckInput(userId, amount);

      // Create paycheck event record
      const { data: paycheckEvent, error: createError } = await supabase
        .from('rs_paycheck_events')
        .insert({
          user_id: userId,
          amount: amount,
          deposit_date: depositDate || new Date().toISOString(),
          status: 'pending',
          external_reference: externalReference
        })
        .select()
        .single();

      if (createError) {
        throw new RentSmoothingError(
          'Failed to create paycheck event',
          'PAYCHECK_CREATION_FAILED',
          { userId, amount, error: createError }
        );
      }

      // Get user's rent smoothing profile
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new ValidationError(
          'User must have a rent smoothing profile to process paychecks',
          'profile_required'
        );
      }

      // Process allocation through AllocationEngine
      const { allocationResult, transactionIds } = await AllocationEngine.processPaycheck(
        userId,
        amount,
        profile,
        externalReference
      );

      // Update paycheck event with processing results
      const { data: updatedEvent, error: updateError } = await supabase
        .from('rs_paycheck_events')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          allocation_result: allocationResult
        })
        .eq('id', paycheckEvent.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update paycheck event:', updateError);
      }

      return {
        paycheckEvent: updatedEvent || paycheckEvent,
        allocationResult,
        transactionIds
      };

    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to detect and process paycheck',
        'PAYCHECK_PROCESSING_FAILED',
        { userId, amount, error }
      );
    }
  }

  /**
   * Get pending paychecks for a user
   */
  static async getPendingPaychecks(userId: string): Promise<PaycheckEvent[]> {
    try {
      const { data, error } = await supabase
        .from('rs_paycheck_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('deposit_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get pending paychecks',
        'PENDING_PAYCHECKS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get processed paychecks for a user
   */
  static async getProcessedPaychecks(userId: string, limit: number = 10): Promise<PaycheckEvent[]> {
    try {
      const { data, error } = await supabase
        .from('rs_paycheck_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'processed')
        .order('processed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get processed paychecks',
        'PROCESSED_PAYCHECKS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get paycheck by ID
   */
  static async getPaycheckById(paycheckId: string): Promise<PaycheckEvent | null> {
    try {
      const { data, error } = await supabase
        .from('rs_paycheck_events')
        .select('*')
        .eq('id', paycheckId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get paycheck by ID',
        'PAYCHECK_GET_FAILED',
        { paycheckId, error }
      );
    }
  }

  /**
   * Validate paycheck input
   */
  private static validatePaycheckInput(userId: string, amount: CentsAmount): void {
    if (amount <= 0) {
      throw new ValidationError(
        'Paycheck amount must be positive',
        'amount'
      );
    }

    if (amount < 10000) { // $100 minimum
      throw new ValidationError(
        'Paycheck amount is below minimum threshold ($100)',
        'amount'
      );
    }
  }

  /**
   * Get user profile (helper method)
   */
  private static async getUserProfile(userId: string): Promise<RentSmoothingProfile> {
    try {
      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        throw new RentSmoothingError(
          'User profile not found',
          'PROFILE_NOT_FOUND',
          { userId }
        );
      }

      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get user profile',
        'PROFILE_FETCH_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Process pending paychecks (for automation/cron jobs)
   */
  static async processPendingPaychecks(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Get all pending paychecks
      const { data: pendingPaychecks, error: fetchError } = await supabase
        .from('rs_paycheck_events')
        .select('*')
        .eq('status', 'pending');

      if (fetchError) throw fetchError;

      if (!pendingPaychecks || pendingPaychecks.length === 0) {
        return { processed: 0, failed: 0, errors: [] };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each pending paycheck
      for (const paycheck of pendingPaychecks) {
        try {
          await this.detectAndProcessPaycheck(
            paycheck.user_id,
            paycheck.amount,
            paycheck.external_reference,
            paycheck.deposit_date
          );
          processed++;
        } catch (error) {
          failed++;
          errors.push(`Failed to process paycheck ${paycheck.id}: ${error.message}`);
        }
      }

      return { processed, failed, errors };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to process pending paychecks',
        'BATCH_PROCESSING_FAILED',
        { error }
      );
    }
  }

  /**
   * Get last paycheck for a user
   */
  static async getLastPaycheck(userId: string): Promise<PaycheckEvent | null> {
    try {
      const { data, error } = await supabase
        .from('rs_paycheck_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'processed')
        .order('processed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get last paycheck',
        'LAST_PAYCHECK_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get paycheck statistics
   */
  static async getPaycheckStats(userId: string): Promise<{
    totalPaychecks: number;
    totalAmount: CentsAmount;
    averageAmount: CentsAmount;
    lastPaycheckDate: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('rs_paycheck_events')
        .select('amount, deposit_date')
        .eq('user_id', userId)
        .eq('status', 'processed');

      if (error) throw error;

      const totalPaychecks = data?.length || 0;
      const totalAmount = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const averageAmount = totalPaychecks > 0 ? Math.round(totalAmount / totalPaychecks) : 0;
      const lastPaycheckDate = data?.[0]?.deposit_date || '';

      return {
        totalPaychecks,
        totalAmount,
        averageAmount,
        lastPaycheckDate
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get paycheck statistics',
        'STATS_FAILED',
        { userId, error }
      );
    }
  }
}
