
import React, { useState, useEffect } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { supabase } from "@/integrations/supabase/client";

interface StripeConnectProviderProps {
    children: React.ReactNode;
}

export const StripeConnectProvider: React.FC<StripeConnectProviderProps> = ({ children }) => {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

    useEffect(() => {
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

        setStripeConnectInstance(instance);
    }, []);

    if (!stripeConnectInstance) {
        return null;
    }

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {children}
        </ConnectComponentsProvider>
    );
};
