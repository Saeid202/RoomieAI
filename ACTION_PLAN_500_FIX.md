# 🔧 Action Plan - Fix 500 Errors

## Current Status
❌ **500 Internal Server Error** on landlord-onboarding function
✅ **CORS errors resolved** - Functions are being called successfully

## Root Cause Analysis

The 500 errors are likely caused by **ONE** of these issues:

### 1. Missing Database Columns (MOST LIKELY)
The `payment_accounts` table may not have the Stripe Connect columns in production.

**Required columns:**
- `stripe_account_status` (VARCHAR(50))
- `stripe_onboarding_completed_at` (TIMESTAMP)

### 2. RLS Policy Blocking Insert
The Row Level Security policy might be preventing the Edge Function from inserting/updating records.

### 3. Stripe API Key Issue
The `STRIPE_SECRET_KEY` environment variable might be missing or invalid.

---

## 🚀 Step-by-Step Fix

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard (RECOMMENDED)**

1. Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/sql/new
2. Copy and paste the contents of `apply_stripe_connect_columns.sql`
3. Click **"Run"**
4. Verify the output shows the 3 columns

**Option B: Using CLI**

```bash
# This file is already created: apply_stripe_connect_columns.sql
# Copy its contents and run in Supabase SQL Editor
```

### Step 2: Test Again with Better Error Messages

1. **Hard refresh** browser: `Ctrl+Shift+R`
2. Open browser console (F12)
3. Click **"Complete Payout Setup"**
4. Check console for detailed error message

**The error will now show:**
```
Error: [Specific error message]: [Detailed technical info]
```

### Step 3: Verify Stripe API Key

If you see "Stripe configuration missing":

```bash
# Check if secret is set
npx supabase secrets list

# If missing, set it:
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### Step 4: Check RLS Policies

If you see "Failed to save account" or "permission denied":

Run this SQL to check policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payment_accounts';
```

---

## 📊 Expected Results After Fix

### ✅ Success Scenario
```
Console: "Account creation response: { accData: { stripeAccountId: 'acct_...', status: 'onboarding' } }"
Console: "Link creation response: { linkData: { url: 'https://connect.stripe.com/...' } }"
Toast: "Redirecting to Stripe..."
→ Browser redirects to Stripe onboarding
```

### ❌ Error Scenarios

#### Error: "Missing authorization header"
**Cause:** Not logged in
**Fix:** Log in as landlord

#### Error: "Failed to create Stripe account: Invalid API Key"
**Cause:** Wrong Stripe key
**Fix:** Update `STRIPE_SECRET_KEY` secret

#### Error: "Failed to save account: permission denied"
**Cause:** RLS policy blocking
**Fix:** Update RLS policy to allow authenticated users to insert

#### Error: "column 'stripe_account_status' does not exist"
**Cause:** Migration not applied
**Fix:** Run the SQL from Step 1

---

## 🧪 Testing Checklist

After applying the fix:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Open console (F12)
- [ ] Click "Complete Payout Setup"
- [ ] Check console logs for detailed error
- [ ] Share the exact error message

---

## 📝 What I've Already Done

✅ Fixed CORS issues (all functions)
✅ Added proper OPTIONS handling
✅ Improved error messages in Edge Functions
✅ Updated frontend to show detailed errors
✅ Created SQL migration script
✅ Redeployed landlord-onboarding function

---

## 🎯 Next Action Required

**Please do ONE of these:**

### Option 1: Apply the SQL Migration (FASTEST)
1. Open Supabase Dashboard SQL Editor
2. Run the contents of `apply_stripe_connect_columns.sql`
3. Test again

### Option 2: Share the Detailed Error
1. Hard refresh browser
2. Click "Complete Payout Setup"
3. Copy the error from console
4. Share it with me

The console will now show something like:
```
Account creation response: { accData: {...}, accError: {...} }
Error: [Detailed message here]
```

---

## 🔍 Debug Commands

If you want to investigate yourself:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_accounts';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'payment_accounts';

-- Check if payment_accounts table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'payment_accounts'
);
```

---

**Status:** Waiting for SQL migration to be applied OR detailed error message from console
