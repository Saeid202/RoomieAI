import { supabase } from '@/integrations/supabase/client';
import { 
  ForwardingEvent,
  CentsAmount,
  RentSmoothingError
} from '@/types/rent-smoothing';
import { WalletService } from './WalletService';
import { LedgerService } from './LedgerService';

export class ForwardingService {
  /**
   * Create forwarding event record
   */
  static async createForwardingEvent(
    userId: string,
    paycheckEventId: string,
    amount: CentsAmount,
    externalAccountLast4?: string
  ): Promise<ForwardingEvent> {
    try {
      const { data, error } = await supabase
        .from('rs_forwarding_events')
        .insert({
          user_id: userId,
          paycheck_event_id: paycheckEventId,
          amount: amount,
          status: 'pending',
          external_account_last4: externalAccountLast4,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create forwarding event',
        'FORWARDING_EVENT_CREATION_FAILED',
        { userId, paycheckEventId, amount, error }
      );
    }
  }

  /**
   * Get pending forwarding events
   */
  static async getPendingForwardingEvents(userId: string): Promise<ForwardingEvent[]> {
    try {
      const { data, error } = await supabase
        .from('rs_forwarding_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get pending forwarding events',
        'PENDING_FORWARDING_EVENTS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Process forwarding (send money to external bank)
   */
  static async processForwarding(
    userId: string,
    forwardingEventId: string,
    externalAccountLast4?: string,
    transactionReference?: string
  ): Promise<ForwardingEvent> {
    try {
      // Get forwarding event
      const forwardingEvent = await this.getForwardingEventById(forwardingEventId);
      if (!forwardingEvent) {
        throw new RentSmoothingError(
          'Forwarding event not found',
          'FORWARDING_EVENT_NOT_FOUND',
          { forwardingEventId }
        );
      }

      // Get forwarding wallet
      const forwardingWallet = await WalletService.getWalletByType(userId, 'forwarding');
      if (!forwardingWallet) {
        throw new RentSmoothingError(
          'Forwarding wallet not found',
          'FORWARDING_WALLET_NOT_FOUND',
          { userId }
        );
      }

      // Check if sufficient funds
      if (forwardingWallet.balance < forwardingEvent.amount) {
        throw new RentSmoothingError(
          'Insufficient funds for forwarding',
          'INSUFFICIENT_FORWARDING_FUNDS',
          { 
            available: forwardingWallet.balance, 
            required: forwardingEvent.amount 
          }
        );
      }

      // Create transaction to external system (this would be the bank)
      const transactionId = await LedgerService.recordTransaction(
        userId,
        forwardingWallet.id,
        'external_bank', // This represents the external bank
        forwardingEvent.amount,
        'forwarding',
        `Forwarding to external bank ending in ${externalAccountLast4 || '****'}`,
        forwardingEventId
      );

      // Update forwarding wallet balance
      await WalletService.updateWalletBalance(forwardingWallet.id, forwardingWallet.balance - forwardingEvent.amount);

      // Update forwarding event
      const { data: updatedEvent, error: updateError } = await supabase
        .from('rs_forwarding_events')
        .update({
          status: 'sent',
          forwarded_at: new Date().toISOString(),
          transaction_reference: transactionReference,
          external_account_last4: externalAccountLast4
        })
        .eq('id', forwardingEventId)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update forwarding event:', updateError);
      }

      return updatedEvent || forwardingEvent;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to process forwarding',
        'FORWARDING_PROCESSING_FAILED',
        { userId, forwardingEventId, error }
      );
    }
  }

  /**
   * Get forwarding event by ID
   */
  static async getForwardingEventById(forwardingEventId: string): Promise<ForwardingEvent | null> {
    try {
      const { data, error } = await supabase
        .from('rs_forwarding_events')
        .select('*')
        .eq('id', forwardingEventId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get forwarding event by ID',
        'FORWARDING_EVENT_GET_FAILED',
        { forwardingEventId, error }
      );
    }
  }

  /**
   * Get forwarding statistics
   */
  static async getForwardingStats(userId: string): Promise<{
    totalForwarded: CentsAmount;
    pendingAmount: CentsAmount;
    totalEvents: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('rs_forwarding_events')
        .select('amount, status')
        .eq('user_id', userId);

      if (error) throw error;

      const totalEvents = data?.length || 0;
      const totalForwarded = data
        ?.filter(f => f.status === 'sent')
        ?.reduce((sum, f) => sum + f.amount, 0) || 0;
      const pendingAmount = data
        ?.filter(f => f.status === 'pending')
        ?.reduce((sum, f) => sum + f.amount, 0) || 0;

      return {
        totalForwarded,
        pendingAmount,
        totalEvents
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get forwarding statistics',
        'FORWARDING_STATS_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Update wallet balance (helper method)
   */
  private static async updateWalletBalance(walletId: string, newBalance: CentsAmount): Promise<void> {
    try {
      const { error } = await supabase
        .from('wallet_accounts')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId);

      if (error) {
        console.error('Failed to update wallet balance:', error);
      }
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
    }
  }
}
