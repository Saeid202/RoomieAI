import { 
  BankingProvider, 
  MockBankAccount, 
  MockTransaction,
  CentsAmount,
  RentSmoothingError 
} from '@/types/rent-smoothing';

export class MockBankingProvider implements BankingProvider {
  private accounts: Map<string, MockBankAccount> = new Map();
  private transactions: MockTransaction[] = [];
  private depositCallbacks: Array<(userId: string, amount: number, reference: string) => void> = [];

  constructor() {
    console.log('🏦 Mock Banking Provider initialized');
  }

  /**
   * Create a new mock bank account for a user
   */
  async createAccount(userId: string): Promise<string> {
    try {
      const accountNumber = this.generateAccountNumber();
      const routingNumber = this.generateRoutingNumber();
      
      const account: MockBankAccount = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        account_number: accountNumber,
        routing_number: routingNumber,
        balance: 0,
        type: 'checking',
        created_at: new Date().toISOString()
      };

      this.accounts.set(account.id, account);
      
      console.log(`🏦 Created mock account ${accountNumber} for user ${userId}`);
      return account.id;
    } catch (error) {
      throw new RentSmoothingError(
        'Failed to create mock bank account',
        'ACCOUNT_CREATION_FAILED',
        { userId, error }
      );
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId: string): Promise<any> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new RentSmoothingError(
        'Account not found',
        'ACCOUNT_NOT_FOUND',
        { accountId }
      );
    }
    return account;
  }

  /**
   * Send payment from one account to another
   */
  async sendPayment(
    fromAccountId: string, 
    toAccountId: string, 
    amount: CentsAmount
  ): Promise<string> {
    try {
      const fromAccount = this.accounts.get(fromAccountId);
      const toAccount = this.accounts.get(toAccountId);

      if (!fromAccount || !toAccount) {
        throw new RentSmoothingError(
          'One or both accounts not found',
          'ACCOUNT_NOT_FOUND',
          { fromAccountId, toAccountId }
        );
      }

      if (fromAccount.balance < amount) {
        throw new RentSmoothingError(
          'Insufficient funds for payment',
          'INSUFFICIENT_FUNDS',
          { fromAccountId, balance: fromAccount.balance, amount }
        );
      }

      // Create transaction
      const transaction: MockTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: amount,
        type: 'transfer',
        reference: `payment_${Date.now()}`,
        created_at: new Date().toISOString()
      };

      // Update balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      // Store transaction
      this.transactions.push(transaction);

      console.log(`🏦 Payment sent: $${(amount / 100).toFixed(2)} from ${fromAccount.account_number} to ${toAccount.account_number}`);
      return transaction.id;
    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to send payment',
        'PAYMENT_FAILED',
        { fromAccountId, toAccountId, amount, error }
      );
    }
  }

  /**
   * Register callback for deposit events
   */
  onDeposit(callback: (userId: string, amount: number, reference: string) => void): void {
    this.depositCallbacks.push(callback);
  }

  /**
   * Simulate a deposit to a user's account
   */
  async simulateDeposit(
    userId: string, 
    amount: CentsAmount, 
    reference?: string
  ): Promise<string> {
    try {
      // Find user's account
      const userAccount = Array.from(this.accounts.values())
        .find(account => account.user_id === userId);

      if (!userAccount) {
        throw new RentSmoothingError(
          'User account not found',
          'USER_ACCOUNT_NOT_FOUND',
          { userId }
        );
      }

      const transactionReference = reference || `deposit_${Date.now()}`;

      // Create deposit transaction
      const transaction: MockTransaction = {
        id: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from_account_id: 'system', // System account
        to_account_id: userAccount.id,
        amount: amount,
        type: 'deposit',
        reference: transactionReference,
        created_at: new Date().toISOString()
      };

      // Update balance
      userAccount.balance += amount;

      // Store transaction
      this.transactions.push(transaction);

      // Trigger deposit callbacks
      this.depositCallbacks.forEach(callback => {
        try {
          callback(userId, amount, transactionReference);
        } catch (error) {
          console.error('Error in deposit callback:', error);
        }
      });

      console.log(`🏦 Deposit simulated: $${(amount / 100).toFixed(2)} to account ${userAccount.account_number}`);
      return transaction.id;
    } catch (error) {
      if (error instanceof RentSmoothingError) throw error;
      throw new RentSmoothingError(
        'Failed to simulate deposit',
        'DEPOSIT_SIMULATION_FAILED',
        { userId, amount, error }
      );
    }
  }

  /**
   * Get transaction history for an account
   */
  async getTransactionHistory(accountId: string): Promise<MockTransaction[]> {
    return this.transactions.filter(tx => 
      tx.from_account_id === accountId || tx.to_account_id === accountId
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<CentsAmount> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new RentSmoothingError(
        'Account not found',
        'ACCOUNT_NOT_FOUND',
        { accountId }
      );
    }
    return account.balance;
  }

  /**
   * Generate mock account number
   */
  private generateAccountNumber(): string {
    // Generate realistic-looking account number (12 digits)
    return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
  }

  /**
   * Generate mock routing number
   */
  private generateRoutingNumber(): string {
    // Generate realistic-looking routing number (9 digits)
    return Math.floor(Math.random() * 900000000 + 100000000).toString();
  }

  /**
   * Get all accounts for a user
   */
  async getUserAccounts(userId: string): Promise<MockBankAccount[]> {
    return Array.from(this.accounts.values())
      .filter(account => account.user_id === userId);
  }

  /**
   * Reset all data (for testing)
   */
  async reset(): Promise<void> {
    this.accounts.clear();
    this.transactions = [];
    this.depositCallbacks = [];
    console.log('🏦 Mock banking provider reset');
  }

  /**
   * Get system statistics
   */
  getStats(): {
    totalAccounts: number;
    totalTransactions: number;
    totalBalance: CentsAmount;
  } {
    const totalBalance = Array.from(this.accounts.values())
      .reduce((sum, account) => sum + account.balance, 0);

    return {
      totalAccounts: this.accounts.size,
      totalTransactions: this.transactions.length,
      totalBalance
    };
  }

  /**
   * Simulate bank processing delay
   */
  private async simulateDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const mockBankingProvider = new MockBankingProvider();

// Export convenience functions
export const createMockAccount = (userId: string) => mockBankingProvider.createAccount(userId);
export const simulateMockDeposit = (userId: string, amount: CentsAmount, reference?: string) => 
  mockBankingProvider.simulateDeposit(userId, amount, reference);
export const sendMockPayment = (fromAccountId: string, toAccountId: string, amount: CentsAmount) => 
  mockBankingProvider.sendPayment(fromAccountId, toAccountId, amount);
