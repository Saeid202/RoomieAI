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
      return new Response(JSON.stringify({ 
        error: 'Invalid amount' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!payment_method) {
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
    });

    console.log('Creating payment intent for user:', user.id);
    console.log('Amount:', amount, 'Currency:', currency);
    console.log('Payment method types:', payment_method_types);

    // Get or create Stripe customer
    let customerId: string;
    
    // Try to get existing customer from payment_accounts
    const { data: customerData } = await supabaseClient
      .from('payment_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('account_type', 'tenant')
      .maybeSingle();

    if (customerData?.stripe_account_id) {
      customerId = customerData.stripe_account_id;
      console.log('Using existing customer:', customerId);
    } else {
      // Create new Stripe customer
      console.log('Creating new Stripe customer for user:', user.id);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);

      // Save customer ID to database (best effort - don't fail if this errors)
      try {
        await supabaseClient
          .from('payment_accounts')
          .upsert({
            user_id: user.id,
            account_type: 'tenant',
            stripe_account_id: customerId
          });
      } catch (dbError) {
        console.warn('Failed to save customer to database:', dbError);
        // Continue anyway - we have the customer ID
      }
    }

    // Prepare payment intent parameters
    const paymentIntentParams: any = {
      amount: Math.round(amount), // Ensure integer
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: payment_method,
      payment_method_types: payment_method_types || ['acss_debit'],
      confirm: true, // Auto-confirm for PAD
      metadata: {
        ...metadata,
        supabase_user_id: user.id,
        created_at: new Date().toISOString()
      }
    };

    // Add PAD-specific options if using acss_debit
    if (payment_method_types?.includes('acss_debit') || payment_method_options?.acss_debit) {
      paymentIntentParams.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: 'Monthly rent payment',
            transaction_type: 'personal'
          },
          verification_method: 'instant',
          ...payment_method_options?.acss_debit
        }
      };
    }

    console.log('Creating PaymentIntent with params:', {
      ...paymentIntentParams,
      payment_method: '***' // Hide sensitive data in logs
    });

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    console.log('Created payment intent:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Return success response
    return new Response(JSON.stringify({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method,
      next_action: paymentIntent.next_action
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    let errorMessage = 'Failed to create payment intent';
    let statusCode = 500;

    if (error.type === 'StripeCardError') {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = error.message;
      statusCode = 400;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      type: error.type,
      code: error.code,
      details: error.raw?.message || error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode,
    });
  }
});
