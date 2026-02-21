# Phase 3: Backend Setup & Deployment Guide

## Overview
Phase 3 implements the Supabase Edge Functions (serverless backend) for Canadian PAD payment processing with Stripe.

---

## ✅ What Was Created

### 1. Supabase Edge Functions (3 functions)

**Function 1: `create-pad-payment-method`**
- **File:** `supabase/functions/create-pad-payment-method/index.ts`
- **Purpose:** Create Stripe ACSS Debit payment method for Canadian bank accounts
- **Features:**
  - Validates Canadian banking format (institution, transit, account numbers)
  - Creates Stripe customer if doesn't exist
  - Creates ACSS Debit payment method
  - Creates mandate for recurring payments
  - Returns payment method ID and mandate ID

**Function 2: `create-pad-payment-intent`**
- **File:** `supabase/functions/create-pad-payment-intent/index.ts`
- **Purpose:** Create Stripe PaymentIntent with PAD options
- **Features:**
  - Creates PaymentIntent with acss_debit payment method
  - Adds PAD-specific mandate options
  - Auto-confirms payment
  - Returns payment intent ID and client secret

**Function 3: `pad-payment-webhook`**
- **File:** `supabase/functions/pad-payment-webhook/index.ts`
- **Purpose:** Handle Stripe webhook events for payment status updates
- **Features:**
  - Verifies webhook signatures
  - Prevents duplicate event processing
  - Handles payment lifecycle events:
    - `payment_intent.created` → status: initiated
    - `payment_intent.processing` → status: processing
    - `payment_intent.succeeded` → status: succeeded
    - `payment_intent.payment_failed` → status: failed
  - Sends notifications to tenants and landlords
  - Updates payment records in database

### 2. Updated Frontend Service
- **File:** `src/services/padPaymentService.ts`
- **Changes:** Updated to use Supabase functions instead of direct API calls

---

## 🔧 Setup Instructions

### Step 1: Install Supabase CLI

**⚠️ IMPORTANT: Do NOT use `npm install -g supabase` - it will fail!**

**For Windows:**
See `SUPABASE_CLI_INSTALL_WINDOWS.md` for detailed instructions.

Quick option - Use Scoop:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Or download directly from: https://github.com/supabase/cli/releases/latest

**For Mac:**
```bash
brew install supabase/tap/supabase
```

**For Linux:**
```bash
# Using Homebrew
brew install supabase/tap/supabase

# Or download binary
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
```

**Verify installation:**
```bash
supabase --version
```

### Step 2: Link Your Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Get your project ref from Supabase dashboard URL:
# https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

### Step 3: Set Up Stripe Account

1. **Create/Login to Stripe Account**
   - Go to https://dashboard.stripe.com
   - Enable Test Mode (toggle in top right)

2. **Enable Canadian PAD (ACSS Debit)**
   - Go to Settings → Payment methods
   - Enable "ACSS Debit" for Canada
   - Complete any required verification

3. **Get API Keys**
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

4. **Set Up Webhook Endpoint**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/pad-payment-webhook`
   - Select events:
     - `payment_intent.created`
     - `payment_intent.processing`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.succeeded`
     - `charge.failed`
   - Copy the **Webhook signing secret** (starts with `whsec_`)

### Step 4: Configure Environment Variables

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Set webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Verify secrets are set
supabase secrets list
```

### Step 5: Deploy Functions

```bash
# Deploy all PAD payment functions
supabase functions deploy create-pad-payment-method
supabase functions deploy create-pad-payment-intent
supabase functions deploy pad-payment-webhook

# Verify deployment
supabase functions list
```

### Step 6: Update Frontend Environment Variables

Add to your `.env` or `.env.local` file:

```env
# Stripe Publishable Key (for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Supabase URL (should already exist)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co

# Supabase Anon Key (should already exist)
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🧪 Testing

### Test with Stripe Test Bank Accounts

Stripe provides test bank account numbers for Canadian PAD:

**Test Institution Numbers:**
- `000` - Test institution (always succeeds)
- `001` - BMO
- `002` - Scotiabank
- `003` - RBC
- `004` - TD
- `006` - National Bank

**Test Transit Number:** `00022` (or any 5 digits)

**Test Account Numbers:**
- `000123456789` - Payment succeeds
- `000111111116` - Payment fails (insufficient funds)
- `000222222227` - Payment fails (account closed)

### Testing Flow:

1. **Start your frontend:**
   ```bash
   npm run dev
   ```

2. **Navigate to Wallet page:**
   - Go to `/dashboard/wallet`
   - Click "Pay Rent Now"

3. **Select PAD payment method:**
   - Choose "Canadian Bank Account (PAD)"
   - Click "Continue"

4. **Enter test bank details:**
   - Account Holder Name: Test User
   - Institution Number: 000
   - Transit Number: 00022
   - Account Number: 000123456789
   - Accept mandate agreement
   - Click "Connect Bank Account"

5. **Confirm and pay:**
   - Review payment details
   - Click "Confirm Payment"

6. **Check webhook events:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - View recent events

