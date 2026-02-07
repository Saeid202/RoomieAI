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
        return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
        const signature = req.headers.get('stripe-signature')
        if (!signature) return jsonResponse({ error: 'Missing signature' }, 400)

        const body = await req.text()
        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return jsonResponse({ error: 'Invalid signature' }, 400)
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Idempotency Check
        const { data: existingEvent } = await supabaseAdmin
            .from('stripe_webhook_events')
            .select('id')
            .eq('event_id', event.id)
            .maybeSingle()

        if (existingEvent) {
            console.log(`⚠️ Event ${event.id} already processed. Skipping.`)
            return jsonResponse({ received: true, duplicate: true })
        }

        console.log(`🔔 Processing Webhook: ${event.type} (${event.id})`)

        // 2. Handle Events
        switch (event.type) {
            case 'payment_intent.processing': {
                const pi = event.data.object as Stripe.PaymentIntent
                const { rent_ledger_id } = pi.metadata

                console.log(`⏳ Payment processing: ${pi.id}`)

                // Update payment record to processing
                await supabaseAdmin
                    .from('rental_payments')
                    .update({
                        payment_status: 'processing',
                        updated_at: new Date().toISOString()
                    })
                    .eq('payment_intent_id', pi.id)

                // Update ledger to processing if present
                if (rent_ledger_id) {
                    await supabaseAdmin
                        .from('rent_ledgers')
                        .update({
                            status: 'processing',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', rent_ledger_id)
                }
                break
            }

            case 'payment_intent.succeeded': {
                const pi = event.data.object as Stripe.PaymentIntent
                const { landlord_id, rent_ledger_id } = pi.metadata

                console.log(`✅ Payment succeeded: ${pi.id}`)

                // Update payment status to paid
                await supabaseAdmin
                    .from('rental_payments')
                    .update({
                        payment_status: 'paid',
                        processing_status: 'clearing',
                        paid_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('payment_intent_id', pi.id)

                // Update the ledger row to 'paid' with credit reporting metrics
                if (rent_ledger_id) {
                    const { data: ledger } = await supabaseAdmin
                        .from('rent_ledgers')
                        .select('due_date, rent_amount')
                        .eq('id', rent_ledger_id)
                        .single()

                    if (ledger) {
                        const paidAt = new Date()
                        const dueDate = new Date(ledger.due_date)

                        // Treat as on-time if paid on or before the due date (ignoring time)
                        const paidDateOnly = new Date(paidAt.getFullYear(), paidAt.getMonth(), paidAt.getDate())
                        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

                        const onTime = paidDateOnly <= dueDateOnly
                        const diffInMs = Math.max(0, paidDateOnly.getTime() - dueDateOnly.getTime())
                        const daysLate = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

                        console.log(`📊 Reporting Metrics: OnTime=${onTime}, DaysLate=${daysLate}, Method=${pi.metadata.payment_method_type}`)

                        await supabaseAdmin
                            .from('rent_ledgers')
                            .update({
                                status: 'paid',
                                amount_paid: pi.amount_received / 100,
                                paid_at: paidAt.toISOString(),
                                on_time: onTime,
                                days_late: daysLate,
                                payment_method_type: pi.metadata.payment_method_type || 'credit',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', rent_ledger_id)
                    } else {
                        // Fallback if ledger fetch fails
                        await supabaseAdmin
                            .from('rent_ledgers')
                            .update({
                                status: 'paid',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', rent_ledger_id)
                    }
                }

                // Trigger balance update ONLY on success
                if (landlord_id) {
                    const amount = (pi.amount_received / 100) // Convert from cents
                    console.log(`💰 Adding ${amount} to pending balance for landlord ${landlord_id}`)
                    await supabaseAdmin.rpc('update_landlord_wallet_balances', {
                        p_user_id: landlord_id,
                        p_pending_delta: amount,
                        p_available_delta: 0,
                        p_paid_out_delta: 0
                    })
                }
                break
            }

            case 'payment_intent.payment_failed':
            case 'charge.failed': {
                const obj = event.data.object as any
                const pi_id = obj.payment_intent || obj.id
                const metadata = obj.metadata || {}
                const { rent_ledger_id } = metadata

                console.log(`❌ Payment failed: ${pi_id}`)

                // Update payment record to failed
                await supabaseAdmin
                    .from('rental_payments')
                    .update({
                        payment_status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('payment_intent_id', pi_id)

                // Mark ledger as failed if it was a ledger payment
                if (rent_ledger_id) {
                    await supabaseAdmin
                        .from('rent_ledgers')
                        .update({
                            status: 'failed',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', rent_ledger_id)
                }
                break
            }

            case 'charge.succeeded': {
                const charge = event.data.object as Stripe.Charge
                // For PAD, charge.succeeded means it's initiated
                if (charge.payment_method_details?.type === 'acss_debit') {
                    console.log(`🏦 PAD Charge initiated: ${charge.id}`)
                    await supabaseAdmin
                        .from('rental_payments')
                        .update({
                            payment_status: 'processing',
                            updated_at: new Date().toISOString()
                        })
                        .eq('payment_intent_id', charge.payment_intent)
                }
                break
            }

            case 'payout.paid': {
                const payout = event.data.object as Stripe.Payout
                // For Connect payouts, we need to find the landlord account
                const stripeAccountId = event.account

                if (stripeAccountId) {
                    const { data: account } = await supabaseAdmin
                        .from('payment_accounts')
                        .select('user_id')
                        .eq('stripe_account_id', stripeAccountId)
                        .maybeSingle()

                    if (account) {
                        const amount = (payout.amount / 100)
                        console.log(`Recording payout of ${amount} for user ${account.user_id}`)

                        await supabaseAdmin.rpc('update_landlord_wallet_balances', {
                            p_user_id: account.user_id,
                            p_pending_delta: 0,
                            p_available_delta: -amount,
                            p_paid_out_delta: amount
                        })

                        // Update any payments that were marked 'paid' to 'paid_to_landlord'
                        // (Rough approximation: update most recent paid payments)
                        // In a real system, we'd link specific payments to payouts.
                    }
                }
                break
            }

            case 'account.updated': {
                // Keep existing logic for onboarding status
                const account = event.data.object as Stripe.Account
                let status = 'onboarding'
                if (account.details_submitted && account.charges_enabled) {
                    status = 'completed'
                } else if (account.requirements?.disabled_reason) {
                    status = 'restricted'
                }

                await supabaseAdmin
                    .from('payment_accounts')
                    .update({
                        stripe_account_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_account_id', account.id)
                break
            }
        }

        // 3. Record processed event
        await supabaseAdmin
            .from('stripe_webhook_events')
            .insert({
                event_id: event.id,
                event_type: event.type
            })

        return jsonResponse({ received: true })

    } catch (err: any) {
        console.error('Critical Webhook Error:', err)
        return jsonResponse({ error: err.message }, 500)
    }
})

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
}
