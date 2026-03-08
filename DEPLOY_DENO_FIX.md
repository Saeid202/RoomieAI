# Deploy Deno Runtime Fix - CRITICAL!

## The Problem
The Edge Functions were using an outdated Deno standard library (`std@0.177.1`) that's incompatible with the newer Deno runtime (`v2.1.4`), causing this error:

```
Deno.core.runMicrotasks() is not supported in this environment
```

## The Fix
Updated both Edge Functions to use the modern `Deno.serve()` API instead of the deprecated `serve()` from the old standard library.

### Changes Made:
1. **Removed** old import: `import { serve } from "https://deno.land/std@0.177.0/http/server.ts"`
2. **Changed** `serve(async (req) => {` to `Deno.serve(async (req) => {`

## Deploy Commands

Run these commands in your terminal:

```bash
# Deploy both Edge Functions
supabase functions deploy create-pad-payment-method
supabase functions deploy create-pad-payment-intent
```

Or deploy both at once:

```bash
supabase functions deploy
```

## After Deployment

1. **Wait 10-15 seconds** for the functions to restart
2. **Try making a payment again**
3. **Check the logs** to verify it's working:
   ```bash
   supabase functions logs create-pad-payment-intent --limit 10
   ```

## What Should Happen Now

After deploying, when you try to make a payment:

1. ✅ No more "event loop error"
2. ✅ Edge Function should execute successfully
3. ✅ You might see a different error (like missing Stripe secret key), which is progress!

## Next Steps After Deployment

If you see a new error about Stripe API key:

```bash
# Set the Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXYliQmReNVa17kR1z1K4AKgN4XXlnRoxHY87NMDAgy8P9mK0QOsTDtA2csE4opbF9bVLIBGStT00oTffEk7F
```

## Verify Deployment

Check that the functions are deployed:

```bash
supabase functions list
```

You should see both functions with recent deployment times.

## Testing

1. Go to Digital Wallet page
2. Try to make a payment
3. Check browser console for logs
4. Check Supabase logs for Edge Function execution

## Status

- [x] Fixed Deno runtime compatibility issue
- [ ] Deploy Edge Functions (YOU NEED TO DO THIS)
- [ ] Set Stripe secret key (if not already done)
- [ ] Test payment flow