7. **Verify database:**
   ```sql
   -- Check payment record
   SELECT * FROM rental_payments 
   WHERE stripe_payment_intent_id IS NOT NULL 
   ORDER BY created_at DESC LIMIT 1;

   -- Check payment method
   SELECT * FROM payment_methods 
   WHERE payment_type = 'acss_debit' 
   ORDER BY created_at DESC LIMIT 1;

   -- Check webhook events
   SELECT * FROM stripe_webhook_events 
   ORDER BY processed_at DESC LIMIT 10;
   ```

---

## 🔍 Monitoring & Debugging

### View Function Logs

```bash
# View logs for specific function
supabase functions logs create-pad-payment-method
supabase functions logs create-pad-payment-intent
supabase functions logs pad-payment-webhook

# Follow logs in real-time
supabase functions logs pad-payment-webhook --follow
```

### Common Issues & Solutions

**Issue 1: "Unauthorized" error**
- **Cause:** User not authenticated
- **Solution:** Ensure user is logged in and auth token is passed

**Issue 2: "Webhook signature verification failed"**
- **Cause:** Wrong webhook secret or signature
- **Solution:** 
  - Verify `STRIPE_WEBHOOK_SECRET` is set correctly
  - Check webhook endpoint URL matches exactly
  - Ensure using correct Stripe account (test vs live)

**Issue 3: "Customer not found"**
- **Cause:** Payment method not created first
- **Solution:** User must connect bank account before making payment

**Issue 4: "Invalid institution number"**
- **Cause:** Wrong format for Canadian banking numbers
- **Solution:** 
  - Institution: 3 digits (e.g., "000")
  - Transit: 5 digits (e.g., "00022")
  - Account: 7-12 digits

**Issue 5: Function timeout**
- **Cause:** Stripe API slow or network issues
- **Solution:** 
  - Check Stripe API status
  - Increase function timeout in `supabase/functions/config.toml`
  - Add retry logic

---

## 📊 Payment Flow Diagram

```
Tenant Action → Frontend → Supabase Function → Stripe API → Webhook → Database

1. Tenant connects bank
   └→ create-pad-payment-method
      └→ Stripe: Create PaymentMethod + Mandate
         └→ Save to payment_methods table

2. Tenant initiates payment
   └→ create-pad-payment-intent
      └→ Stripe: Create PaymentIntent (auto-confirm)
         └→ Save to rental_payments table (status: initiated)

3. Stripe processes payment (async)
   └→ Webhook: payment_intent.processing
      └→ Update status: processing
      └→ Send notification to tenant

4. Payment clears (3-5 days)
   └→ Webhook: payment_intent.succeeded
      └→ Update status: succeeded
      └→ Set payment_cleared_at
      └→ Send notifications to tenant & landlord

5. (If fails)
   └→ Webhook: payment_intent.payment_failed
      └→ Update status: failed
      └→ Set failure_reason & failure_code
      └→ Send failure notification
```

---

## 🔐 Security Checklist

- ✅ Webhook signature verification enabled
- ✅ Duplicate event prevention (stripe_webhook_events table)
- ✅ User authentication required for all functions
- ✅ Stripe secret keys stored as Supabase secrets (not in code)
- ✅ RLS policies enabled on all payment tables
- ✅ Service role key used only in webhook handler
- ✅ Bank account numbers never stored in full (only last 4 digits)
- ✅ CORS headers configured properly

---

## 📝 Next Steps

### After Deployment:

1. **Test thoroughly in test mode**
   - Test successful payments
   - Test failed payments
   - Test webhook delivery
   - Test notification system

2. **Monitor for 24-48 hours**
   - Check function logs
   - Verify webhook events
   - Confirm database updates
   - Test user experience

3. **Prepare for production**
   - Switch to live Stripe keys
   - Update webhook endpoint to production URL
   - Test with real bank account (small amount)
   - Set up monitoring alerts

4. **Phase 4: Landlord Payouts** (Optional)
   - Implement Stripe Connect for landlords
   - Automatic fund transfers after clearing
   - Payout tracking and history

---

## 🆘 Support Resources

**Stripe Documentation:**
- [ACSS Debit Payments](https://stripe.com/docs/payments/acss-debit)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

**Supabase Documentation:**
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Function Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Function Logs](https://supabase.com/docs/guides/functions/logging)

**Testing:**
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Canadian Test Bank Accounts](https://stripe.com/docs/testing#canadian-bank-accounts)

---

## ✅ Deployment Checklist

Before going live:

- [ ] Supabase CLI installed and linked
- [ ] Stripe account created and PAD enabled
- [ ] API keys obtained (test mode)
- [ ] Webhook endpoint created in Stripe
- [ ] Environment variables set in Supabase
- [ ] All 3 functions deployed successfully
- [ ] Frontend environment variables updated
- [ ] Test payment completed successfully
- [ ] Webhook events received and processed
- [ ] Database records created correctly
- [ ] Notifications sent properly
- [ ] Function logs reviewed (no errors)
- [ ] Security checklist completed

---

**Phase 3 Status:** ✅ READY TO DEPLOY

Deploy the functions and test the complete payment flow!
