
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// Helper: Transfer rent to landlord (Part F)
// =====================================================
async function transferRentToLandlord({ paymentIntentId, landlordUserId, amount, currency }: {
    paymentIntentId: string,
    landlordUserId: string,
    amount: number,
    currency: string
}) {
    console.log(`Starting transfer for payment intent ${paymentIntentId} to landlord ${landlordUserId}`)

    // 1. Idempotency Check
    const { data: existingTransfer } = await supabase
        .from('landlord_payout_transfers')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .maybeSingle()

    if (existingTransfer) {
        console.log(`Transfer already exists for PI ${paymentIntentId}: ${existingTransfer.stripe_transfer_id}`)
        return
    }

    // 2. Get Landlord Connect Status
    const { data: connectAccount, error: fetchError } = await supabase
        .from('landlord_connect_accounts')
        .select('*')
        .eq('user_id', landlordUserId)
        .maybeSingle()

    if (fetchError || !connectAccount) {
        console.error(`Status check failed for landlord ${landlordUserId}: ${fetchError?.message || 'Not found'}`)
        return
    }

    if (connectAccount.onboarding_status !== 'ready' || !connectAccount.payouts_enabled) {
        console.warn(`Landlord ${landlordUserId} not ready for payouts. Status: ${connectAccount.onboarding_status}`)
        // Optional: Store pending payout record if needed
        return
    }

    try {
        // 3. Create Stripe Transfer
        const transfer = await stripe.transfers.create({
            amount: amount,
            currency: currency || 'cad',
            destination: connectAccount.stripe_account_id,
            metadata: {
                payment_intent_id: paymentIntentId,
                landlord_user_id: landlordUserId
            }
        })

        console.log(`Transfer created: ${transfer.id}`)

        // 4. Persist Record
        const { error: insertError } = await supabase
            .from('landlord_payout_transfers')
            .insert({
                payment_intent_id: paymentIntentId,
                stripe_transfer_id: transfer.id,
                landlord_user_id: landlordUserId,
                amount: amount,
                currency: currency || 'cad',
                status: 'created'
            })

        if (insertError) {
            console.error('Failed to record transfer in DB:', insertError)
        }

    } catch (err: any) {
        console.error('Stripe Transfer failed:', err)
        // Record failure
        await supabase.from('landlord_payout_transfers').insert({
            payment_intent_id: paymentIntentId,
            stripe_transfer_id: `FAILED_${Date.now()}`,
            landlord_user_id: landlordUserId,
            amount: amount,
            currency: currency || 'cad',
            status: 'failed'
        }).catch((e: any) => console.error('Failed to record transfer failure:', e))
    }
}

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    const signature = req.headers.get('Stripe-Signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
        return new Response('Missing signature or secret', { status: 400 })
    }

    let event
    try {
        const body = await req.text()
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider)
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Idempotency: Store and check event_id
    const { data: existingEvent } = await supabase
        .from('stripe_webhook_events')
        .select('event_id')
        .eq('event_id', event.id)
        .maybeSingle()

    if (existingEvent) {
        console.log(`Event ${event.id} already processed. Skipping.`)
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Mark as processing
    await supabase.from('stripe_webhook_events').insert({ event_id: event.id })

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object
                const paymentId = paymentIntent.metadata.payment_id

                if (!paymentId) {
                    console.error('Missing payment_id in metadata')
                    break
                }

                // 1. Fetch current payment status to ensure idempotency
                const { data: paymentRecord, error: fetchError } = await supabase
                    .from('rental_payments')
                    .select('*')
                    .eq('id', paymentId)
                    .single()

                if (fetchError || !paymentRecord) {
                    console.error('Payment record not found:', paymentId)
                    break
                }

                if (paymentRecord.payment_status === 'succeeded') {
                    console.log('Payment already marked as succeeded, skipping.')
                    break
                }

                // 2. Update Payment Status -> 'paid'
                const { error: updateError } = await supabase
                    .from('rental_payments')
                    .update({
                        payment_status: 'paid',
                        payment_date: new Date().toISOString()
                    })
                    .eq('id', paymentId)

                if (updateError) {
                    console.error('Failed to update payment status:', updateError)
                    throw updateError
                }

                // 3. Update Rent Ledger / Installment using metadata.rent_installment_id
                const rentInstallmentId = paymentIntent.metadata.rent_installment_id; // mapped from rent_ledger_id

                if (rentInstallmentId) {
                    console.log(`Processing Rent Installment: ${rentInstallmentId}`);

                    // Fetch existing status to prevent double payment
                    const { data: existingLedger, error: ledgerFetchError } = await supabase
                        .from('rent_ledgers')
                        .select('*')
                        .eq('id', rentInstallmentId)
                        .single();

                    if (!ledgerFetchError && existingLedger) {
                        if (existingLedger.status === 'paid') {
                            console.log(`Rent installment ${rentInstallmentId} already paid. Skipping update.`);
                        } else {
                            // Update row with payment details
                            const { error: ledgerUpdateError } = await supabase
                                .from('rent_ledgers')
                                .update({
                                    status: 'paid',
                                    payment_id: paymentId,
                                    updated_at: new Date().toISOString(),
                                    // New columns per requirements
                                    paid_at: new Date().toISOString(),
                                    stripe_payment_intent_id: paymentIntent.id,
                                    amount_paid: paymentIntent.amount_received / 100,
                                    payment_method: 'manual' // or derive from paymentIntent.payment_method_types[0] if needed, but manual/auto is logical distinct
                                })
                                .eq('id', rentInstallmentId);

                            if (ledgerUpdateError) {
                                console.error(`Failed to update rent_ledgers: ${ledgerUpdateError.message}`);
                            } else {
                                console.log(`Rent installment ${rentInstallmentId} marked as PAID.`);
                            }
                        }
                    } else {
                        console.error(`Rent ledger ${rentInstallmentId} not found or query error.`);
                    }
                }

                // 4. Handle Landlord Payout Logic (Move to pending balance)
                // (Existing logic preserved below)
                // 4. Handle Landlord Payout Logic (Part F)
                const landlordUserId = paymentIntent.metadata.landlord_user_id || paymentIntent.metadata.landlord_id
                const isRent = paymentIntent.metadata.purpose === 'rent' || paymentIntent.metadata.rent_ledger_id

                if (landlordUserId && isRent) {
                    // Trigger transfer
                    await transferRentToLandlord({
                        paymentIntentId: paymentIntent.id,
                        landlordUserId: landlordUserId,
                        amount: paymentIntent.amount_received, // Transfer the full received amount
                        currency: paymentIntent.currency
                    })
                }

                break
            }

            case 'account.updated': {
                const account = event.data.object as Stripe.Account
                const userId = account.metadata?.user_id

                if (!userId) {
                    console.log(`No user_id in metadata for account ${account.id}`)
                    break
                }

                // Map onboarding_status
                let onboarding_status = 'in_progress'
                const currentlyDue = account.requirements?.currently_due || []

                if (account.payouts_enabled && account.details_submitted && currentlyDue.length === 0) {
                    onboarding_status = 'ready'
                } else if (currentlyDue.length > 0) {
                    onboarding_status = 'restricted'
                }

                const { error: updateError } = await supabase
                    .from('landlord_connect_accounts')
                    .update({
                        onboarding_status,
                        charges_enabled: account.charges_enabled,
                        payouts_enabled: account.payouts_enabled,
                        details_submitted: account.details_submitted,
                        requirements_currently_due: currentlyDue,
                        requirements_eventually_due: account.requirements?.eventually_due || [],
                        last_stripe_sync_at: new Date().toISOString()
                    })
                    .eq('stripe_account_id', account.id)

                if (updateError) {
                    console.error('Failed to update landlord connect status:', updateError)
                } else {
                    console.log(`Updated connect account status for user ${userId} to ${onboarding_status}`)
                }

                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object
                const paymentId = paymentIntent.metadata.payment_id
                const failReason = paymentIntent.last_payment_error?.message || 'Payment failed'

                if (paymentId) {
                    await supabase.from('rental_payments').update({
                        payment_status: 'failed',
                        notes: `Failed: ${failReason}`
                    }).eq('id', paymentId)

                    // Revert ledger if needed
                    const { data: record } = await supabase.from('rental_payments').select('rent_ledger_id').eq('id', paymentId).single()
                    if (record?.rent_ledger_id) {
                        await supabase.from('rent_ledgers').update({ status: 'unpaid' }).eq('id', record.rent_ledger_id)
                    }
                }
                break
            }

            case 'charge.refunded': {
                // Handle refunds if necessary
                break
            }

            default:
                console.log(`Unhandled event type ${event.type}`)
        }
    } catch (err) {
        console.error('Error processing event:', err)
        // Return 200 even on internal error to stop Stripe retries (as per 'Harden' requirement)
        return new Response(JSON.stringify({ received: true, error: err.message }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
})
