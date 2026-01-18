# 🚨 URGENT FIX - Payment Tables Missing

## Problem Identified
The `payment_accounts` table **does not exist** in your production database.
This is why you're getting 500 errors.

## ✅ Solution (3 Steps)

### Step 1: Check What's Missing (OPTIONAL)
In the Supabase SQL Editor, run:
```sql
-- Copy contents of: check_tables_exist.sql
```
This will show which tables are missing.

### Step 2: Create Payment Accounts Table (REQUIRED)
In the Supabase SQL Editor, run:
```sql
-- Copy ALL contents of: setup_payment_accounts_complete.sql
```

**This will:**
- ✅ Create `payment_accounts` table
- ✅ Add all Stripe Connect columns
- ✅ Set up RLS policies
- ✅ Create indexes
- ✅ Add update triggers

### Step 3: Test the Fix
1. **Hard refresh** browser: `Ctrl+Shift+R`
2. Navigate to: `http://localhost:5173/dashboard/landlord/payments`
3. Click: **"Complete Payout Setup"**

**Expected Result:**
- ✅ No 500 errors
- ✅ Console shows: "Account creation response: { accData: { stripeAccountId: '...', status: 'onboarding' } }"
- ✅ Redirects to Stripe onboarding

---

## 📋 Files to Use

### File 1: `check_tables_exist.sql` (Optional)
Run this first to see what's missing.

### File 2: `setup_payment_accounts_complete.sql` (Required)
Run this to create the payment_accounts table with all necessary columns.

---

## ⚠️ Important Notes

1. **The table is completely missing** - This is why all previous attempts failed
2. **The migration files exist locally** but were never applied to production
3. **This is a one-time setup** - Once created, it won't need to be run again

---

## 🎯 After Running the SQL

You should see output like:
```
✅ payment_accounts table created
✅ Columns: id, user_id, account_type, stripe_account_id, stripe_account_status, etc.
✅ Policies: Users can view/insert/update their own payment accounts
✅ Payment accounts table setup complete!
```

Then test the onboarding flow again!

---

## 🔍 Why This Happened

The migration files exist in your local `supabase/migrations/` folder, but they were never applied to the production database. This commonly happens when:
- Migrations are created but not pushed
- Database was reset
- Project was created before migrations existed

**The fix is simple:** Just run the SQL script once and you're done!
