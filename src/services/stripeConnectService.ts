import { supabase } from '@/integrations/supabase/client';

export type StripeOnboardingStatus = 'not_started' | 'in_progress' | 'restricted' | 'ready';

export interface StripeConnectStatus {
  onboarding_status: StripeOnboardingStatus;
  stripe_account_id: string | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

/**
 * Get current Stripe Connect status from DB (fast, no Stripe API call)
 */
export async function getStripeConnectStatus(): Promise<StripeConnectStatus> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'status' }
  });
  if (error) throw new Error(`Failed to get status: ${JSON.stringify(error)}`);
  return data as StripeConnectStatus;
}

/**
 * Refresh status from Stripe API and sync to DB
 */
export async function refreshStripeConnectStatus(): Promise<StripeConnectStatus> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'refresh-status' }
  });
  if (error) throw new Error(`Failed to refresh status: ${JSON.stringify(error)}`);
  return data as StripeConnectStatus;
}

/**
 * Attach a Canadian bank account to the landlord's Stripe Connect account
 */
export async function attachBankAccount(params: {
  account_holder_name: string;
  transit_number: string;
  institution_number: string;
  account_number: string;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'attach-bank-account', ...params }
  });
  if (error) throw new Error(`Failed to attach bank account: ${error.message || JSON.stringify(error)}`);
  if (data?.error) throw new Error(data.details || data.error);
  if (!data?.success) throw new Error('Bank account connection failed — no confirmation received');
}

/**
 * Create an Account Session for embedded Stripe Connect components
 */
export async function createStripeAccountSession(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'create-account-session' }
  });
  if (error) throw new Error(`Failed to create account session: ${JSON.stringify(error)}`);
  if (!data?.client_secret) throw new Error('No client_secret returned');
  return data.client_secret;
}

/**
 * Get Stripe onboarding link (creates account if needed)
 */
export async function getStripeOnboardingLink(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'onboarding-link' }
  });
  if (error) throw new Error(`Failed to get onboarding link: ${JSON.stringify(error)}`);
  if (!data?.url) throw new Error('No onboarding URL returned');
  return data.url;
}

/**
 * Get Stripe dashboard login link (for already-onboarded accounts)
 */
export async function getStripeLoginLink(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'login-link' }
  });
  if (error) throw new Error(`Failed to get login link: ${JSON.stringify(error)}`);
  if (!data?.url) throw new Error('No login URL returned');
  return data.url;
}
