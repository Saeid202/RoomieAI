
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const body = await req.json()
        const { application_id, amount, note, compliance_confirmation: bodyCompliance } = body
        const payment_source = application_id ? 'application' : 'manual'

        let amount_cents = 0
        let total_amount = 0
        let metadata: any = { user_id: user.id, payment_source }

        // Base payment record matching the rental_payments table schema
        let paymentRecord: any = {
            tenant_id: user.id,
            currency: 'CAD',
            payment_source,
            payment_status: 'pending',
            transaction_id: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            created_at: new Date().toISOString()
        }

        if (payment_source === 'application') {
            const { data: application, error: appError } = await supabaseClient
                .from('rental_applications')
                .select('*, properties(*, profiles(*))').eq('id', application_id).eq('applicant_id', user.id).single()

            if (appError || !application) {
                return new Response(JSON.stringify({ error: 'Application record not found' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }

            const approved_rent = application.approved_rent_amount ?? application.properties?.monthly_rent ?? 0
            const deposit = application.deposit_amount ?? application.properties?.security_deposit ?? 0
            total_amount = Number(approved_rent) + Number(deposit)
            amount_cents = Math.round(total_amount * 100)

            metadata.application_id = application.id
            paymentRecord = {
                ...paymentRecord,
                application_id: application.id,
                property_id: application.property_id,
                landlord_id: application.properties?.user_id,
                amount: total_amount,
                description: `Rent & Deposit for ${application.properties?.listing_title}`,
                payment_type: 'combined_initial',
                payment_method: 'credit_card',
                recipient_email: (application.properties as any)?.profiles?.email || null
            }
        } else {
            const { data: wallet, error: walletError } = await supabaseClient
                .from('seeker_digital_wallet_configs')
                .select('*').eq('user_id', user.id).maybeSingle()

            if (walletError || !wallet) {
                return new Response(JSON.stringify({ error: 'Digital Wallet Not Configured' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }

            const isCompliant = bodyCompliance === true || wallet.compliance_confirmation === true;
            if (!isCompliant) {
                return new Response(JSON.stringify({ error: 'Compliance Not Confirmed' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }

            total_amount = amount
            amount_cents = Math.round(total_amount * 100)

            metadata.recipient_email = wallet.recipient_email
            metadata.recipient_type = wallet.recipient_type
            if (note) metadata.note = note

            const { data: landlordProfile } = await supabaseClient
                .from('profiles')
                .select('id').eq('email', wallet.recipient_email).maybeSingle()

            paymentRecord = {
                ...paymentRecord,
                amount: total_amount,
                note: note || null,
                description: note || `Manual rent payment`,
                payment_type: 'rent_payment',
                payment_method: wallet.payment_method_type === 'debit' ? 'debit_card' : 'credit_card',
                landlord_id: landlordProfile?.id || null,
                recipient_email: wallet.recipient_email
            }
        }

        if (amount_cents < 50) {
            return new Response(JSON.stringify({ error: 'Invalid Amount: Minimum payment is 0.50 CAD' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const stripe_key = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripe_key) {
            return new Response(JSON.stringify({ error: 'Stripe Secret Missing' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        // 1. Create Payment Record BEFORE calling Stripe
        const { data: insertedRecord, error: insertError } = await supabaseClient
            .from('rental_payments')
            .insert(paymentRecord)
            .select()
            .single()

        if (insertError) {
            console.error('DB Pre-Insert Error:', insertError)
            return new Response(JSON.stringify({ error: `Database initialization failed: ${insertError.message}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        const stripe = new Stripe(stripe_key, { apiVersion: '2023-10-16' })

        try {
            // 2. Call Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount_cents,
                currency: 'cad',
                automatic_payment_methods: { enabled: true },
                metadata: { ...metadata, payment_id: insertedRecord.id }
            })

            // 3. Update Record with external_transaction_id (payment_intent_id)
            await supabaseClient
                .from('rental_payments')
                .update({
                    payment_intent_id: paymentIntent.id
                })
                .eq('id', insertedRecord.id)

            return new Response(JSON.stringify({
                client_secret: paymentIntent.client_secret,
                payment_id: insertedRecord.id
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } catch (stripeErr: any) {
            console.error('Stripe PI Creation Error:', stripeErr)
            // Update record to failed if Stripe call fails
            await supabaseClient
                .from('rental_payments')
                .update({ payment_status: 'failed' })
                .eq('id', insertedRecord.id)

            throw stripeErr
        }

    } catch (err: any) {
        return new Response(JSON.stringify({ error: `Server Error: ${err.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
