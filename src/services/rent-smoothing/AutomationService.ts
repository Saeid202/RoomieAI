import { supabase } from '@/integrations/supabase/client';
import { 
  RentSmoothingProfile,
  RentSmoothingError
} from '@/types/rent-smoothing';
import { RentDisbursementService } from './RentDisbursementService';
import { PaycheckService } from './PaycheckService';
import { ForwardingService } from './ForwardingService';

export class AutomationService {
  /**
   * Daily automation job - processes pending rent payments
   */
  static async processDailyRentPayments(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      console.log('🤖 Starting daily rent payment automation...');
      
      // Get all pending rent payments that are due today or past due
      const { data: pendingPayments, error: fetchError } = await supabase
        .from('rs_rent_payments')
        .select('*')
        .eq('status', 'pending')
        .lte('due_date', new Date().toISOString());

      if (fetchError) throw fetchError;

      if (!pendingPayments || pendingPayments.length === 0) {
        console.log('✅ No pending rent payments to process');
        return { processed: 0, failed: 0, errors: [] };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each pending rent payment
      for (const payment of pendingPayments) {
        try {
          const result = await RentDisbursementService.processRentPayment(
            payment.user_id,
            payment.id
          );
          
          if (result.success) {
            processed++;
            console.log(`✅ Processed rent payment ${payment.id} for user ${payment.user_id}`);
          } else {
            failed++;
            errors.push(`Failed to process rent payment ${payment.id}: ${result.message}`);
            console.error(`❌ Failed to process rent payment ${payment.id}: ${result.message}`);
          }
        } catch (error) {
          failed++;
          errors.push(`Error processing rent payment ${payment.id}: ${error.message}`);
          console.error(`❌ Error processing rent payment ${payment.id}: ${error.message}`);
        }
      }

      console.log(`🏁 Daily automation completed: ${processed} processed, ${failed} failed`);
      
      return { processed, failed, errors };
    } catch (error) {
      throw new RentSmoothingError(
        'Daily rent payment automation failed',
        'DAILY_AUTOMATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Process forwarding events (send money to external banks)
   */
  static async processPendingForwarding(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      console.log('🏦 Starting forwarding automation...');
      
      // Get all pending forwarding events
      const { data: pendingEvents, error: fetchError } = await supabase
        .from('rs_forwarding_events')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!pendingEvents || pendingEvents.length === 0) {
        console.log('✅ No pending forwarding events to process');
        return { processed: 0, failed: 0, errors: [] };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each pending forwarding event
      for (const event of pendingEvents) {
        try {
          // Mock external account details (in real system, this would come from user profile)
          const externalAccountLast4 = '1234'; // Mock last 4 digits
          const transactionReference = `FWD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const result = await ForwardingService.processForwarding(
            event.user_id,
            event.id,
            externalAccountLast4,
            transactionReference
          );
          
          if (result.status === 'sent') {
            processed++;
            console.log(`✅ Processed forwarding ${event.id} for user ${event.user_id}`);
          } else {
            failed++;
            errors.push(`Failed to process forwarding ${event.id}: ${result.status}`);
            console.error(`❌ Failed to process forwarding ${event.id}: ${result.status}`);
          }
        } catch (error) {
          failed++;
          errors.push(`Error processing forwarding ${event.id}: ${error.message}`);
          console.error(`❌ Error processing forwarding ${event.id}: ${error.message}`);
        }
      }

      console.log(`🏦 Forwarding automation completed: ${processed} processed, ${failed} failed`);
      
      return { processed, failed, errors };
    } catch (error) {
      throw new RentSmoothingError(
        'Forwarding automation failed',
        'FORWARDING_AUTOMATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Repay shortfalls from future paychecks
   */
  static async processShortfallRepayments(): Promise<{
    processed: number;
    failed: number;
    totalRepaid: number;
    errors: string[];
  }> {
    try {
      console.log('💰 Starting shortfall repayment automation...');
      
      // This would integrate with PaycheckService to automatically
      // deduct repayments when processing future paychecks
      
      // For now, return mock results
      const processed = 0;
      const failed = 0;
      const totalRepaid = 0;
      const errors: string[] = [];

      console.log('💰 Shortfall repayment automation completed');
      
      return { processed, failed, totalRepaid, errors };
    } catch (error) {
      throw new RentSmoothingError(
        'Shortfall repayment automation failed',
        'SHORTFALL_REPAYMENT_AUTOMATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Run all automation jobs
   */
  static async runAllAutomation(): Promise<{
    rentPayments: { processed: number; failed: number; errors: string[] };
    forwarding: { processed: number; failed: number; errors: string[] };
    shortfallRepayments: { processed: number; failed: number; totalRepaid: number; errors: string[] };
  }> {
    try {
      console.log('🤖 Starting all automation jobs...');
      
      const [rentPayments, forwarding, shortfallRepayments] = await Promise.all([
        this.processDailyRentPayments(),
        this.processPendingForwarding(),
        this.processShortfallRepayments()
      ]);

      console.log('✅ All automation jobs completed successfully');
      
      return {
        rentPayments,
        forwarding,
        shortfallRepayments
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Automation failed',
        'AUTOMATION_FAILED',
        { error }
      );
    }
  }

  /**
   * Get automation statistics
   */
  static async getAutomationStats(): Promise<{
    lastRun: {
      rentPayments: string;
      forwarding: string;
      shortfallRepayments: string;
    };
    totalRuns: number;
    successRate: number;
  }> {
    try {
      // This would typically read from an automation_log table
      // For now, return mock data
      
      const now = new Date().toISOString();
      
      return {
        lastRun: {
          rentPayments: now,
          forwarding: now,
          shortfallRepayments: now
        },
        totalRuns: 1,
        successRate: 100.0 // Mock: all automation jobs succeed
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get automation stats',
        'AUTOMATION_STATS_FAILED',
        { error }
      );
    }
  }
}
