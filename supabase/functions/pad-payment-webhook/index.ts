import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Received webhook event:', event.type, 'ID:', event.id);

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for duplicate events
    const { data: existingEvent } = await supabaseClient
      .from('stripe_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Duplicate event, skipping:', event.id);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Record event
    await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type
      });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.created':
        await handlePaymentIntentCreated(event.data.object as Stripe.PaymentIntent, supabaseClient);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent, supabaseClient);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseClient);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabaseClient);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge, supabaseClient);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge, supabaseClient);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Webhook processing failed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Handler functions
async function handlePaymentIntentCreated(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment intent created:', paymentIntent.id);
  
  // Update payment status to initiated
  const { error } = await supabase
    .from('rental_payments')
    .update({
      status: 'initiated',
      payment_metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        updated_at: new Date().toISOString()
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment status:', error);
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment intent processing:', paymentIntent.id);
  
  // Update payment status to processing
  const { error } = await supabase
    .from('rental_payments')
    .update({
      status: 'processing',
      payment_metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        processing_started_at: new Date().toISOString()
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment status:', error);
  }

  // Send notification to tenant
  await sendPaymentNotification(
    paymentIntent.metadata?.tenant_id,
    'processing',
    'Payment Processing',
    'Your rent payment is being processed. This may take 3-5 business days for bank transfers.',
    supabase
  );
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  
  // Update payment status to succeeded
  const { error } = await supabase
    .from('rental_payments')
    .update({
      status: 'succeeded',
      paid_date: new Date().toISOString(),
      payment_cleared_at: new Date().toISOString(),
      payment_metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        succeeded_at: new Date().toISOString()
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment status:', error);
    return;
  }

  // Send notifications
  await sendPaymentNotification(
    paymentIntent.metadata?.tenant_id,
    'succeeded',
    'Payment Successful',
    'Your rent payment has been successfully processed!',
    supabase
  );

  await sendPaymentNotification(
    paymentIntent.metadata?.landlord_id,
    'received',
    'Payment Received',
    'You have received a rent payment.',
    supabase
  );
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment intent failed:', paymentIntent.id);
  
  const lastError = paymentIntent.last_payment_error;
  
  // Update payment status to failed
  const { error } = await supabase
    .from('rental_payments')
    .update({
      status: 'failed',
      failure_reason: lastError?.message || 'Payment failed',
      failure_code: lastError?.code || 'unknown',
      retry_count: paymentIntent.metadata?.retry_count ? parseInt(paymentIntent.metadata.retry_count) + 1 : 1,
      last_retry_at: new Date().toISOString(),
      payment_metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        error: lastError,
        failed_at: new Date().toISOString()
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating payment status:', error);
    return;
  }

  // Send failure notification
  await sendPaymentNotification(
    paymentIntent.metadata?.tenant_id,
    'failed',
    'Payment Failed',
    `Your rent payment failed: ${lastError?.message || 'Unknown error'}. Please update your payment method and try again.`,
    supabase
  );
}

async function handleChargeSucceeded(charge: Stripe.Charge, supabase: any) {
  console.log('Charge succeeded:', charge.id);
  // Additional charge handling if needed
}

async function handleChargeFailed(charge: Stripe.Charge, supabase: any) {
  console.log('Charge failed:', charge.id);
  // Additional charge handling if needed
}

async function sendPaymentNotification(
  userId: string | undefined,
  type: string,
  title: string,
  message: string,
  supabase: any
) {
  if (!userId) return;

  try {
    await supabase
      .from('payment_notifications')
      .insert({
        user_id: userId,
        notification_type: type,
        title: title,
        message: message,
        is_read: false,
        metadata: {
          created_at: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
