# Deploy Functions via Supabase Dashboard

## You're in the right place! ✅

Click the green "Deploy a new function" button and follow these steps for each function.

---

## Function 1: create-pad-payment-method

**Step 1:** Click "Deploy a new function"

**Step 2:** Enter function name:
```
create-pad-payment-method
```

**Step 3:** Copy and paste this code:

See file: `supabase/functions/create-pad-payment-method/index.ts`

**Step 4:** Click "Deploy function"

---

## Function 2: create-pad-payment-intent

**Step 1:** Click "Deploy a new function" again

**Step 2:** Enter function name:
```
create-pad-payment-intent
```

**Step 3:** Copy and paste this code:

See file: `supabase/functions/create-pad-payment-intent/index.ts`

**Step 4:** Click "Deploy function"

---

## Function 3: pad-payment-webhook

**Step 1:** Click "Deploy a new function" again

**Step 2:** Enter function name:
```
pad-payment-webhook
```

**Step 3:** Copy and paste this code:

See file: `supabase/functions/pad-payment-webhook/index.ts`

**Step 4:** Click "Deploy function"

---

## After Deploying All 3 Functions

### Set Environment Variables (Secrets)

1. In the left sidebar, click "Secrets" (under MANAGE section)
2. Add these two secrets:

**Secret 1:**
- Name: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key (get from https://dashboard.stripe.com/test/apikeys)
  - Starts with `sk_test_`

**Secret 2:**
- Name: `STRIPE_WEBHOOK_SECRET`
- Value: Your Stripe webhook secret (get from Stripe webhooks page)
  - Starts with `whsec_`

### How to Get Stripe Keys:

**For STRIPE_SECRET_KEY:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in "Test mode" (toggle in top right)
3. Copy the "Secret key" (click "Reveal test key")

**For STRIPE_WEBHOOK_SECRET:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://bjssolfouygjamyljys.supabase.co/functions/v1/pad-payment-webhook`
4. Select these events:
   - `payment_intent.created`
   - `payment_intent.processing`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

---

## Verification

After deploying all 3 functions, you should see them listed on the Edge Functions page:
- ✅ create-pad-payment-method
- ✅ create-pad-payment-intent
- ✅ pad-payment-webhook

---

## Next Steps

Once deployed and secrets are set:
1. Test the payment flow in your app
2. Check function logs for any errors
3. Verify webhook events are being received

---

## Need the Code?

All function code is in your project:
- `supabase/functions/create-pad-payment-method/index.ts`
- `supabase/functions/create-pad-payment-intent/index.ts`
- `supabase/functions/pad-payment-webhook/index.ts`

Just open each file and copy the entire content!
