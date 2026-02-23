import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse request body
    const body = await req.json();
    const { methodType, bankAccount, debitCard } = body;

    if (!methodType || (methodType !== 'bank_account' && methodType !== 'debit_card')) {
      return new Response(JSON.stringify({ 
        error: 'Invalid method type. Must be bank_account or debit_card' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    const isTestMode = stripeKey.startsWith('sk_test_');
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Setting up payout method for user:', user.id, 'Type:', methodType, 'Test Mode:', isTestMode);

    let accountId: string;
    let externalAccountId: string;
    let requiresVerification = false;
    let payoutMethodStatus = 'verified';

    // In test mode, we'll simulate the Stripe responses since Connect external accounts
    // require live keys. This allows full UI/database testing without live Stripe.
    if (isTestMode) {
      console.log('TEST MODE: Simulating Stripe Connect setup');
      
      // Generate test IDs that look like real Stripe IDs
      accountId = `acct_test_${user.id.substring(0, 16)}`;
      externalAccountId = methodType === 'bank_account' 
        ? `ba_test_${Date.now()}` 
        : `card_test_${Date.now()}`;
      
      if (methodType === 'bank_account') {
        requiresVerification = true;
        payoutMethodStatus = 'verifying';
      }

      // Save to database with test data
      if (methodType === 'bank_account') {
        if (!bankAccount) {
          return new Response(JSON.stringify({ 
            error: 'Bank account details required' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const routingNumber = `${bankAccount.institutionNumber}${bankAccount.transitNumber}`;
        
        await supabaseClient
          .from('payment_accounts')
          .upsert({
            user_id: user.id,
            account_type: 'landlord',
            stripe_account_id: accountId,
            stripe_external_account_id: externalAccountId,
            payout_method_type: 'bank_account',
            payout_method_status: payoutMethodStatus,
            payout_schedule: 'standard',
            bank_account_last4: bankAccount.accountNumber.slice(-4),
            bank_name: bankAccount.bankName || 'Test Bank',
            bank_routing_number: routingNumber,
            bank_account_type: bankAccount.accountType || 'checking',
            verification_attempts: 0
          });

      } else if (methodType === 'debit_card') {
        if (!debitCard) {
          return new Response(JSON.stringify({ 
            error: 'Debit card details required' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        await supabaseClient
          .from('payment_accounts')
          .upsert({
            user_id: user.id,
            account_type: 'landlord',
            stripe_account_id: accountId,
            stripe_external_account_id: externalAccountId,
            payout_method_type: 'debit_card',
            payout_method_status: 'verified',
            payout_schedule: 'instant',
            card_last4: debitCard.cardNumber.slice(-4),
            card_brand: 'visa',
            card_exp_month: debitCard.expMonth,
            card_exp_year: debitCard.expYear,
            verified_at: new Date().toISOString(),
            verification_attempts: 0
          });
      }

      return new Response(JSON.stringify({
        success: true,
        accountId: accountId,
        externalAccountId: externalAccountId,
        status: payoutMethodStatus,
        requiresVerification: requiresVerification,
        testMode: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // LIVE MODE: Real Stripe Connect setup
    // Check if user already has a Stripe Connect account
    const { data: existingAccount } = await supabaseClient
      .from('payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('account_type', 'landlord')
      .maybeSingle();

    if (existingAccount?.stripe_account_id) {
      accountId = existingAccount.stripe_account_id;
      console.log('Using existing Stripe Connect account:', accountId);
    } else {
      // Create new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CA',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          supabase_user_id: user.id
        }
      });

      accountId = account.id;
      console.log('Created new Stripe Connect account:', accountId);
    }

    // Setup based on method type
    if (methodType === 'bank_account') {
      if (!bankAccount) {
        return new Response(JSON.stringify({ 
          error: 'Bank account details required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Create external bank account
      const routingNumber = `${bankAccount.institutionNumber}${bankAccount.transitNumber}`;
      
      const externalAccount = await stripe.accounts.createExternalAccount(
        accountId,
        {
          external_account: {
            object: 'bank_account',
            country: 'CA',
            currency: 'cad',
            routing_number: routingNumber,
            account_number: bankAccount.accountNumber,
            account_holder_name: bankAccount.accountHolderName,
            account_holder_type: 'individual',
          }
        }
      );

      externalAccountId = externalAccount.id;
      requiresVerification = true;
      payoutMethodStatus = 'verifying';

      console.log('Created external bank account:', externalAccountId);

      // Save to database
      await supabaseClient
        .from('payment_accounts')
        .upsert({
          user_id: user.id,
          account_type: 'landlord',
          stripe_account_id: accountId,
          stripe_external_account_id: externalAccountId,
          payout_method_type: 'bank_account',
          payout_method_status: payoutMethodStatus,
          payout_schedule: 'standard',
          bank_account_last4: bankAccount.accountNumber.slice(-4),
          bank_name: bankAccount.bankName || 'Canadian Bank',
          bank_routing_number: routingNumber,
          bank_account_type: bankAccount.accountType || 'checking',
          verification_attempts: 0
        });

    } else if (methodType === 'debit_card') {
      if (!debitCard) {
        return new Response(JSON.stringify({ 
          error: 'Debit card details required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Create card token first
      const token = await stripe.tokens.create({
        card: {
          number: debitCard.cardNumber,
          exp_month: debitCard.expMonth,
          exp_year: debitCard.expYear,
          cvc: debitCard.cvc,
          name: debitCard.cardholderName,
        }
      });

      // Create external card account
      const externalAccount = await stripe.accounts.createExternalAccount(
        accountId,
        {
          external_account: token.id
        }
      );

      externalAccountId = externalAccount.id;
      requiresVerification = false;
      payoutMethodStatus = 'verified';

      console.log('Created external debit card:', externalAccountId);

      // Save to database
      await supabaseClient
        .from('payment_accounts')
        .upsert({
          user_id: user.id,
          account_type: 'landlord',
          stripe_account_id: accountId,
          stripe_external_account_id: externalAccountId,
          payout_method_type: 'debit_card',
          payout_method_status: payoutMethodStatus,
          payout_schedule: 'instant',
          card_last4: debitCard.cardNumber.slice(-4),
          card_brand: 'visa', // Stripe will determine actual brand
          card_exp_month: debitCard.expMonth,
          card_exp_year: debitCard.expYear,
          verified_at: new Date().toISOString(),
          verification_attempts: 0
        });
    }

    return new Response(JSON.stringify({
      success: true,
      accountId: accountId,
      externalAccountId: externalAccountId,
      status: payoutMethodStatus,
      requiresVerification: requiresVerification
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error setting up payout method:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to setup payout method',
      details: error.message || error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
