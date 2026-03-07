# Fix PAD Payment Error - Quick Commands

## The Problem
Your Supabase Edge Function is missing the `STRIPE_SECRET_KEY` environment variable.

## The Fix (Run These Commands)

### 1. Set the Stripe Secret Key
Copy and paste this command in your terminal:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F --project-ref bjesofgfbuyzjamyliys
```

### 2. Verify It Was Set
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```

You should see `STRIPE_SECRET_KEY` in the output.

### 3. Test Your Payment
Now try connecting your bank account again in the app. Use these test details:
- **Account Holder Name**: Your Name
- **Bank Name**: Select any Canadian bank from dropdown
- **Institution Number**: 000
- **Transit Number**: 00000
- **Account Number**: 000123456789

## That's It!
No need to redeploy anything. The function will automatically use the new secret.

## Optional: Watch Logs
If you want to see what's happening in real-time:

```bash
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys --tail
```

Press `Ctrl+C` to stop watching logs.

## Why This Happened
- Your `.env` file has the Stripe key, but that's only for your frontend
- Supabase Edge Functions need secrets set separately via CLI
- This is a security feature - keeps secrets out of your code

## For Production Later
When you deploy to production, you'll need to:
1. Get your LIVE Stripe keys from https://dashboard.stripe.com/apikeys
2. Set them in Supabase: `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
3. Update your frontend env vars in Vercel/Netlify dashboard
