import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        })
    }

    try {
        // 1. Validate Webhook Signature
        const signature = req.headers.get('stripe-signature')
        if (!signature) {
            return new Response(
                JSON.stringify({ error: 'Missing stripe-signature header' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        const body = await req.text()
        let event

        try {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(
                JSON.stringify({ error: 'Webhook signature verification failed', details: err.message }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 2. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`🔔 Webhook Event Received: ${event.type}`)

        // 3. Handle PAYMENT_INTENT.SUCCEEDED
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const { application_id, payment_source } = paymentIntent.metadata

            console.log(`✅ Payment succeeded. Mode: ${payment_source}. Intent: ${paymentIntent.id}`)

            // Update Payment Record
            const { error: paymentError } = await supabaseAdmin
                .from('rental_payments')
                .update({
                    payment_status: 'paid',
                    processing_status: 'processing',
                    paid_at: new Date().toISOString(),
                    processed_at: new Date().toISOString()
                })
                .eq('payment_intent_id', paymentIntent.id)

            if (paymentError) {
                console.error('Error updating rental_payments:', paymentError)
            }

            // Application-specific updates
            if (payment_source === 'application' && application_id) {
                const { error: appError } = await supabaseAdmin
                    .from('rental_applications')
                    .update({
                        step_4_completed: true,
                        payment_status: 'paid'
                    })
                    .eq('id', application_id)

                if (appError) {
                    console.error('Error updating rental_applications:', appError)
                }
            }
        }

        // 4. Handle PAYMENT_INTENT.PAYMENT_FAILED
        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            console.log(`❌ Payment failed: ${paymentIntent.id}`)

            const { error: paymentError } = await supabaseAdmin
                .from('rental_payments')
                .update({
                    payment_status: 'failed'
                })
                .eq('payment_intent_id', paymentIntent.id)

            if (paymentError) {
                console.error('Error updating rental_payments (failed):', paymentError)
            }
        }

        // 5. Handle ACCOUNT.UPDATED (Stripe Connect)
        if (event.type === 'account.updated') {
            const account = event.data.object as Stripe.Account
            console.log(`👤 Account updated: ${account.id}. Details Submitted: ${account.details_submitted}, Charges Enabled: ${account.charges_enabled}`)

            let status = 'onboarding'
            if (account.details_submitted && account.charges_enabled) {
                status = 'completed'
            } else if (account.requirements?.disabled_reason) {
                status = 'restricted'
            }

            const updateData: any = {
                stripe_account_status: status,
                updated_at: new Date().toISOString()
            }

            if (status === 'completed') {
                updateData.stripe_onboarding_completed_at = new Date().toISOString()
            }

            const { error: accountError } = await supabaseAdmin
                .from('payment_accounts')
                .update(updateData)
                .eq('stripe_account_id', account.id)

            if (accountError) {
                console.error(`Error updating payment_accounts for ${account.id}:`, accountError)
            } else {
                console.log(`✅ Successfully updated status to ${status} for ${account.id}`)
            }
        }

        // 6. Return Success Response
        return new Response(
            JSON.stringify({ received: true, event_type: event.type }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )

    } catch (err: any) {
        console.error('Webhook processing error:', err)
        return new Response(
            JSON.stringify({ error: err.message || 'Webhook processing failed' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
