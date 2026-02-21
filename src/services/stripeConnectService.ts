import { supabase } from '@/integrations/supabase/client';

/**
 * Create or retrieve Stripe Connect account and get onboarding URL
 */
export async function createStripeConnectAccount(): Promise<{ accountId: string; url: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
      body: {
        refresh_url: `${window.location.origin}/dashboard/landlord/payments`,
        return_url: `${window.location.origin}/dashboard/landlord/payments?onboarding=complete`
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Function error: ${JSON.stringify(error)}`);
    }
    
    if (!data) {
      throw new Error('No data returned from Stripe Connect account creation');
    }

    if (!data.accountId || !data.url) {
      console.error('Invalid response data:', data);
      throw new Error(`Invalid response: ${JSON.stringify(data)}`);
    }

    return {
      accountId: data.accountId,
      url: data.url
    };
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    throw new Error(`Failed to create Stripe Connect account: ${errorMessage}`);
  }
}

/**
 * Check Stripe Connect account status
 */
export async function getStripeConnectStatus(userId: string): Promise<{
  hasAccount: boolean;
  accountId: string | null;
  status: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('stripe_account_id, stripe_account_status')
      .eq('user_id', userId)
      .eq('account_type', 'landlord')
      .maybeSingle();

    if (error) throw error;

    return {
      hasAccount: !!data?.stripe_account_id,
      accountId: data?.stripe_account_id || null,
      status: data?.stripe_account_status || null
    };
  } catch (error) {
    console.error('Error checking Stripe Connect status:', error);
    throw error;
  }
}
