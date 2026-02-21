# Run These Migrations - Updated Safe Versions

## Problem Solved ✅
The previous migration tried to reference a `method_type` column that doesn't exist in your `payment_methods` table. I've created SAFE versions that only add new columns without assuming any existing structure.

## Use These Files (SAFE Versions)

### ✅ Migration 1: PAD Support
**File:** `supabase/migrations/20260219_add_pad_support_SAFE.sql`

**What it does:**
- Adds PAD payment columns to `payment_methods` table
- Adds PAD tracking columns to `rental_payments` table
- Creates performance indexes
- Does NOT assume any existing columns
- Safe to run multiple times (uses IF NOT EXISTS)

**Run this first!**

### ✅ Migration 2: Status Tracking
**File:** `supabase/migrations/20260220_add_payment_status_tracking_SAFE.sql`

**What it does:**
- Extends payment status values for PAD lifecycle
- Adds failure tracking columns
- Adds notification tracking
- Handles existing constraints gracefully
- Safe to run multiple times

**Run this second!**

## Quick Start

### Step 1: Check Current Structure (Optional)
```sql
-- Run: check_payment_methods_columns.sql
-- This shows what columns currently exist
```

### Step 2: Run First Migration
Open Supabase SQL Editor and run:
```
supabase/migrations/20260219_add_pad_support_SAFE.sql
```

Expected result: "✅ PAD Support Migration Complete!"

### Step 3: Run Second Migration
Open Supabase SQL Editor and run:
```
supabase/migrations/20260220_add_payment_status_tracking_SAFE.sql
```

Expected result: "✅ Payment Status Tracking Migration Complete!"

### Step 4: Verify Success
Both migrations include verification queries at the end that will automatically run and show you what was created.

## What Gets Added

### To `payment_methods` table:
```
✅ payment_type - card, acss_debit, or bank_account
✅ mandate_id - Stripe mandate ID
✅ mandate_status - active, inactive, pending, revoked
✅ mandate_accepted_at - timestamp
✅ bank_name - Canadian bank name
✅ transit_number - 5-digit transit number
✅ institution_number - 3-digit institution number
✅ stripe_payment_method_id - Stripe PM ID
✅ card_type - credit or debit
✅ brand - Visa, Mastercard, etc.
✅ last4 - last 4 digits
✅ exp_month - expiration month
✅ exp_year - expiration year
```

### To `rental_payments` table:
```
✅ payment_method_type - card or acss_debit
✅ transaction_fee - actual fee charged
✅ processing_days - 0 for card, 3-5 for PAD
✅ payment_cleared_at - when payment cleared
✅ expected_clear_date - expected clear date
✅ stripe_mandate_id - mandate reference
✅ stripe_payment_intent_id - PaymentIntent ID
✅ failure_reason - human-readable error
✅ failure_code - Stripe error code
✅ retry_count - number of retries
✅ last_retry_at - last retry timestamp
✅ tenant_notified_at - notification timestamp
✅ landlord_notified_at - notification timestamp
✅ payment_metadata - JSONB for extra data
```

### Indexes Created:
```
✅ idx_payment_methods_payment_type
✅ idx_payment_methods_mandate_id
✅ idx_payment_methods_stripe_pm_id
✅ idx_rental_payments_method_type
✅ idx_rental_payments_clear_date
✅ idx_rental_payments_stripe_pi_id
✅ idx_rental_payments_status_pad
✅ idx_rental_payments_failure_code
✅ idx_rental_payments_retry_count
✅ idx_rental_payments_pending_processing
```

## Why These Are Safe

1. **IF NOT EXISTS** - Won't fail if columns already exist
2. **No assumptions** - Doesn't reference columns that might not exist
3. **Graceful constraint handling** - Drops old constraints before adding new ones
4. **Idempotent** - Can run multiple times safely
5. **Includes verification** - Shows you what was created

## Troubleshooting

### If you see "column already exists"
✅ This is fine! The migration will skip that column and continue.

### If you see "constraint already exists"
✅ The migration handles this - it drops old constraints first.

### If you see "relation does not exist"
❌ This means the table doesn't exist. Check:
- Is `payment_methods` table created?
- Is `rental_payments` table created?

Run `check_payment_tables.sql` to verify.

## After Migrations Complete

Once both migrations run successfully:
1. ✅ Phase 1 Foundation is complete
2. → Ready for Phase 2: Tenant Payment UI
3. → Can start building payment method selection
4. → Can implement PAD bank connection flow

## Files Summary

### ✅ Use These (SAFE):
- `supabase/migrations/20260219_add_pad_support_SAFE.sql` ← Run first
- `supabase/migrations/20260220_add_payment_status_tracking_SAFE.sql` ← Run second

### ❌ Don't Use (Had Issues):
- `supabase/migrations/20260219_add_pad_support.sql` (wrong table name)
- `supabase/migrations/20260219_add_pad_support_CORRECTED.sql` (assumes method_type exists)
- `supabase/migrations/20260220_add_payment_status_tracking.sql` (wrong table name)
- `supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql` (old version)

### 📋 Helper Files:
- `check_payment_methods_columns.sql` - See current structure
- `check_payment_tables.sql` - Verify tables exist

---

**Ready to run!** Start with the SAFE version of migration 1, then migration 2.
