import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY",
    {
        betas: ["financial_connections_beta_1"],
    }
);
