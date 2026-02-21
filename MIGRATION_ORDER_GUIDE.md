# PAD Payment System - Migration Order Guide

## Issue Found
Your database uses `rental_payments` table, but the original migrations referenced `rent_payments`. I've created corrected versions.

## Migration Files Status

### ❌ DO NOT USE (Wrong table name):
- `supabase/migrations/20260219_add_pad_support.sql` - References `rent_payments` (wrong)
- `supabase/migrations/20260220_add_payment_status_tracking.sql` - References `rent_payments` (wrong)

### ✅ USE THESE (Corrected):
- `supabase/migrations/20260219_add_pad_support_CORRECTED.sql` - Uses `rental_payments` (correct)
- `supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql` - Uses `rental_payments` (correct)

## Step-by-Step Migration Order

### Step 1: Verify Your Database Tables
Run this first to confirm which tables exist:
```bash
# Run: check_payment_tables.sql
```

Expected output should show:
- `payment_methods` table exists
- `rental_payments` table exists (NOT rent_payments)

### Step 2: Run First Migration (PAD Support)
```bash
# Run in Supabase SQL Editor:
supabase/migrations/20260219_add_pad_support_CORRECTED.sql
```

This adds:
- PAD payment type columns to `payment_methods`
- Mandate tracking (mandate_id, mandate_status, mandate_accepted_at)
- Bank details (bank_name, transit_number, institution_number)
- Fee tracking columns to `rental_payments`
- Processing time tracking
- Indexes for performance

### Step 3: Run Second Migration (Status Tracking)
```bash
# Run in Supabase SQL Editor:
supabase/migrations/20260220_add_payment_status_tracking_CORRECTED.sql
```

This adds:
- Enhanced payment statuses (initiated, processing, clearing, succeeded)
- Failure tracking (failure_reason, failure_code, retry_count)
- Notification tracking (tenant_notified_at, landlord_notified_at)
- Payment metadata JSONB column
- Additional indexes

### Step 4: Verify Migrations
After running both migrations, verify with these queries:

```sql
-- Check payment_methods has PAD columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
AND column_name IN ('payment_type', 'mandate_id', 'stripe_payment_method_id')
ORDER BY column_name;

-- Check rental_payments has PAD columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rental_payments' 
AND column_name IN ('payment_method_type', 'transaction_fee', 'expected_clear_date', 'failure_code')
ORDER BY column_name;

-- Check indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('payment_methods', 'rental_payments')
AND (indexname LIKE '%pad%' OR indexname LIKE '%payment_type%' OR indexname LIKE '%mandate%' OR indexname LIKE '%failure%')
ORDER BY tablename, indexname;
```

## What Each Migration Does

### Migration 1: PAD Support
**payment_methods table:**
- `payment_type` - Distinguishes card vs PAD vs bank_account
- `mandate_id` - Stripe mandate ID for PAD authorization
- `mandate_status` - active, inactive, pending, revoked
- `mandate_accepted_at` - When tenant accepted PAD terms
- `bank_name`, `transit_number`, `institution_number` - Bank details
- `stripe_payment_method_id` - Stripe PM reference
- Card details: `card_type`, `brand`, `last4`, `exp_month`, `exp_year`

**rental_payments table:**
- `payment_method_type` - card or acss_debit (for reporting)
- `transaction_fee` - Actual fee charged (1% PAD vs 2.9% card)
- `processing_days` - 0 for card, 3-5 for PAD
- `payment_cleared_at` - When PAD payment cleared
- `expected_clear_date` - Expected clear date for PAD
- `stripe_mandate_id` - Reference to mandate used
- `stripe_payment_intent_id` - Stripe PaymentIntent ID

### Migration 2: Status Tracking
**rental_payments table:**
- Enhanced status values: `initiated`, `processing`, `clearing`, `succeeded`
- `failure_reason` - Human-readable failure message
- `failure_code` - Stripe error code (insufficient_funds, etc.)
- `retry_count` - Number of retry attempts
- `last_retry_at` - Last retry timestamp
- `tenant_notified_at` - Tenant notification timestamp
- `landlord_notified_at` - Landlord notification timestamp
- `payment_metadata` - JSONB for additional data

## Next Steps After Migrations

Once migrations are complete, you can proceed with:
1. Phase 2: Tenant UI for payment method selection
2. Phase 3: Payment processing logic
3. Phase 4: Landlord payout integration
4. Phase 5: Testing and monitoring

## Troubleshooting

### If migration fails with "column already exists"
This is OK - the migrations use `ADD COLUMN IF NOT EXISTS`, so they're safe to re-run.

### If migration fails with "constraint already exists"
The migrations drop constraints before recreating them, so this should not happen. If it does, manually drop the constraint first.

### If you see "relation does not exist"
Double-check you're using the CORRECTED migration files that reference `rental_payments`, not `rent_payments`.
