import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
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
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse request body
    const body = await req.json();
    const {
      amount, // in cents
      currency = 'cad',
      payment_method_types,
      payment_method,
      payment_method_options,
      metadata
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(JSON.stringify({
        error: 'Invalid amount'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!payment_method) {
      console.error('Payment method missing');
      return new Response(JSON.stringify({
        error: 'Payment method is required'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    console.log('--- START ---');
    console.log('User:', user.id);
    console.log('Amount:', amount);

    // Get or create Stripe customer
    let customerId: string;
    const { data: customerData } = await supabaseClient
      .from('payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('account_type', 'tenant')
      .maybeSingle();

    if (customerData?.stripe_account_id) {
      customerId = customerData.stripe_account_id;
      console.log('Customer:', customerId);
    } else {
      console.log('Creating Customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await supabaseClient.from('payment_accounts').upsert({
        user_id: user.id,
        account_type: 'tenant',
        stripe_account_id: customerId
      });
    }

    // Attach/Verify
    try {
      console.log('Checking PM...');
      const pm = await stripe.paymentMethods.retrieve(payment_method);
      console.log('PM Status:', pm.type, pm.customer);

      if (pm.type === 'acss_debit' && pm.customer !== customerId) {
        if (pm.customer) {
          console.error('PM already attached to another customer');
          return new Response(JSON.stringify({ error: 'Linked account error' }), { status: 400, headers: corsHeaders });
        }
        console.log('Attaching...');
        try {
          await stripe.paymentMethods.attach(payment_method, { customer: customerId });
          console.log('Attached.');
        } catch (e: any) {
          console.error('Attach Error:', e.message);
          if (e.message.includes('must be verified')) {
            const isTest = (Deno.env.get('STRIPE_SECRET_KEY') || '').startsWith('sk_test');
            let message = 'Your bank account must be verified before it can be used for payments.';
            if (isTest) {
              message += ' In test mode, you can verify it by confirming the micro-deposits of $0.32 and $0.45 in the verification UI or Stripe Dashboard.';
            } else {
              message += ' If you used micro-deposits, check your bank statement in 1-2 days for two small deposits.';
            }
            return new Response(JSON.stringify({
              error: 'Bank Account Unverified',
              details: message,
              requires_verification: true
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          throw e;
        }
      } else if (pm.customer !== customerId) {
        await stripe.paymentMethods.attach(payment_method, { customer: customerId });
      }
    } catch (e: any) {
      console.error('PM Logic Error:', e.message);
      return new Response(JSON.stringify({ error: 'PM Error', details: e.message }), { status: 400, headers: corsHeaders });
    }

    // Create PI  
    const params: any = {
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: payment_method,
      payment_method_types: payment_method_types || ['acss_debit'],
      confirm: true,
      metadata: { ...metadata, user_id: user.id }
    };

    if (params.payment_method_types.includes('acss_debit')) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown';

      console.log('Adding mandate_data for acss_debit...');
      params.mandate_data = {
        customer_acceptance: {
          type: 'online',
          online: {
            ip_address: clientIp,
            user_agent: userAgent,
          },
        },
      };

      params.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Rent',
            transaction_type: 'personal'
          },
          // For recurring or manual payments with saved PMs, 
          // we don't necessarily need verification_method here if it's already verified.
        }
      };
    }

    console.log('Creating PI...');
    const pi = await stripe.paymentIntents.create(params);
    console.log('PI Created:', pi.id);

    return new Response(JSON.stringify({
      id: pi.id,
      client_secret: pi.client_secret
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('GLOBAL ERR:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
