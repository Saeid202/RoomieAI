# Production Deployment Guide

## 🚀 How to Deploy with Live Stripe Keys

### Overview
Your code uses environment variables that automatically switch between test and live keys based on where it's running.

---

## Step 1: Prepare Your Code (Already Done ✅)

Your code already reads from environment variables:

```typescript
// Frontend
const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Backend (Supabase Functions)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
```

---

## Step 2: Local Development Setup

### Update .env with TEST keys:

```env
# .env (keep this file, but use TEST keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SIhcgRkKDAtZpXY...
STRIPE_SECRET_KEY=sk_test_51SIhcgRkKDAtZpXY...
```

### Get your test keys:
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (starts with `pk_test_`)
3. Copy "Secret key" (starts with `sk_test_`)
4. Update your `.env` file

---

## Step 3: Deploy Frontend (Vercel/Netlify)

### Option A: Vercel

1. **Push to GitHub** (already done ✅)

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select `RoomieAI` repository

3. **Configure Environment Variables:**
   - During setup, click "Environment Variables"
   - Add these variables:

   ```
   Name: VITE_SUPABASE_URL
   Value: https://bjesofgfbuyzjamyliys.supabase.co

   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY

   Name: VITE_GEMINI_API_KEY
   Value: AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at: `https://your-project.vercel.app`

### Option B: Netlify

1. **Push to GitHub** (already done ✅)

2. **Connect to Netlify:**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select `RoomieAI` repository

3. **Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add the same variables as Vercel above

5. **Deploy:**
   - Click "Deploy site"
   - Your site will be live at: `https://your-site.netlify.app`

---

## Step 4: Deploy Backend (Supabase Edge Functions)

### Set Stripe Secret Key:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref bjesofgfbuyzjamyliys

# Set the LIVE Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE

# Deploy all edge functions
supabase functions deploy
```

### Verify Secrets:

```bash
# List all secrets
supabase secrets list
```

---

## Step 5: Configure Stripe Webhooks

### 1. Get Your Production URL:
After deploying, you'll have a URL like:
- Vercel: `https://roomie-ai.vercel.app`
- Netlify: `https://roomie-ai.netlify.app`

### 2. Add Webhook in Stripe:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/pad-payment-webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### 3. Add Webhook Secret to Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

## Step 6: Test Production

### 1. Test with Real Bank Account:

1. Go to your production site
2. Navigate to Digital Wallet
3. Click "Connect Bank Account"
4. Enter YOUR REAL bank details:
   ```
   Account Holder: Your Name
   Bank: Select your bank
   Institution: Auto-filled
   Transit: Your branch transit number
   Account: Your account number
   ```
5. Accept PAD mandate
6. Click "Connect Bank Account"

### 2. Verify in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/customers
2. Find your customer
3. Check payment methods
4. Verify bank account is attached

### 3. Test a Small Payment:

1. Make a $1 test payment
2. Check Stripe dashboard for transaction
3. Verify webhook received
4. Check your bank account (may take 1-2 days)

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` ✅
- [ ] No API keys in Git repository ✅
- [ ] Test keys used in development
- [ ] Live keys only in production environment variables
- [ ] Webhook secrets configured
- [ ] HTTPS enabled on production site
- [ ] Stripe account verified
- [ ] Terms of Service published
- [ ] Privacy Policy published

---

## 📊 Environment Variables Summary

### Local Development (.env file):
```env
VITE_SUPABASE_URL=https://bjesofgfbuyzjamyliys.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET
VITE_GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

### Production (Vercel/Netlify Dashboard):
```env
VITE_SUPABASE_URL=https://bjesofgfbuyzjamyliys.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
VITE_GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

### Supabase Secrets (CLI):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

## 🎯 How It Works

### Development Flow:
```
1. You run: npm run dev
2. Vite reads: .env file
3. Code gets: pk_test_... (test key)
4. Stripe uses: Test mode
5. Result: Safe testing ✅
```

### Production Flow:
```
1. User visits: https://your-site.vercel.app
2. Vercel provides: Environment variables from dashboard
3. Code gets: pk_live_... (live key)
4. Stripe uses: Live mode
5. Result: Real payments ✅
```

---

## 🆘 Troubleshooting

### Issue: "Invalid API key" in production
**Solution:** Check that live keys are set in Vercel/Netlify dashboard

### Issue: Webhooks not working
**Solution:** 
1. Verify webhook URL is correct
2. Check webhook secret is set in Supabase
3. Test webhook in Stripe dashboard

### Issue: Bank account verification fails
**Solution:**
1. Ensure Stripe account is verified
2. Check that PAD is enabled for your account
3. Contact Stripe support if needed

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **Netlify Docs:** https://docs.netlify.com/environment-variables/overview/
- **Supabase Docs:** https://supabase.com/docs/guides/functions/secrets
- **Stripe Docs:** https://stripe.com/docs/keys

---

## ✅ Quick Deploy Commands

```bash
# 1. Update local .env with TEST keys
# (Edit .env file manually)

# 2. Test locally
npm run dev

# 3. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 4. Deploy to Vercel (via dashboard)
# - Connect GitHub repo
# - Add environment variables
# - Deploy

# 5. Deploy Supabase Functions
supabase login
supabase link --project-ref bjesofgfbuyzjamyliys
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase functions deploy

# 6. Configure Stripe webhooks
# (Via Stripe dashboard)

# 7. Test with real bank account
# (Via your production site)
```

---

**Last Updated:** March 6, 2026  
**Status:** Ready for production deployment
