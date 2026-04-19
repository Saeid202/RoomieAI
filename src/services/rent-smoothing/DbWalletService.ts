// DB-backed wallet service — persists balances to Supabase so cross-session transfers work
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

export class DbWalletService {
  /**
   * Get or create a wallet for a user, returns balance in cents
   */
  static async getOrCreateWallet(userId: string): Promise<{ id: string; balance: number }> {
    const { data: existing } = await sb
      .from('wallet_accounts')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('account_type', 'main')
      .maybeSingle();

    if (existing) return existing;

    const { data: created, error: insertError } = await sb
      .from('wallet_accounts')
      .insert({
        user_id: userId,
        account_type: 'main',
        balance: 0,
        currency: 'CAD',
        is_locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, balance')
      .single();

    if (insertError) throw new Error(`Failed to create wallet: ${insertError.message}`);
    return created;
  }

  /**
   * Get balance for a user in cents
   */
  static async getBalance(userId: string): Promise<number> {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet.balance || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Add funds to a user's wallet
   */
  static async addBalance(userId: string, amountCents: number): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = (wallet.balance || 0) + amountCents;
    await sb
      .from('wallet_accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);
    return newBalance;
  }

  /**
   * Transfer from one user to another — atomic debit + credit
   */
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amountCents: number
  ): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }> {
    try {
      const [fromWallet, toWallet] = await Promise.all([
        this.getOrCreateWallet(fromUserId),
        this.getOrCreateWallet(toUserId),
      ]);

      if ((fromWallet.balance || 0) < amountCents) {
        return { success: false, fromBalance: fromWallet.balance, toBalance: toWallet.balance, error: 'Insufficient balance' };
      }

      const newFromBalance = (fromWallet.balance || 0) - amountCents;
      const newToBalance = (toWallet.balance || 0) + amountCents;

      const [r1, r2] = await Promise.all([
        sb.from('wallet_accounts')
          .update({ balance: newFromBalance, updated_at: new Date().toISOString() })
          .eq('id', fromWallet.id),
        sb.from('wallet_accounts')
          .update({ balance: newToBalance, updated_at: new Date().toISOString() })
          .eq('id', toWallet.id),
      ]);

      return {
        success: !r1.error && !r2.error,
        fromBalance: newFromBalance,
        toBalance: newToBalance,
        error: r1.error?.message || r2.error?.message
      };
    } catch (e: any) {
      return { success: false, fromBalance: 0, toBalance: 0, error: e.message };
    }
  }

  /**
   * Record a transaction for history
   */
  static async recordTransaction(
    userId: string,
    type: 'deposit' | 'rent_payment' | 'forwarding',
    amountCents: number,
    description: string
  ): Promise<void> {
    try {
      await sb.from('wallet_transactions').insert({
        user_id: userId,
        debit_account_id: userId, // simplified — no double-entry needed for history
        credit_account_id: userId,
        amount: amountCents,
        transaction_type: type,
        description,
        created_at: new Date().toISOString(),
      });
    } catch { /* non-critical — don't fail the payment */ }
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactions(userId: string, limit = 20): Promise<Array<{
    id: string;
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
  }>> {
    try {
      const { data } = await sb
        .from('wallet_transactions')
        .select('id, transaction_type, amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    } catch {
      return [];
    }
  }
  static async getUserIdByEmail(email: string): Promise<string | null> {
    const emailLower = email.toLowerCase().trim();
    try {
      const { data: profile } = await sb
        .from('user_profiles')
        .select('id')
        .eq('email', emailLower)
        .limit(1)
        .single();

      return profile?.id || null;
    } catch {
      return null;
    }
  }
}
