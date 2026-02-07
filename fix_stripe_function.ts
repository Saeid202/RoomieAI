import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        if (userError || !user) throw new Error("Invalid user token");

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
            throw new Error("Server configuration error: STRIPE_SECRET_KEY is missing");
        }

        const isTestKey = stripeKey.startsWith("sk_test");
        console.log(`Initializing Stripe in ${isTestKey ? "TEST" : "LIVE"} mode`);

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2024-06-20",
        });

        const { action, session_id } = await req.json();
        console.log(`Processing action: ${action} for user: ${user.id}`);

        // 1. Get or Create Customer
        const { data: customerData } = await supabase
            .from('user_stripe_customers')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle();

        let customerId = customerData?.stripe_customer_id;

        if (!customerId) {
            console.log("Creating new Stripe Customer for user:", user.id);
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { user_id: user.id }
            });
            customerId = customer.id;

            const { error: saveError } = await supabase.from('user_stripe_customers').upsert({
                user_id: user.id,
                stripe_customer_id: customerId
            });

            if (saveError) throw new Error(`Failed to save customer mapping: ${saveError.message}`);
        }

        if (action === "create-session") {
            console.log("Creating Financial Connections Session...");
            try {
                // FIXED: Use proper session creation with US country support
                const session = await stripe.financialConnections.sessions.create({
                    account_holder: { 
                        type: 'customer', 
                        customer: customerId 
                    },
                    permissions: ['payment_method', 'balances', 'ownership'],
                    filters: { 
                        countries: ['US', 'CA']  // Support US and Canada
                    },
                    prefetch: ['balances', 'ownership'],
                    // Add return URL for proper session handling
                    return_url: `${req.headers.get("origin")}/dashboard/digital-wallet?onboarding=return`,
                    refresh_url: `${req.headers.get("origin")}/dashboard/digital-wallet?onboarding=refresh`,
                });

                console.log("Session created successfully:", {
                    id: session.id,
                    client_secret: session.client_secret,
                    client_secret_prefix: session.client_secret?.substring(0, 20)
                });

                // Validate the session before returning
                if (!session.client_secret || !session.client_secret.startsWith("fcsess_")) {
                    console.error("Invalid session created:", session);
                    throw new Error("Invalid session format returned from Stripe");
                }

                return new Response(JSON.stringify({ 
                    client_secret: session.client_secret,
                    session_id: session.id 
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (stripeErr: any) {
                console.error("Stripe Session Error:", {
                    message: stripeErr.message,
                    code: stripeErr.code,
                    type: stripeErr.type,
                    stack: stripeErr.stack
                });
                throw new Error(`Stripe Error: ${stripeErr.message}`);
            }
        }

        if (action === "exchange-account") {
            if (!session_id) throw new Error("Missing session_id");

            console.log("Exchanging session:", session_id);
            const session = await stripe.financialConnections.sessions.retrieve(session_id, {
                expand: ['accounts']
            });

            const accounts = session.accounts.data;
            if (!accounts || accounts.length === 0) throw new Error("No accounts found in session");

            const selectedAccount = accounts[0]; // Assuming single account selection

            console.log("Creating Payment Method for account:", selectedAccount.id);
            // Create ACSS Debit Payment Method
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'acss_debit',
                acss_debit: {
                    financial_connections_account: selectedAccount.id
                },
                billing_details: {
                    email: user.email
                }
            });

            // Attach to Customer
            await stripe.paymentMethods.attach(paymentMethod.id, { customer: customerId });

            // Save to Database
            const { error: dbError } = await supabase.from('payment_methods').insert({
                user_id: user.id,
                stripe_payment_method_id: paymentMethod.id,
                card_type: 'bank_account', // Using 'bank_account' as per existing type
                brand: selectedAccount.institution_name || 'Bank',
                last4: selectedAccount.last4,
                is_default: false, // Logic can be improved
                bank_connection_token: selectedAccount.id,
                authorization_status: 'approved', // Implied by successful connection
                last_verified_at: new Date().toISOString()
            });

            if (dbError) {
                console.error("DB Save Error:", dbError);
                throw dbError;
            }

            return new Response(JSON.stringify({ success: true, payment_method: paymentMethod }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        throw new Error("Invalid action");

    } catch (error: any) {
        console.error("Error:", {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
