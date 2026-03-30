import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = await req.json();
    const { accountHolderName, institutionNumber, transitNumber, accountNumber, bankName } = body;

    if (!accountHolderName || !institutionNumber || !transitNumber || !accountNumber) {
      return new Response(JSON.stringify({ error: 'Missing required bank account details' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    console.log('Creating Stripe customer for user:', user.id);

    // Create or retrieve Stripe customer
    let customerId: string;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log('Using existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);
    }

    // Create ACSS Debit Payment Method
    console.log('Creating ACSS debit payment method...');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'acss_debit',
      acss_debit: {
        account_number: accountNumber,
        institution_number: institutionNumber,
        transit_number: transitNumber,
      },
      billing_details: {
        name: accountHolderName,
        email: user.email,
      },
    });

    console.log('Payment method created:', paymentMethod.id);

    // Create SetupIntent
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method: paymentMethod.id,
      payment_method_types: ['acss_debit'],
      confirm: true,
      mandate_data: {
        customer_acceptance: {
          type: 'online',
          online: {
            ip_address: clientIp,
            user_agent: req.headers.get('user-agent') || 'Mozilla/5.0',
          },
        },
      },
      payment_method_options: {
        acss_debit: {
          currency: 'cad',
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly rent payment',
            transaction_type: 'personal',
          },
          verification_method: 'microdeposits',
        },
      },
    });

    console.log('SetupIntent created:', setupIntent.id, 'status:', setupIntent.status);

    // Save to payment_methods table (not payment_accounts)
    try {
      await supabaseClient.from('payment_methods').upsert({
        user_id: user.id,
        stripe_payment_method_id: paymentMethod.id,
        stripe_customer_id: customerId,
        payment_type: 'acss_debit',
        bank_name: bankName || 'Canadian Bank',
        last4: accountNumber.slice(-4),
        is_default: true,
        mandate_id: setupIntent.id,
        mandate_status: setupIntent.status,
      }, { onConflict: 'stripe_payment_method_id' });
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr);
      // Don't fail — payment method was created successfully
    }

    return new Response(JSON.stringify({
      paymentMethodId: paymentMethod.id,
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      customerId,
      last4: accountNumber.slice(-4),
      bankName: bankName || 'Canadian Bank',
      requiresAction: setupIntent.status === 'requires_action',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error:', error.message, error.type, error.code);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create payment method',
      details: error.raw?.message || error.code || error.type,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
