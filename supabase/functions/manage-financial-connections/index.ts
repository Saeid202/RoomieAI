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

        let requestBody;
        try {
            requestBody = await req.json();
            console.log("📨 Request body received:", requestBody);
        } catch (parseError) {
            console.error("❌ JSON parsing error:", parseError);
            return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { action, session_id } = requestBody;
        console.log(`Processing action: ${action} for user: ${user.id}`);

        // VALIDATE ACTION PARAMETER
        if (!action) {
            console.error("❌ Missing action parameter");
            return new Response(JSON.stringify({ error: "Missing action parameter" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const validActions = ['test', 'create-session', 'exchange-account'];
        if (!validActions.includes(action)) {
            console.error("❌ Invalid action:", action);
            return new Response(JSON.stringify({ 
                error: `Invalid action: ${action}. Valid actions: ${validActions.join(', ')}` 
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // TEST ACTION for debugging
        if (action === "test") {
            console.log("🧪 Test action received");
            return new Response(JSON.stringify({ 
                message: "Function is working",
                stripe_key_exists: !!stripeKey,
                stripe_mode: isTestKey ? "TEST" : "LIVE",
                user_id: user.id
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 1. Get or Create Customer
        console.log("🔍 Checking customer for user:", user.id);
        let customerId: string | undefined;
        
        try {
            const { data: customerData, error: customerError } = await supabase
                .from('user_stripe_customers')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (customerError) {
                console.error("❌ Database error getting customer:", customerError);
                return new Response(JSON.stringify({ 
                    error: `Database error: ${customerError.message}` 
                }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            customerId = customerData?.stripe_customer_id;
            console.log("👤 Customer ID:", customerId || 'Not found');

            if (!customerId) {
                console.log("🆕 Creating new Stripe Customer for user:", user.id);
                try {
                    const customer = await stripe.customers.create({
                        email: user.email,
                        metadata: { user_id: user.id }
                    });
                    customerId = customer.id;
                    console.log("✅ Stripe customer created:", customerId);

                    const { error: saveError } = await supabase.from('user_stripe_customers').upsert({
                        user_id: user.id,
                        stripe_customer_id: customerId
                    });

                    if (saveError) {
                        console.error("❌ Failed to save customer mapping:", saveError);
                        return new Response(JSON.stringify({ 
                            error: `Failed to save customer mapping: ${saveError.message}` 
                        }), {
                            status: 500,
                            headers: { ...corsHeaders, "Content-Type": "application/json" },
                        });
                    }
                    console.log("✅ Customer mapping saved");
                } catch (stripeError) {
                    console.error("❌ Stripe customer creation failed:", stripeError);
                    return new Response(JSON.stringify({ 
                        error: `Stripe customer creation failed: ${(stripeError as Error).message}` 
                    }), {
                        status: 500,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    });
                }
            }
        } catch (dbError) {
            console.error("❌ Database operation failed:", dbError);
            return new Response(JSON.stringify({ 
                error: `Database operation failed: ${(dbError as Error).message}` 
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!customerId) {
            console.error("❌ No customer ID available");
            return new Response(JSON.stringify({ 
                error: "Failed to create or retrieve customer" 
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("✅ Customer ready, customerId:", customerId);

        if (action === "create-session") {
            console.log("Creating Financial Connections Session for Canadian banks...");
            try {
                // CANADIAN BANKS: Configure for Canadian banking system
                const session = await stripe.financialConnections.sessions.create({
                    account_holder: { 
                        type: 'customer', 
                        customer: customerId 
                    },
                    permissions: ['payment_method', 'balances', 'ownership'],
                    // REMOVE COUNTRY FILTER TO FIX 404 ISSUES
                    // filters: { 
                    //     countries: ['CA'] // Explicitly set to Canada for Canadian banks
                    // },
                    prefetch: ['balances', 'ownership'],
                    // SIMPLIFIED RETURN URLS - FIX HTTPS REQUIREMENT
                    // For development, we can omit return_url or use a placeholder
                    // return_url: `${req.headers.get("origin")}/dashboard/digital-wallet`
                    // REMOVED: return_url for development (Stripe requires HTTPS)
                });

                console.log("Session created successfully:", {
                    id: session.id,
                    client_secret: session.client_secret,
                    client_secret_prefix: session.client_secret?.substring(0, 20),
                    filters: 'All countries (removed CA filter)',
                    return_url: 'Removed for development (Stripe requires HTTPS)',
                    parameters: 'Minimal configuration for localhost development'
                });

                // Validate the session before returning
                if (!session.client_secret || !session.client_secret.startsWith("fcsess_")) {
                    console.error("Invalid session created:", session);
                    throw new Error("Invalid session format returned from Stripe");
                }

                return new Response(JSON.stringify({ 
                    client_secret: session.client_secret,
                    session_id: session.id,
                    country: 'CA'
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            } catch (stripeErr: any) {
                console.error("Canadian Stripe Session Error:", {
                    message: stripeErr.message,
                    code: stripeErr.code,
                    type: stripeErr.type,
                    stack: stripeErr.stack
                });
                
                // BETTER ERROR HANDLING FOR CANADIAN BANKS
                if (stripeErr.code === 'country_unsupported') {
                    throw new Error("Canadian bank connections are not currently available. Please contact support.");
                } else if (stripeErr.code === 'invalid_request_error') {
                    throw new Error("Unable to connect to Canadian banks. Please check your bank is supported.");
                } else {
                    throw new Error(`Canadian bank connection error: ${stripeErr.message}`);
                }
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
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
