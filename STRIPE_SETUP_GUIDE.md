# Stripe Setup Guide - Development vs Production

## 🚨 CRITICAL: Current Issue

Your `.env` file contains **LIVE Stripe keys** which should NEVER be used in development!

```env
# ❌ WRONG - These are LIVE keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SIhcgRkKDAtZpXY...
STRIPE_SECRET_KEY=sk_live_51SIhcgRkKDAtZpXY...
```

---

## ✅ Correct Setup

### For Development (Localhost)

1. **Get Test Keys from Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your **Test** publishable key (starts with `pk_test_`)
   - Copy your **Test** secret key (starts with `sk_test_`)

2. **Update `.env` file:**
   ```env
   # ✅ CORRECT - Test keys for development
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_HERE
   ```

3. **Test Bank Accounts (Stripe Test Mode):**
   
   **IMPORTANT:** Stripe validates BOTH institution/transit AND account numbers in test mode:
   
   ```
   # TD Bank (Recommended for testing)
   Institution Number: 004 (Real TD Bank code)
   Transit Number: 10012 (Real TD branch code)
   Account Number: 000123456789 (Stripe test account)
   
   # RBC (Alternative)
   Institution Number: 003 (Real RBC code)
   Transit Number: 00102 (Real RBC branch)
   Account Number: 000123456789 (Stripe test account)
   
   # Scotiabank (Alternative)
   Institution Number: 002 (Real Scotiabank code)
   Transit Number: 00102 (Real Scotiabank branch)
   Account Number: 000123456789 (Stripe test account)
   ```
   
   **Note:** Institution/transit must be real Canadian bank codes. Account must be a Stripe test number (000123456789).

4. **What You Can Test:**
   - ✅ Form validation
   - ✅ Bank selection dropdown
   - ✅ Stripe token creation
   - ✅ Payment method creation
   - ✅ Simulated payments
   - ✅ Webhook testing (with Stripe CLI)

5. **What Won't Work:**
   - ❌ Real bank verification
   - ❌ Actual money transfers
   - ❌ Real PAD setup

---

### For Production (Deployed)

1. **Prerequisites:**
   - ✅ Verified Stripe account
   - ✅ Business verification completed
   - ✅ Approved for ACH/PAD in Canada
   - ✅ Terms of Service published
   - ✅ Privacy Policy published

2. **Get Live Keys:**
   - Go to: https://dashboard.stripe.com/apikeys
   - Copy your **Live** publishable key (starts with `pk_live_`)
   - Copy your **Live** secret key (starts with `sk_live_`)

3. **Production Environment Variables:**
   ```env
   # Production only - NEVER commit to Git!
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
   ```

4. **Deployment Checklist:**
   - [ ] Deploy frontend to production (Vercel/Netlify)
   - [ ] Deploy Supabase Edge Functions
   - [ ] Configure production webhook endpoints
   - [ ] Test with real bank account (your own first!)
   - [ ] Monitor Stripe dashboard for errors

---

## 🔐 Security Best Practices

### 1. Environment Separation

```
Development:  pk_test_... / sk_test_...
Staging:      pk_test_... / sk_test_...
Production:   pk_live_... / sk_live_...
```

### 2. Never Commit Live Keys

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 3. Use Environment Variables

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend (Supabase Edge Functions):**
```env
STRIPE_SECRET_KEY=sk_test_...
```

---

## 🧪 Testing on Localhost

### Step 1: Switch to Test Keys

