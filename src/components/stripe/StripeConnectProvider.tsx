import React, { useState, useEffect } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { supabase } from "@/integrations/supabase/client";

interface StripeConnectProviderProps {
    children: React.ReactNode;
}

export const StripeConnectProvider: React.FC<StripeConnectProviderProps> = ({ children }) => {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initializeStripe = async () => {
            try {
                const fetchClientSecret = async () => {
                    const { data, error } = await supabase.functions.invoke("stripe-connect", {
                        body: { action: "create-account-session" },
                    });

                    if (error) {
                        console.error("Error fetching client secret:", error);
                        throw error;
                    }

                    return data.client_secret;
                };

                const instance = loadConnectAndInitialize({
                    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY",
                    fetchClientSecret,
                    appearance: {
                        overlays: "dialog",
                        variables: {
                            colorPrimary: "#4f46e5",
                            fontFamily: "Inter, system-ui, sans-serif",
                        },
                    },
                });

                if (isMounted) {
                    setStripeConnectInstance(instance);
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Failed to initialize Stripe Connect:", err);
                if (isMounted) {
                    setError(err.message || "Failed to load payment system.");
                    setIsLoading(false);
                }
            }
        };

        initializeStripe();

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <div className="p-4 border rounded-md bg-red-50 border-red-200 text-red-700">
                <h3 className="font-semibold">Payment System Error</h3>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm underline hover:text-red-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (isLoading || !stripeConnectInstance) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Initializing secure payments...</p>
                </div>
            </div>
        );
    }

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {children}
        </ConnectComponentsProvider>
    );
};
