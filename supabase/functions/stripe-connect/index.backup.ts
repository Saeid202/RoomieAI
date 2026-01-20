import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.2.0?target=deno";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

// Initialize Supabase correctly inside the Edge Function using service role credentials
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeSecret) throw new Error("Missing STRIPE_SECRET_KEY");

        const stripe = new Stripe(stripeSecret, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // 1. Authentication
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return jsonResponse({ error: "Missing authorization header" }, 401);

        const token = authHeader.replace("Bearer ", "").trim();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return jsonResponse({ error: "Unauthorized", details: authError?.message }, 401);
        }

        // 2. Parse Action
        const body = await req.json().catch(() => ({}));
        const action = body.action;

        if (!action) {
            return jsonResponse({ error: "No action provided. Use {action: 'onboarding-link'|'status'|'login-link'}" }, 400);
        }

        console.log(`[Stripe Connect] Action: ${action} | User: ${user.id}`);

        // --- Logic: onboarding-link ---
        if (action === "onboarding-link") {
            // Get or create landlord account record
            let { data: account, error: fetchError } = await supabase
                .from("landlord_connect_accounts")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let stripeAccountId = account?.stripe_account_id;

            if (!stripeAccountId) {
                console.log(`[Stripe Connect] Creating new Express account for ${user.id}`);
                const stripeAccount = await stripe.accounts.create({
                    type: "express",
                    country: "CA",
                    email: user.email,
                    capabilities: { transfers: { requested: true } },
                    metadata: { user_id: user.id },
                });
                stripeAccountId = stripeAccount.id;

                const { error: insertError } = await supabase
                    .from("landlord_connect_accounts")
                    .insert({
                        user_id: user.id,
                        stripe_account_id: stripeAccountId,
                        onboarding_status: "in_progress",
                    });

                if (insertError) throw insertError;
            }

            // Generate Link
            const origin = req.headers.get("origin") || "https://roomieai.ca";
            const accountLink = await stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${origin}/dashboard/landlord/payments?onboarding=refresh`,
                return_url: `${origin}/dashboard/landlord/payments?onboarding=return`,
                type: "account_onboarding",
            });

            return jsonResponse({ url: accountLink.url });
        }

        // --- Logic: login-link ---
        if (action === "login-link") {
            const { data: account, error: fetchError } = await supabase
                .from("landlord_connect_accounts")
                .select("stripe_account_id")
                .eq("user_id", user.id)
                .single();

            if (fetchError || !account) {
                return jsonResponse({ error: "Connect account not found. Please setup first." }, 404);
            }

            const loginLink = await stripe.accounts.createLoginLink(account.stripe_account_id);
            return jsonResponse({ url: loginLink.url });
        }

        // --- Logic: status ---
        if (action === "status") {
            const { data: dbAccount, error: fetchError } = await supabase
                .from("landlord_connect_accounts")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;
            if (!dbAccount) return jsonResponse({ onboarding_status: "not_started" });

            // Retrieve latest from Stripe
            const stripeAccount = await stripe.accounts.retrieve(dbAccount.stripe_account_id);

            let onboarding_status = "in_progress";
            if (stripeAccount.payouts_enabled && stripeAccount.details_submitted && stripeAccount.requirements?.currently_due?.length === 0) {
                onboarding_status = "ready";
            } else if (stripeAccount.requirements?.currently_due?.length > 0) {
                onboarding_status = "restricted";
            }

            // Sync back to DB
            const { error: updateError } = await supabase
                .from("landlord_connect_accounts")
                .update({
                    onboarding_status,
                    charges_enabled: stripeAccount.charges_enabled,
                    payouts_enabled: stripeAccount.payouts_enabled,
                    details_submitted: stripeAccount.details_submitted,
                    requirements_currently_due: stripeAccount.requirements?.currently_due || [],
                    requirements_eventually_due: stripeAccount.requirements?.eventually_due || [],
                    last_stripe_sync_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

            if (updateError) throw updateError;
            return jsonResponse({
                onboarding_status,
                stripe_account_id: dbAccount.stripe_account_id,
                payouts_enabled: stripeAccount.payouts_enabled
            });
        }

        return jsonResponse({ error: `Action '${action}' not supported` }, 404);

    } catch (err: any) {
        console.error(`[Stripe Connect Error]`, err);
        return jsonResponse({ error: err.message || "Internal server error" }, 500);
    }
});
