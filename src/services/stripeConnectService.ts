import { supabase } from '@/integrations/supabase/client';

export type StripeOnboardingStatus = 'not_started' | 'in_progress' | 'restricted' | 'ready';

export interface StripeConnectStatus {
  onboarding_status: StripeOnboardingStatus;
  stripe_account_id: string | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

export async function getStripeConnectStatus(): Promise<StripeConnectStatus> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'status' }
  });
  if (error) throw new Error(`Failed to get status: ${JSON.stringify(error)}`);
  return data as StripeConnectStatus;
}

export async function refreshStripeConnectStatus(): Promise<StripeConnectStatus> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'refresh-status' }
  });
  if (error) throw new Error(`Failed to refresh status: ${JSON.stringify(error)}`);
  return data as StripeConnectStatus;
}

export async function getStripeLoginLink(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: { action: 'login-link' }
  });
  if (error) throw new Error(`Failed to get login link: ${JSON.stringify(error)}`);
  if (!data?.url) throw new Error('No login URL returned');
  return data.url;
}
