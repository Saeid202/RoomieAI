import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.2.0?target=deno'

// =====================================================
// CORS Headers
// =====================================================
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// =====================================================
// Helper: Safe JSON Response (Status 200 for errors as requested)
// =====================================================
function jsonResponse(data: any, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
    )
}

// =====================================================
// Main Handler - Wrapped in try/catch for safety
// =====================================================
serve(async (req) => {
    try {
        console.log("landlord-onboarding START")

        // Handle CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders })
        }

        // =====================================================
        // 1. Validate Environment Variables
        // =====================================================
        const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")
        const supabaseUrl = Deno.env.get("SUPABASE_URL")
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

        if (!stripeSecret || !supabaseUrl || !serviceRoleKey) {
            console.error("Missing server configuration")
            return jsonResponse({ error: "Missing server configuration" }, 200)
        }

        // Initialize Clients
        const stripe = new Stripe(stripeSecret, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        })

        const supabase = createClient(supabaseUrl, serviceRoleKey)

        // =====================================================
        // 2. Authentication
        // =====================================================
        const authHeader = req.headers.get("authorization")
        if (!authHeader) {
            console.error("Missing authorization header")
            return jsonResponse({ error: "Missing authorization header" }, 200) // Or 401 if stricter, but sticking to safe protocol
        }

        const token = authHeader.replace('Bearer ', '').trim()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user || !user.email) {
            console.error("Auth failed:", authError)
            return jsonResponse({ error: "Unauthorized" }, 200)
        }

        console.log(`User authenticated: ${user.email} (${user.id})`)

        // =====================================================
        // 3. Query Landlord Account (using payment_accounts)
        // =====================================================
        // We use payment_accounts table which stores stripe_account_id for landlords
        const { data: landlordAccount, error: dbError } = await supabase
            .from("payment_accounts")
            .select("*")
            .eq("user_id", user.id)
            .eq("account_type", "landlord")
            .maybeSingle()

        if (dbError) {
            console.error("Database query error:", dbError)
            return jsonResponse({ error: `Database error: ${dbError.message}` }, 200)
        }

        // =====================================================
        // 4. Create/Get Stripe Account ID
        // =====================================================
        let stripeAccountId = landlordAccount?.stripe_account_id

        if (!stripeAccountId) {
            console.log("Creating new Stripe Express account...")

            try {
                // Create Stripe Account
                const account = await stripe.accounts.create({
                    type: "express",
                    country: "CA",
                    email: user.email,
                    capabilities: {
                        transfers: { requested: true },
                        card_payments: { requested: true },
                    },
                    metadata: {
                        user_id: user.id,
                        env: "production"
                    }
                })

                stripeAccountId = account.id
                console.log(`Stripe Account Created: ${stripeAccountId}`)

                // Save to Database (Upsert safe)
                // If payment_accounts row exists, update it. If not, insert it.
                if (landlordAccount) {
                    const { error: updateError } = await supabase
                        .from("payment_accounts")
                        .update({
                            stripe_account_id: stripeAccountId,
                            stripe_account_status: 'onboarding',
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", landlordAccount.id)

                    if (updateError) {
                        console.error("Failed to update payment_accounts:", updateError)
                        return jsonResponse({ error: "Failed to save Stripe account ID" }, 200)
                    }
                } else {
                    const { error: insertError } = await supabase
                        .from("payment_accounts")
                        .insert({
                            user_id: user.id,
                            account_type: "landlord",
                            stripe_account_id: stripeAccountId,
                            stripe_account_status: 'onboarding',
                            balance: 0,
                            currency: "CAD",
                            status: "active"
                        })

                    if (insertError) {
                        console.error("Failed to insert payment_accounts:", insertError)
                        return jsonResponse({ error: "Failed to create payment account record" }, 200)
                    }
                }

            } catch (stripeErr: any) {
                console.error("Stripe API Error (Create Account):", stripeErr)
                return jsonResponse({ error: `Stripe create error: ${stripeErr.message}` }, 200)
            }
        } else {
            console.log(`Using existing Stripe Account: ${stripeAccountId}`)
        }

        // =====================================================
        // 5. Create Account Link
        // =====================================================
        // Stripe requires HTTPS for live mode. If origin is localhost (HTTP), use production URL
        let origin = req.headers.get("origin") || "https://roomieai.ca"

        // Force HTTPS for Stripe redirects - localhost won't work with live Stripe keys
        if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            console.log("Detected localhost origin, using production URL for Stripe redirect")
            origin = "https://roomieai.ca"
        }

        try {
            console.log(`Creating Account Link with origin: ${origin}`)
            const link = await stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${origin}/dashboard/landlord/payments`,
                return_url: `${origin}/dashboard/landlord/payments?onboarding=complete`,
                type: "account_onboarding",
            })

            console.log("Account Link created successfully.")
            return jsonResponse({ url: link.url })

        } catch (linkErr: any) {
            console.error("Stripe API Error (Account Link):", linkErr)
            return jsonResponse({ error: `Stripe link error: ${linkErr.message}` }, 200)
        }

    } catch (unexpectedError: any) {
        // =====================================================
        // Safety Net: Catch ALL unhandled errors
        // =====================================================
        console.error("CRITICAL UNEXPECTED ERROR:", unexpectedError)
        return jsonResponse({
            error: unexpectedError.message || "An unexpected error occurred"
        }, 200)
    }
})
