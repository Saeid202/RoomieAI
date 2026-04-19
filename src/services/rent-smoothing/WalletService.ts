import { supabase } from '@/integrations/supabase/client';
import { WalletAccount, WalletTransaction, CentsAmount, RentSmoothingError, InsufficientFundsError } from '@/types/rent-smoothing';

export class WalletService {
  /**
   * Directly update a wallet account's balance (used for top-up simulation)
   */
  static async updateWalletBalance(accountId: string, newBalance: CentsAmount): Promise<void> {
    const { error } = await (supabase as any)
      .from('wallet_accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', accountId);
    if (error) throw new RentSmoothingError('Failed to update wallet balance', 'BALANCE_UPDATE_FAILED', { accountId, error });
  }

  /**
   * Add funds to a user's main wallet (top-up simulation)
   */
  static async topUpMainWallet(userId: string, amountCents: CentsAmount): Promise<number> {
    const wallet = await this.getWalletByType(userId, 'main');
    if (!wallet) throw new RentSmoothingError('Main wallet not found', 'WALLET_NOT_FOUND', { userId });
    const newBalance = wallet.balance + amountCents;
    await this.updateWalletBalance(wallet.id, newBalance);
    return newBalance;
  }

  /**
   * Get total balance across all wallet accounts for a user
   */
  static async getTotalBalance(userId: string): Promise<CentsAmount> {
    const wallets = await this.getUserWallets(userId);
    return wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  }

  /**
   * Create wallet accounts for a new user
   */
  static async createUserWallets(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_user_wallet_accounts', {
        user_uuid: userId
      });

      if (error) throw error;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create user wallets',
        'WALLET_CREATION_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get all wallet accounts for a user
   */
  static async getUserWallets(userId: string): Promise<WalletAccount[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('account_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to fetch user wallets',
        'WALLET_FETCH_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get wallet balances for a user
   */
  static async getWalletBalances(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_wallet_balances', {
        user_uuid: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to fetch wallet balances',
        'BALANCE_FETCH_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get a specific wallet account by type
   */
  static async getWalletByType(userId: string, accountType: 'main' | 'rent_lock' | 'forwarding'): Promise<WalletAccount | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('account_type', accountType)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to fetch wallet by type',
        'WALLET_TYPE_FETCH_FAILED',
        { userId, accountType, error }
      );
    }
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactionHistory(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to fetch transaction history',
        'TRANSACTION_HISTORY_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Record a double-entry transaction
   */
  static async recordTransaction(
    userId: string,
    debitAccountId: string,
    creditAccountId: string,
    amount: CentsAmount,
    transactionType: string,
    description?: string,
    referenceId?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('record_wallet_transaction', {
        user_uuid: userId,
        debit_account_uuid: debitAccountId,
        credit_account_uuid: creditAccountId,
        amount_cents: amount,
        txn_type: transactionType,
        description: description || null,
        reference_uuid: referenceId || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to record transaction',
        'TRANSACTION_RECORD_FAILED',
        { userId, debitAccountId, creditAccountId, amount, error }
      );
    }
  }

  /**
   * Check if account has sufficient balance
   */
  static async checkBalance(accountId: string, requiredAmount: CentsAmount): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('balance, is_locked')
        .eq('id', accountId)
        .single();

      if (error) throw error;

      // Can't use locked accounts for balance checks
      if (data.is_locked) {
        throw new RentSmoothingError(
          'Cannot check balance on locked account',
          'ACCOUNT_LOCKED',
          { accountId }
        );
      }

      return data.balance >= requiredAmount;
    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to check balance',
        'BALANCE_CHECK_FAILED',
        { accountId, requiredAmount, error }
      );
    }
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId: string): Promise<CentsAmount> {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data.balance;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get account balance',
        'BALANCE_GET_FAILED',
        { accountId, error }
      );
    }
  }

  /**
   * Transfer funds between accounts (with balance check)
   */
  static async transfer(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: CentsAmount,
    description?: string
  ): Promise<string> {
    try {
      // Check if source account has sufficient balance
      const hasBalance = await this.checkBalance(fromAccountId, amount);
      if (!hasBalance) {
        const currentBalance = await this.getAccountBalance(fromAccountId);
        throw new InsufficientFundsError(currentBalance, amount);
      }

      // Record the transaction
      return await this.recordTransaction(
        userId,
        fromAccountId,
        toAccountId,
        amount,
        'transfer',
        description
      );
    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to transfer funds',
        'TRANSFER_FAILED',
        { userId, fromAccountId, toAccountId, amount, error }
      );
    }
  }

  /**
   * Get account details with related information
   */
  static async getAccountDetails(accountId: string): Promise<WalletAccount | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select(`
          *,
          parent_account:parent_account_id (
            id,
            account_type,
            balance
          )
        `)
        .eq('id', accountId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to get account details',
        'ACCOUNT_DETAILS_FAILED',
        { accountId, error }
      );
    }
  }
}
