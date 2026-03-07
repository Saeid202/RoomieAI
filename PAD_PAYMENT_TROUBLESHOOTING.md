# PAD Payment 500 Error - Troubleshooting Guide

## Problem
Getting `FunctionsHttpError` with 500 status when trying to connect bank account for PAD payments.

## Root Cause
The Supabase Edge Function `create-pad-payment-method` is deployed and executing (574ms execution time), but **failing because the `STRIPE_SECRET_KEY` environment variable is not set** in Supabase secrets.

## Error Analysis
```
POST | 500 | https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/create-pad-payment-method
execution_time_ms: 574
status_code: 500
```

The function IS running (not a deployment issue), but returning 500 (internal server error).

## Solution Steps

### Step 1: Check Current Secrets
First, verify what secrets are currently set:

```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```

### Step 2: Set Stripe Test Secret Key
Set your Stripe TEST secret key (for localhost development):

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F --project-ref bjesofgfbuyzjamyliys
```

**IMPORTANT:** This is your TEST key from `.env` file. Use this for development/testing.

### Step 3: Verify Secret Was Set
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```

You should see `STRIPE_SECRET_KEY` in the list.

### Step 4: Test Payment Again
After setting the secret:
1. Go to your app at http://localhost:3000
2. Navigate to Tenant Payments
3. Try connecting a bank account again
4. Use real bank codes + Stripe test account:
   - **TD Bank (Recommended):**
     - Institution Number: 004
     - Transit Number: 10012
     - Account Number: 000123456789
   - **RBC (Alternative):**
     - Institution Number: 003
     - Transit Number: 00102
     - Account Number: 000123456789
   - **Scotiabank (Alternative):**
     - Institution Number: 002
     - Transit Number: 00102
     - Account Number: 000123456789

### Step 5: Monitor Logs (Optional)
Watch the function logs in real-time to see if it's working:

```bash
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys --tail
```

## Important Notes

### About Environment Variables
- **Local `.env` file**: Only used by your frontend React app (variables starting with `VITE_`)
- **Supabase Edge Functions**: Need secrets set via `supabase secrets set` command
- **No redeployment needed**: Setting secrets doesn't require redeploying the function

### Test vs Live Keys
Your `.env` file currently has TEST keys (correct for localhost):
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` ✅
- `STRIPE_SECRET_KEY=sk_test_...` ✅

For production deployment, you'll need to:
1. Set LIVE keys in Supabase secrets: `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
2. Update frontend env vars in deployment platform (Vercel/Netlify)

### Where to Get Stripe Keys
- **Test Keys**: https://dashboard.stripe.com/test/apikeys
- **Live Keys**: https://dashboard.stripe.com/apikeys (only after going live)

## Expected Behavior After Fix

Once the secret is set, the function should:
1. Accept your bank account details
2. Create a Stripe customer (if needed)
3. Create an ACSS Debit payment method
4. Create a SetupIntent for mandate acceptance
5. Return success with payment method ID

You should see:
- Success toast: "Bank account connected successfully!"
- Move to confirmation screen
- See your bank details (last 4 digits)

## Still Having Issues?

If you still get errors after setting the secret:

1. **Check the logs**:
   ```bash
   supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys
   ```

2. **Verify Stripe key is valid**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Make sure the key starts with `sk_test_`
   - Copy the key exactly (no extra spaces)

3. **Check Stripe account**:
   - Ensure your Stripe account is activated
   - Verify Canadian PAD (ACSS Debit) is enabled in your Stripe dashboard

4. **Test with Stripe CLI** (optional):
   ```bash
   stripe payment_methods create --type acss_debit --acss-debit[account_number]=000123456789 --acss-debit[institution_number]=000 --acss-debit[transit_number]=00000 --billing-details[name]="Test User"
   ```

## Quick Reference

### Supabase CLI Commands
```bash
# List secrets
supabase secrets list --project-ref bjesofgfbuyzjamyliys

# Set secret
supabase secrets set KEY=value --project-ref bjesofgfbuyzjamyliys

# Delete secret
supabase secrets unset KEY --project-ref bjesofgfbuyzjamyliys

# View function logs
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys
```

### Test Bank Account Numbers
For Stripe test mode, use real bank codes + Stripe test account:
- **TD Bank**: Institution 004, Transit 10012, Account 000123456789
- **RBC**: Institution 003, Transit 00102, Account 000123456789
- **Scotiabank**: Institution 002, Transit 00102, Account 000123456789

**Important:** Institution/transit must be real Canadian bank codes. Account must be Stripe test number (000123456789).
