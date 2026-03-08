import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse request body
    const body = await req.json();
    const {
      accountHolderName,
      institutionNumber,
      transitNumber,
      accountNumber,
      bankName
    } = body;

    // Validate required fields
    if (!accountHolderName || !institutionNumber || !transitNumber || !accountNumber) {
      return new Response(JSON.stringify({ 
        error: 'Missing required bank account details' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Validate Canadian banking format
    if (!/^\d{3}$/.test(institutionNumber)) {
      return new Response(JSON.stringify({ 
        error: 'Institution number must be 3 digits' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!/^\d{5}$/.test(transitNumber)) {
      return new Response(JSON.stringify({ 
        error: 'Transit number must be 5 digits' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!/^\d{7,12}$/.test(accountNumber)) {
      return new Response(JSON.stringify({ 
        error: 'Account number must be 7-12 digits' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating Canadian PAD payment method for user:', user.id);

    // Create Stripe Customer if doesn't exist
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: existingCustomer } = await supabaseClient
      .from('payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('account_type', 'tenant')
      .single();

    if (existingCustomer?.stripe_account_id) {
      customerId = existingCustomer.stripe_account_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabaseClient
        .from('payment_accounts')
        .upsert({
          user_id: user.id,
          account_type: 'tenant',
          stripe_account_id: customerId,
          currency: 'CAD',
          status: 'active'
        }, { onConflict: 'user_id,account_type' });
    }

    // Create ACSS Debit Payment Method
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

    console.log('Created payment method:', paymentMethod.id);

    // Create SetupIntent for mandate acceptance and verification
    // Using microdeposits verification method which allows backend confirmation
    // This will verify the payment method AND attach it to the customer automatically
    
    // Get client IP address with proper validation
    const getValidIpAddress = (): string => {
      const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
      const realIp = req.headers.get('x-real-ip');
      
      // Try forwarded-for first
      if (forwardedFor && forwardedFor !== '0.0.0.0' && forwardedFor !== '::1') {
        return forwardedFor;
      }
      
      // Try real-ip
      if (realIp && realIp !== '0.0.0.0' && realIp !== '::1') {
        return realIp;
      }
      
      // Fallback to a valid localhost IP for development/testing
      return '127.0.0.1';
    };
    
    const clientIp = getValidIpAddress();
    console.log('Using IP address:', clientIp);
    
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method: paymentMethod.id,
      payment_method_types: ['acss_debit'],
      confirm: true, // Backend confirmation works with microdeposits
      mandate_data: {
        customer_acceptance: {
          type: 'online',
          online: {
            ip_address: clientIp,
            user_agent: req.headers.get('user-agent') || 'Mozilla/5.0'
          }
        }
      },
      payment_method_options: {
        acss_debit: {
          currency: 'cad',
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly rent payment',
            transaction_type: 'personal',
          },
          verification_method: 'microdeposits', // Changed from 'instant' to 'microdeposits'
        },
      },
    });

    console.log('Created and confirmed setup intent:', setupIntent.id);
    console.log('Status:', setupIntent.status);
    console.log('Payment method will be attached after microdeposit verification');

    // Return the client secret for frontend confirmation
    return new Response(JSON.stringify({
      paymentMethodId: paymentMethod.id,
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      customerId: customerId,
      last4: accountNumber.slice(-4),
      bankName: bankName || 'Canadian Bank',
      requiresAction: true // Frontend needs to confirm
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating PAD payment method:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create payment method',
      details: error.raw?.message || error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
