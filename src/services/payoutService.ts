import { supabase } from '@/integrations/supabase/client';

export interface PayoutStatus {
  connected: boolean;
  bank_name?: string;
  last4?: string;
  account_holder_name?: string;
}

export async function getPayoutStatus(userId: string): Promise<PayoutStatus> {
  const { data, error } = await supabase
    .from('landlord_connect_accounts')
    .select('onboarding_status, stripe_account_id, account_holder_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { connected: false };

  return {
    connected: data.onboarding_status === 'ready' || data.onboarding_status === 'in_progress',
    account_holder_name: data.account_holder_name ?? undefined,
  };
}

export async function savePayoutBankAccount(params: {
  account_holder_name: string;
  institution_number: string;
  transit_number: string;
  account_number: string;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'attach-bank-account', ...params },
  });

  if (error) throw new Error(error.message || 'Request failed');
  if (data?.error) throw new Error(data.details || data.error);
  if (!data?.success) throw new Error('No confirmation received from server');
}
