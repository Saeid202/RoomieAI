import { supabase } from '@/integrations/supabase/client';
import {
  LandlordPayoutMethodType,
  LandlordBankAccountDetails,
  LandlordDebitCardDetails,
  PayoutSetupRequest,
  PayoutSetupResponse,
  BankVerificationRequest,
  BankVerificationResponse,
  LandlordPayoutMethod
} from '@/types/payment';

/**
 * Setup landlord payout method (bank account or debit card)
 */
export async function setupLandlordPayoutMethod(
  request: PayoutSetupRequest
): Promise<PayoutSetupResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('setup-landlord-payout', {
      body: request
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from payout setup');
    }

    return data as PayoutSetupResponse;
  } catch (error: any) {
    console.error('Error setting up payout method:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    throw new Error(`Failed to setup payout method: ${errorMessage}`);
  }
}

/**
 * Verify bank account with micro-deposit amounts
 */
export async function verifyBankAccount(
  request: BankVerificationRequest
): Promise<BankVerificationResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-bank-account', {
      body: request
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from bank verification');
    }

    return data as BankVerificationResponse;
  } catch (error: any) {
    console.error('Error verifying bank account:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    throw new Error(`Failed to verify bank account: ${errorMessage}`);
  }
}

/**
 * Get landlord's payout method
 */
export async function getLandlordPayoutMethod(
  userId: string
): Promise<LandlordPayoutMethod | null> {
  try {
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('account_type', 'landlord')
      .maybeSingle();

    if (error) throw error;
    return data as LandlordPayoutMethod | null;
  } catch (error) {
    console.error('Error fetching payout method:', error);
    throw error;
  }
}

/**
 * Delete landlord payout method
 */
export async function deleteLandlordPayoutMethod(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('account_type', 'landlord');

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting payout method:', error);
    throw error;
  }
}

/**
 * Get payout method comparison data for UI
 */
export function getPayoutMethodComparisons() {
  return [
    {
      type: 'bank_account' as LandlordPayoutMethodType,
      name: 'Bank Account',
      speed: '2-7 business days',
      fee: 'Free',
      verificationTime: '1-2 days',
      bestFor: 'Regular payouts',
      icon: 'Building2',
      recommended: true
    },
    {
      type: 'debit_card' as LandlordPayoutMethodType,
      name: 'Debit Card',
      speed: '~30 minutes',
      fee: '1% per payout',
      verificationTime: 'Instant',
      bestFor: 'Urgent cash needs',
      icon: 'CreditCard',
      recommended: false
    }
  ];
}

/**
 * Calculate payout fee based on method type
 */
export function calculatePayoutFee(amount: number, methodType: LandlordPayoutMethodType): {
  fee: number;
  net: number;
  feePercentage: string;
} {
  if (methodType === 'bank_account') {
    return {
      fee: 0,
      net: amount,
      feePercentage: '0%'
    };
  } else {
    // Debit card: 1% fee
    const fee = amount * 0.01;
    return {
      fee: fee,
      net: amount - fee,
      feePercentage: '1%'
    };
  }
}

/**
 * Format bank routing number (institution + transit)
 */
export function formatBankRoutingNumber(
  institutionNumber: string,
  transitNumber: string
): string {
  return `${institutionNumber}${transitNumber}`;
}

/**
 * Parse bank routing number into institution and transit
 */
export function parseBankRoutingNumber(routingNumber: string): {
  institutionNumber: string;
  transitNumber: string;
} {
  if (routingNumber.length !== 8) {
    throw new Error('Invalid routing number length');
  }
  return {
    institutionNumber: routingNumber.substring(0, 3),
    transitNumber: routingNumber.substring(3, 8)
  };
}
