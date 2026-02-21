# Migration Fix Summary

## Problem Identified ❌
The Phase 1 migrations failed because they referenced the wrong table name:
- **Expected**: `rental_payments` (your actual table)
- **Used**: `rent_payments` (incorrect)

Error message: `ERROR: 42P01: relation 'public.rent_payments' does not exist`

## Root Cause
Your database uses `rental_payments` table (confirmed by searching existing SQL files), but the migrations I created referenced `rent_payments` from the base payment system migration template.

## Solution ✅

### Created Corrected Migration Files:
1. ✅ `supabase/migrations/20260219_add_pad_support_CORRECTED.sql`
   - Changed all `rent_payments` → `rental_payments`
   - All functionality preserved
   
2. ✅ `supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql`
   - Changed all `rent_payments` → `rental_payments`
   - All functionality preserved

### Created Helper Files:
3. ✅ `check_payment_tables.sql` - Verify which tables exist
4. ✅ `MIGRATION_ORDER_GUIDE.md` - Step-by-step migration instructions

## What to Do Next

### Step 1: Verify Tables (Optional)
Run `check_payment_tables.sql` to confirm your table structure.

### Step 2: Run Corrected Migrations
Execute in this order:

```sql
-- First migration: PAD support
-- File: supabase/migrations/20260219_add_pad_support_CORRECTED.sql
-- Adds: payment_type, mandate tracking, bank details, fee tracking

-- Second migration: Status tracking  
-- File: supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql
-- Adds: enhanced statuses, failure tracking, notifications
```

### Step 3: Verify Success
After running migrations, check that new columns exist:

```sql
-- Should show payment_type, mandate_id, etc.
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
AND column_name LIKE '%mandate%' OR column_name = 'payment_type';

-- Should show payment_method_type, transaction_fee, etc.
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'rental_payments' 
AND column_name IN ('payment_method_type', 'transaction_fee', 'expected_clear_date');
```

## Files Status

### ❌ Do NOT Use:
- `supabase/migrations/20260219_add_pad_support.sql` (wrong table name)
- `supabase/migrations/20260220_add_payment_status_tracking.sql` (wrong table name)

### ✅ Use These:
- `supabase/migrations/20260219_add_pad_support_CORRECTED.sql` ✅
- `supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql` ✅

## What Changed in Corrected Files

### Changes Made:
- `rent_payments` → `rental_payments` (all occurrences)
- `rent_payments_status_check` → `rental_payments_status_check`
- `idx_rent_payments_*` → `idx_rental_payments_*` (index names)
- Added verification queries at the end

### What Stayed the Same:
- All column definitions
- All data types
- All constraints
- All indexes (just renamed)
- All functionality

## Migration Details

### Migration 1 Adds to `payment_methods`:
- payment_type (card, acss_debit, bank_account)
- mandate_id, mandate_status, mandate_accepted_at
- bank_name, transit_number, institution_number
- stripe_payment_method_id
- card_type, brand, last4, exp_month, exp_year

### Migration 1 Adds to `rental_payments`:
- payment_method_type
- transaction_fee
- processing_days
- payment_cleared_at
- expected_clear_date
- stripe_mandate_id
- stripe_payment_intent_id

### Migration 2 Adds to `rental_payments`:
- Enhanced status values (initiated, processing, clearing, succeeded)
- failure_reason, failure_code
- retry_count, last_retry_at
- tenant_notified_at, landlord_notified_at
- payment_metadata (JSONB)

## Next Steps After Migrations

Once migrations complete successfully:
1. ✅ Phase 1 Foundation complete
2. → Move to Phase 2: Tenant Payment UI
3. → Implement payment method selection
4. → Build PAD bank connection flow

## Need Help?

See `MIGRATION_ORDER_GUIDE.md` for detailed step-by-step instructions with troubleshooting tips.
