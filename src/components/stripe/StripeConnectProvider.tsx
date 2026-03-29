import React, { useState, useEffect, useRef } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import { ConnectComponentsProvider, ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { supabase } from "@/integrations/supabase/client";

interface StripeConnectProviderProps {
    children: React.ReactNode;
    onReady?: () => void;
    onError?: (err: string) => void;
}

export const StripeConnectProvider: React.FC<StripeConnectProviderProps> = ({
    children,
    onReady,
    onError,
}) => {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<string | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const fetchClientSecret = async () => {
            console.log("🔵 Fetching Stripe account session...");
            const { data, error } = await supabase.functions.invoke("stripe-connect", {
                body: { action: "create-account-session" },
            });
            console.log("🔵 Session response:", { data, error });
            if (error) throw new Error(error.message || "Failed to get session");
            if (!data?.client_secret) throw new Error(`No client_secret returned. Response: ${JSON.stringify(data)}`);
            return data.client_secret;
        };

        // Test the session fetch first before initializing
        fetchClientSecret()
            .then((clientSecret) => {
                console.log("✅ Got client_secret, initializing Stripe Connect...");

                const instance = loadConnectAndInitialize({
                    publishableKey:
                        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
                        "pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY",
                    fetchClientSecret: () => Promise.resolve(clientSecret),
                    appearance: {
                        overlays: "dialog",
                        variables: {
                            colorPrimary: "#7c3aed",
                            fontFamily: "Inter, system-ui, sans-serif",
                        },
                    },
                });

                setStripeConnectInstance(instance);
                setIsLoading(false);
                onReady?.();
            })
            .catch((err: any) => {
                console.error("❌ Stripe Connect init failed:", err);
                const msg = err.message || "Failed to load payment system.";
                setError(msg);
                setDebugInfo(err.message);
                setIsLoading(false);
                onError?.(msg);
            });
    }, []);

    if (error) {
        return (
            <div className="p-6 border rounded-lg bg-red-50 border-red-200 text-red-700">
                <p className="font-semibold mb-1">Failed to load payment setup</p>
                <p className="text-sm mb-2">{error}</p>
                {debugInfo && (
                    <details className="text-xs text-red-500 mb-3">
                        <summary className="cursor-pointer">Technical details</summary>
                        <pre className="mt-1 whitespace-pre-wrap break-all">{debugInfo}</pre>
                    </details>
                )}
                <button
                    onClick={() => {
                        initialized.current = false;
                        setError(null);
                        setDebugInfo(null);
                        setIsLoading(true);
                    }}
                    className="text-sm underline hover:text-red-800"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (isLoading || !stripeConnectInstance) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600" />
                <p className="text-sm text-muted-foreground">Setting up secure payment connection...</p>
            </div>
        );
    }

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {children}
        </ConnectComponentsProvider>
    );
};

// Standalone embedded onboarding — no children needed
export const EmbeddedStripeOnboarding: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    return (
        <StripeConnectProvider>
            <ConnectAccountOnboarding onExit={onExit} />
        </StripeConnectProvider>
    );
};
