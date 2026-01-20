import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

console.log("🔵 stripe-connect function invoked");

console.log("🔍 ENV CHECK:", {
    hasStripeKey: !!Deno.env.get("STRIPE_SECRET_KEY"),
    hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
    hasServiceRole: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
    console.log("🔵 Request received:", req.method);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Parse request body
        const body = await req.json();
        const action = body.action || "onboarding-link"; // Default action
        console.log("🔵 Action:", action);

        // Get user from Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "missing_authorization" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Get user from JWT
        const jwt = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

        if (userError || !user) {
            console.error("🔴 User authentication failed:", userError);
            return new Response(
                JSON.stringify({ error: "unauthorized" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        console.log("🟢 User authenticated:", user.id);

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

        if (!stripeKey) {
            console.error("🔴 STRIPE_SECRET_KEY not configured");
            return new Response(
                JSON.stringify({
                    error: "stripe_key_missing",
                    details: "STRIPE_SECRET_KEY environment variable not set",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2023-10-16",
        });

        // Get origin for redirect URLs
        const origin = req.headers.get("origin") || "http://localhost:5173";
        console.log("🔵 Origin:", origin);

        // Determine if we're using live or test mode
        const isLiveMode = stripeKey.startsWith("sk_live_");
        console.log("🔵 Stripe mode:", isLiveMode ? "LIVE" : "TEST");

        // For live mode, ensure HTTPS URLs and production domain
        let redirectBase = origin;
        if (isLiveMode) {
            // Always force production URL in live mode to prevent redirect issues
            redirectBase = "https://roomieai.ca";
            console.log("🌐 Live mode: Forcing production redirect URL:", redirectBase);
        } else if (origin.startsWith("http://localhost")) {
            console.log("💻 Test mode: Using localhost redirect");
        }

        // Check for existing Stripe Connect account
        const { data: existingAccount, error: dbError } = await supabase
            .from("landlord_connect_accounts")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (dbError) {
            console.error("🔴 Database error:", dbError);
        }

        console.log("🔵 Existing account:", existingAccount);

        // Handle different actions
        if (action === "status") {
            // Return current status from database
            if (!existingAccount) {
                return new Response(
                    JSON.stringify({
                        onboarding_status: "not_started",
                        stripe_account_id: null,
                    }),
                    {
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }

            return new Response(
                JSON.stringify({
                    onboarding_status: existingAccount.onboarding_status,
                    stripe_account_id: existingAccount.stripe_account_id,
                    charges_enabled: existingAccount.charges_enabled,
                    payouts_enabled: existingAccount.payouts_enabled,
                    details_submitted: existingAccount.details_submitted,
                }),
                {
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        if (action === "refresh-status") {
            // Fetch latest status from Stripe and update database
            if (!existingAccount?.stripe_account_id) {
                return new Response(
                    JSON.stringify({
                        onboarding_status: "not_started",
                        stripe_account_id: null,
                    }),
                    {
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }

            try {
                // Fetch account from Stripe
                const account = await stripe.accounts.retrieve(existingAccount.stripe_account_id);

                // Determine onboarding status
                let onboarding_status = "in_progress";
                const currentlyDue = account.requirements?.currently_due || [];

                if (account.payouts_enabled && account.details_submitted && currentlyDue.length === 0) {
                    onboarding_status = "ready";
                } else if (currentlyDue.length > 0) {
                    onboarding_status = "restricted";
                }

                // Update database
                const { error: updateError } = await supabase
                    .from("landlord_connect_accounts")
                    .update({
                        onboarding_status,
                        charges_enabled: account.charges_enabled,
                        payouts_enabled: account.payouts_enabled,
                        details_submitted: account.details_submitted,
                        requirements_currently_due: currentlyDue,
                        requirements_eventually_due: account.requirements?.eventually_due || [],
                        last_stripe_sync_at: new Date().toISOString(),
                    })
                    .eq("stripe_account_id", existingAccount.stripe_account_id);

                if (updateError) {
                    console.error("🔴 Failed to update account status:", updateError);
                }

                console.log("🟢 Account status refreshed:", onboarding_status);

                return new Response(
                    JSON.stringify({
                        onboarding_status,
                        stripe_account_id: existingAccount.stripe_account_id,
                        charges_enabled: account.charges_enabled,
                        payouts_enabled: account.payouts_enabled,
                        details_submitted: account.details_submitted,
                    }),
                    {
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );

            } catch (err) {
                console.error("🔴 Failed to refresh status from Stripe:", err);
                return new Response(
                    JSON.stringify({
                        error: "refresh_failed",
                        details: err instanceof Error ? err.message : String(err),
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }
        }

        if (action === "login-link") {
            // Create login link for existing account
            if (!existingAccount?.stripe_account_id) {
                return new Response(
                    JSON.stringify({ error: "no_stripe_account" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }

            try {
                const loginLink = await stripe.accounts.createLoginLink(
                    existingAccount.stripe_account_id
                );

                return new Response(
                    JSON.stringify({ url: loginLink.url }),
                    {
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            } catch (err) {
                console.error("🔴 Login link creation failed:", err);
                return new Response(
                    JSON.stringify({
                        error: "login_link_failed",
                        details: err instanceof Error ? err.message : String(err),
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }
        }

        if (action === "create-account-session") {
            let stripeAccountId = existingAccount?.stripe_account_id;

            // Create new Stripe account if needed
            if (!stripeAccountId) {
                try {
                    console.log("🟡 Creating new Stripe Express account for embedded flow...");

                    const account = await stripe.accounts.create({
                        type: "express",
                        country: "CA",
                        capabilities: {
                            transfers: { requested: true },
                        },
                        metadata: {
                            user_id: user.id,
                        },
                    });

                    stripeAccountId = account.id;
                    console.log("🟢 Stripe account created:", stripeAccountId);

                    // Save to database
                    await supabase
                        .from("landlord_connect_accounts")
                        .insert({
                            user_id: user.id,
                            stripe_account_id: stripeAccountId,
                            onboarding_status: "in_progress",
                            charges_enabled: false,
                            payouts_enabled: false,
                            details_submitted: false,
                        });

                } catch (err) {
                    console.error("🔴 Stripe account creation failed:", err);
                    return new Response(
                        JSON.stringify({ error: "stripe_account_creation_failed" }),
                        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
                    );
                }
            }

            try {
                console.log("🟡 Creating Stripe account session...");

                const accountSession = await stripe.accountSessions.create({
                    account: stripeAccountId,
                    components: {
                        account_onboarding: { enabled: true },
                        payments: { enabled: true },
                        payouts: { enabled: true },
                    },
                });

                console.log("🟢 Stripe account session created");

                return new Response(
                    JSON.stringify({ client_secret: accountSession.client_secret }),
                    { headers: { "Content-Type": "application/json", ...corsHeaders } }
                );

            } catch (err) {
                console.error("🔴 Stripe accountSession creation failed:", err);
                return new Response(
                    JSON.stringify({
                        error: "stripe_session_failed",
                        details: err instanceof Error ? err.message : String(err),
                    }),
                    { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
                );
            }
        }

        if (action === "onboarding-link") {
            let stripeAccountId = existingAccount?.stripe_account_id;

            // Create new Stripe account if needed
            if (!stripeAccountId) {
                try {
                    console.log("🟡 Creating new Stripe Express account...");

                    const account = await stripe.accounts.create({
                        type: "express",
                        country: "CA",
                        capabilities: {
                            transfers: { requested: true },
                        },
                        metadata: {
                            user_id: user.id,
                        },
                    });

                    stripeAccountId = account.id;
                    console.log("🟢 Stripe account created:", stripeAccountId);

                    // Save to database
                    const { error: insertError } = await supabase
                        .from("landlord_connect_accounts")
                        .insert({
                            user_id: user.id,
                            stripe_account_id: stripeAccountId,
                            onboarding_status: "in_progress",
                            charges_enabled: false,
                            payouts_enabled: false,
                            details_submitted: false,
                        });

                    if (insertError) {
                        console.error("🔴 Failed to save account to DB:", insertError);
                    }

                } catch (err) {
                    console.error("🔴 Stripe account creation failed:", err);
                    return new Response(
                        JSON.stringify({
                            error: "stripe_account_creation_failed",
                            details: err instanceof Error ? err.message : String(err),
                        }),
                        {
                            status: 400,
                            headers: { "Content-Type": "application/json", ...corsHeaders },
                        }
                    );
                }
            }

            // Create account link (always create fresh link as they expire)
            try {
                console.log("🟡 Creating Stripe onboarding link...");
                console.log("🔵 Using redirect URLs:", `${redirectBase}/dashboard/landlord/payments`);

                const accountLink = await stripe.accountLinks.create({
                    account: stripeAccountId,
                    type: "account_onboarding",
                    refresh_url: `${redirectBase}/dashboard/landlord/payments?onboarding=refresh`,
                    return_url: `${redirectBase}/dashboard/landlord/payments?onboarding=complete`,
                });

                console.log("🟢 Stripe onboarding link created");

                return new Response(
                    JSON.stringify({ url: accountLink.url }),
                    {
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );

            } catch (err) {
                console.error("🔴 Stripe accountLink creation failed:", err);
                return new Response(
                    JSON.stringify({
                        error: "stripe_account_link_failed",
                        details: err instanceof Error ? err.message : String(err),
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }
        }

        // Unknown action
        return new Response(
            JSON.stringify({ error: "unknown_action" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );

    } catch (err) {
        console.error("🔴 Unexpected error in stripe-connect:", err);

        return new Response(
            JSON.stringify({
                error: "unexpected_error",
                details: err instanceof Error ? err.message : String(err),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
});
