import { supabase } from '@/integrations/supabase/client';
import { WalletTransaction, CentsAmount, RentSmoothingError } from '@/types/rent-smoothing';

export class LedgerService {
  /**
   * Record a double-entry transaction with full audit trail
   */
  static async recordTransaction(
    userId: string,
    debitAccountId: string,
    creditAccountId: string,
    amount: CentsAmount,
    transactionType: string,
    description?: string,
    referenceId?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('record_wallet_transaction', {
        user_uuid: userId,
        debit_account_uuid: debitAccountId,
        credit_account_uuid: creditAccountId,
        amount_cents: amount,
        txn_type: transactionType,
        description: description || null,
        reference_uuid: referenceId || null,
        txn_metadata: metadata || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to record ledger transaction',
        'LEDGER_TRANSACTION_FAILED',
        { userId, debitAccountId, creditAccountId, amount, transactionType, error }
      );
    }
  }

  /**
   * Get transaction by ID with full details
   */
  static async getTransaction(transactionId: string): Promise<WalletTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          debit_account:debit_account_id (
            id,
            account_type,
            balance
          ),
          credit_account:credit_account_id (
            id,
            account_type,
            balance
          )
        `)
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get transaction',
        'TRANSACTION_GET_FAILED',
        { transactionId, error }
      );
    }
  }

  /**
   * Get all transactions for a user with filtering options
   */
  static async getUserTransactions(
    userId: string,
    options: {
      transactionType?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    try {
      let query = supabase
        .from('wallet_transactions')
        .select(`
          *,
          debit_account:debit_account_id (
            id,
            account_type
          ),
          credit_account:credit_account_id (
            id,
            account_type
          )
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (options.transactionType) {
        query = query.eq('transaction_type', options.transactionType);
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data || [],
        total: count || 0
      };
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get user transactions',
        'USER_TRANSACTIONS_FAILED',
        { userId, options, error }
      );
    }
  }

  /**
   * Get transactions by reference ID (e.g., all transactions for a specific paycheck)
   */
  static async getTransactionsByReference(
    userId: string,
    referenceId: string
  ): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          debit_account:debit_account_id (
            id,
            account_type
          ),
          credit_account:credit_account_id (
            id,
            account_type
          )
        `)
        .eq('user_id', userId)
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get transactions by reference',
        'REFERENCE_TRANSACTIONS_FAILED',
        { userId, referenceId, error }
      );
    }
  }

  /**
   * Get account balance at a specific point in time
   */
  static async getBalanceAt(
    accountId: string,
    timestamp: string
  ): Promise<CentsAmount> {
    try {
      // Calculate balance by summing all transactions up to the timestamp
      const { data, error } = await supabase
        .rpc('calculate_balance_at_timestamp', {
          account_uuid: accountId,
          timestamp: timestamp
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to calculate balance at timestamp',
        'BALANCE_AT_FAILED',
        { accountId, timestamp, error }
      );
    }
  }

  /**
   * Validate ledger integrity (ensure all accounts balance)
   */
  static async validateLedgerIntegrity(userId: string): Promise<{
    isValid: boolean;
    discrepancies: Array<{
      accountId: string;
      expectedBalance: CentsAmount;
      actualBalance: CentsAmount;
      difference: CentsAmount;
    }>;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('validate_ledger_integrity', {
          user_uuid: userId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to validate ledger integrity',
        'LEDGER_VALIDATION_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get transaction summary by type for a user
   */
  static async getTransactionSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{
    transaction_type: string;
    total_amount: CentsAmount;
    count: number;
  }>> {
    try {
      let query = supabase
        .from('wallet_transactions')
        .select('transaction_type, amount')
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by transaction type and calculate totals
      const summary = data?.reduce((acc: any, transaction) => {
        const type = transaction.transaction_type;
        if (!acc[type]) {
          acc[type] = {
            transaction_type: type,
            total_amount: 0,
            count: 0
          };
        }
        acc[type].total_amount += transaction.amount;
        acc[type].count += 1;
        return acc;
      }, {});

      return Object.values(summary || {});
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get transaction summary',
        'TRANSACTION_SUMMARY_FAILED',
        { userId, startDate, endDate, error }
      );
    }
  }

  /**
   * Create audit trail entry for a transaction
   */
  static async createAuditEntry(
    transactionId: string,
    action: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('transaction_audit_log')
        .insert({
          transaction_id: transactionId,
          action,
          user_id: userId,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create audit entry',
        'AUDIT_ENTRY_FAILED',
        { transactionId, action, userId, error }
      );
    }
  }

  /**
   * Get audit trail for a transaction
   */
  static async getAuditTrail(transactionId: string): Promise<Array<{
    action: string;
    user_id: string;
    metadata: Record<string, any>;
    created_at: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('transaction_audit_log')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get audit trail',
        'AUDIT_TRAIL_FAILED',
        { transactionId, error }
      );
    }
  }
}
