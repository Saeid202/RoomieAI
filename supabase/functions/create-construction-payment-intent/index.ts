import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401
      });
    }

    const { product_id, supplier_id, quantity, delivery_address, amount_cad } = await req.json();

    if (!product_id || !amount_cad || !delivery_address) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get or create Stripe customer for buyer
    let customerId: string;
    const { data: existingCustomer } = await supabaseClient
      .from('construction_buyer_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await supabaseClient.from('construction_buyer_profiles').upsert({
        id: user.id,
        email: user.email,
        stripe_customer_id: customerId
      });
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('construction_orders')
      .insert({
        buyer_id: user.id,
        product_id,
        supplier_id,
        quantity: quantity || 1,
        total_cad: amount_cad,
        delivery_address,
        status: 'pending_payment'
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Create payment intent
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(amount_cad * 100), // convert to cents
      currency: 'cad',
      customer: customerId,
      metadata: {
        order_id: order.id,
        buyer_id: user.id,
        product_id,
        supplier_id
      }
    });

    // Store payment intent on order
    await supabaseClient
      .from('construction_orders')
      .update({ stripe_payment_intent_id: pi.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({
      client_secret: pi.client_secret,
      order_id: order.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