Update your `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

### Step 2: Restart Dev Server

```bash
npm run dev
```

### Step 3: Test Bank Connection

1. Go to Digital Wallet page
2. Click "Connect Bank Account"
3. Select any bank from dropdown
4. Enter test data (use REAL bank codes + Stripe test account):
   ```
   Account Holder: Test User
   Bank: Toronto-Dominion Bank (TD)
   Institution: 004 (auto-filled)
   Transit: 10012
   Account: 000123456789
   ```
   **Note:** Institution/transit must be real Canadian bank codes. Account must be Stripe test number.
   Other valid options: RBC (003/00102/000123456789), Scotiabank (002/00102/000123456789)
5. Accept PAD mandate
6. Click "Connect Bank Account"

### Step 4: Verify in Stripe Dashboard

- Go to: https://dashboard.stripe.com/test/customers
- Find your test customer
- Check payment methods attached

---

## 🚀 Going Live Checklist

### Before Accepting Real Payments:

1. **Stripe Account Activation:**
   - [ ] Complete business verification
   - [ ] Provide business documents
   - [ ] Add bank account for payouts
   - [ ] Enable PAD payment method
   - [ ] Set up webhook endpoints

2. **Legal Requirements:**
   - [ ] Terms of Service page
   - [ ] Privacy Policy page
   - [ ] PAD Agreement (already in form ✅)
   - [ ] Refund policy
   - [ ] Contact information

3. **Technical Setup:**
   - [ ] Switch to live Stripe keys
   - [ ] Deploy to production
   - [ ] Configure production webhooks
   - [ ] Test with small real payment
   - [ ] Set up error monitoring

4. **Compliance:**
   - [ ] PCI compliance (Stripe handles this)
   - [ ] Data encryption (Stripe handles this)
   - [ ] Secure storage (Supabase handles this)
   - [ ] Audit logging enabled

---

## 🔍 How to Check Your Current Mode

### In Code:

```typescript
// Check if using test or live keys
const isTestMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
console.log('Stripe Mode:', isTestMode ? 'TEST' : 'LIVE');
```

### In Stripe Dashboard:

- Top left corner shows "Test mode" or "Live mode"
- Test mode has orange banner
- Live mode has no banner

---

## 📊 Test vs Live Comparison

| Feature | Test Mode (Localhost) | Live Mode (Production) |
|---------|----------------------|------------------------|
| Bank Verification | ❌ Simulated | ✅ Real |
| Money Transfer | ❌ Fake | ✅ Real |
| Stripe Fees | ❌ None | ✅ 2.9% + $0.30 |
| PAD Setup | ❌ Simulated | ✅ Real |
| Webhooks | ✅ With Stripe CLI | ✅ Production URLs |
| Dashboard | Test Dashboard | Live Dashboard |
| Customer Data | Separate | Separate |

---

## 🛠️ Stripe CLI for Local Testing

### Install Stripe CLI:

**Windows:**
```bash
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

### Login:
```bash
stripe login
```

### Forward Webhooks to Localhost:
```bash
stripe listen --forward-to localhost:54321/functions/v1/pad-payment-webhook
```

This allows you to test webhooks locally!

---

## 🆘 Troubleshooting

### Issue: "Invalid API Key"
**Solution:** Check that you're using the correct key format:
- Test: `pk_test_...` or `sk_test_...`
- Live: `pk_live_...` or `sk_live_...`

### Issue: "Bank account verification failed"
**Solution:** In test mode, use test account numbers. In live mode, use real accounts.

### Issue: "PAD not available"
**Solution:** Ensure your Stripe account is approved for Canadian PAD payments.

### Issue: "Webhook not receiving events"
**Solution:** 
- Test mode: Use Stripe CLI
- Live mode: Check webhook endpoint URL in Stripe dashboard

---

## 📞 Support

- **Stripe Documentation:** https://stripe.com/docs/payments/acss-debit
- **Stripe Support:** https://support.stripe.com
- **Test Cards:** https://stripe.com/docs/testing

---

## ⚡ Quick Start Commands

```bash
# 1. Get test keys from Stripe
# Visit: https://dashboard.stripe.com/test/apikeys

# 2. Update .env file with test keys
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...

# 3. Restart dev server
npm run dev

# 4. Test bank connection with real bank codes + Stripe test account
# TD Bank: Institution 004, Transit 10012, Account 000123456789
# RBC: Institution 003, Transit 00102, Account 000123456789
# Scotiabank: Institution 002, Transit 00102, Account 000123456789
```

---

**Last Updated:** March 6, 2026  
**Status:** Development setup with test keys required
