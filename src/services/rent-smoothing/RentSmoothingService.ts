import { supabase } from '@/integrations/supabase/client';
import { 
  RentSmoothingProfile, 
  DashboardData,
  CentsAmount,
  RentSmoothingStatus,
  formatCentsAsCurrency,
  centsToDollars
} from '@/types/rent-smoothing';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  PaycheckService,
  WalletService,
  AllocationEngine,
  RentDisbursementService,
  ForwardingService,
  ShortfallService,
  AutomationService
} from './index';

export class RentSmoothingService {
  /**
   * Create a new rent smoothing profile for a user
   */
  static async createProfile(userId: string, profileData: CreateProfileRequest): Promise<RentSmoothingProfile> {
    try {
      // Validate input
      if (profileData.rent_amount <= 0) {
        throw new Error('Rent amount must be positive');
      }

      if (profileData.rent_due_day < 1 || profileData.rent_due_day > 31) {
        throw new Error('Rent due day must be between 1 and 31');
      }

      if (profileData.pay_frequency && !['weekly', 'biweekly', 'monthly'].includes(profileData.pay_frequency)) {
        throw new Error('Invalid pay frequency');
      }

      // Check if user already has a profile
      const existingProfile = await this.getUserProfile(userId);
      if (existingProfile) {
        throw new Error('User already has a rent smoothing profile');
      }

      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .insert({
          user_id: userId,
          rent_amount: profileData.rent_amount,
          pay_frequency: profileData.pay_frequency,
          average_paycheck_amount: profileData.average_paycheck_amount,
          rent_due_day: profileData.rent_due_day,
          landlord_id: profileData.landlord_id,
          property_id: profileData.property_id,
          is_active: false,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile error details:', error);
      throw new Error(`Failed to create rent smoothing profile: ${error.message || error}`);
    }
  }

  /**
   * Get user's rent smoothing profile
   */
  static async getUserProfile(userId: string): Promise<RentSmoothingProfile | null> {
    try {
      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user's rent smoothing profile
   */
  static async updateProfile(userId: string, updates: Partial<CreateProfileRequest>): Promise<RentSmoothingProfile> {
    try {
      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Activate rent smoothing profile
   */
  static async activateProfile(userId: string): Promise<RentSmoothingProfile> {
    try {
      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .update({
          is_active: true,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to activate profile');
    }
  }

  /**
   * Deactivate rent smoothing profile
   */
  static async deactivateProfile(userId: string): Promise<RentSmoothingProfile> {
    try {
      const { data, error } = await supabase
        .from('rs_employed_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to deactivate profile');
    }
  }

  /**
   * Simulate a paycheck deposit (for development/testing)
   */
  static async simulateDeposit(
    userId: string,
    amount: CentsAmount,
    externalReference?: string
  ): Promise<{
    paycheckEvent: any;
    allocationResult: any;
  }> {
    try {
      // Create paycheck event
      const { data: paycheckEvent, error: createError } = await supabase
        .from('rs_paycheck_events')
        .insert({
          user_id: userId,
          amount: amount,
          deposit_date: new Date().toISOString(),
          status: 'pending',
          external_reference: externalReference
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get user's rent smoothing profile
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('User must have a rent smoothing profile to simulate deposits');
      }

      // TODO: Call AllocationEngine.processPaycheck() here
      // For now, just return paycheck event
      return {
        paycheckEvent,
        allocationResult: null
      };
    } catch (error) {
      throw new Error('Failed to simulate deposit');
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  static async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Get profile
      const profile = await this.getUserProfile(userId);
      
      // Get wallet balances
      const walletBalances = await WalletService.getWalletBalances(userId);
      
      // Get recent transactions
      const recentTransactions = await WalletService.getTransactionHistory(userId, 10);
      
      // Get upcoming payments
      const upcomingPayments = await RentDisbursementService.getUpcomingRentPayments(userId);
      
      // Get last paycheck
      const lastPaycheck = await PaycheckService.getLastPaycheck(userId);
      
      // Get active shortfall
      const activeShortfall = await ShortfallService.getActiveShortfall(userId);
      
      // Get pending forwarding
      const pendingForwarding = await ForwardingService.getPendingForwardingEvents(userId);

      // Determine status
      let status: 'inactive' | 'active' | 'shortfall' | 'processing' = 'inactive';
      if (profile?.is_active) {
        status = 'active';
        if (activeShortfall) status = 'shortfall';
      }

      const rentSmoothingStatus: RentSmoothingStatus = {
        profile,
        wallet_balances: walletBalances || {
          main_balance: 0,
          rent_lock_balance: 0,
          forwarding_balance: 0,
          total_balance: 0
        },
        last_paycheck,
        next_rent_payment: upcomingPayments[0],
        active_shortfall,
        pending_forwarding,
        is_active: profile?.is_active || false,
        status
      };

      const dashboardData: DashboardData = {
        status: rentSmoothingStatus,
        recent_transactions,
        upcoming_payments,
        total_saved: walletBalances?.rent_lock_balance || 0,
        next_paycheck_date: profile?.next_pay_date
      };

      return dashboardData;
    } catch (error) {
      throw new Error('Failed to get dashboard data');
    }
  }

  /**
   * Validate profile data
   */
  private static validateProfileData(profileData: CreateProfileRequest): void {
    if (profileData.rent_amount <= 0) {
      throw new Error('Rent amount must be positive');
    }

    if (profileData.rent_due_day < 1 || profileData.rent_due_day > 31) {
      throw new Error('Rent due day must be between 1 and 31');
    }

    const validFrequencies = ['weekly', 'biweekly', 'monthly'];
    if (!validFrequencies.includes(profileData.pay_frequency)) {
      throw new Error('Invalid pay frequency');
    }
  }
}
