# How to Get Your Stripe Keys

## Step 1: Get STRIPE_SECRET_KEY

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure the toggle in top-right says **"Test mode"** (not Live mode)
3. Find "Secret key" section
4. Click **"Reveal test key"**
5. Copy the key (starts with `sk_test_`)
6. Save it - you'll add it to Supabase Secrets

## Step 2: Create Webhook & Get STRIPE_WEBHOOK_SECRET

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"** button
3. Fill in the form:
   - **Endpoint URL:** `https://bjssolfouygjamyljys.supabase.co/functions/v1/pad-payment-webhook`
   - **Description:** PAD Payment Webhook (optional)
   - **Events to send:** Click "Select events" and choose:
     - ✅ `payment_intent.created`
     - ✅ `payment_intent.processing`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `charge.succeeded`
     - ✅ `charge.failed`
4. Click **"Add endpoint"**
5. After creating, you'll see the webhook details page
6. Find **"Signing secret"** section
7. Click **"Reveal"** or copy button
8. Copy the secret (starts with `whsec_`)
9. Save it - you'll add it to Supabase Secrets

## Step 3: Add Secrets to Supabase

1. In Supabase dashboard, click **"Secrets"** (left sidebar, under MANAGE)
2. Click **"Add new secret"** or similar button
3. Add first secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: (paste your `sk_test_...` key)
4. Add second secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: (paste your `whsec_...` secret)
5. Save both secrets

## Verification

After adding secrets, your functions will be able to:
- Create payment methods with Canadian bank accounts
- Process PAD payments
- Receive webhook notifications from Stripe

---

## Important Notes

- Always use **Test mode** keys for development
- Never share your secret keys
- The webhook URL must match exactly: `https://bjssolfouygjamyljys.supabase.co/functions/v1/pad-payment-webhook`
- You can test webhooks using Stripe's "Send test webhook" feature

---

## Next Steps After Adding Secrets

1. Test the payment flow in your app
2. Monitor function logs for any errors
3. Check Stripe dashboard for webhook events
4. Verify payments are recorded in your database

---

## Quick Links

- Stripe API Keys: https://dashboard.stripe.com/test/apikeys
- Stripe Webhooks: https://dashboard.stripe.com/test/webhooks
- Supabase Functions: https://supabase.com/dashboard/project/bjssolfouygjamyljys/functions
- Supabase Secrets: https://supabase.com/dashboard/project/bjssolfouygjamyljys/settings/functions

---

**Ready?** Click "Secrets" in Supabase and let's add those keys!
