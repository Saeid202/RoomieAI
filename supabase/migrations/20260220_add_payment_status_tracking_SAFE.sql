-- Payment Status Tracking Enhancement (SAFE VERSION)
-- Phase 1: Add enhanced status tracking for PAD payments
-- Created: 2026-02-19
-- SAFE: Handles existing constraints gracefully

BEGIN;

-- =====================================================
-- 1. EXTEND rental_payments STATUS VALUES
-- =====================================================
-- Add new status values for PAD payment lifecycle

-- Drop existing status constraint if it exists
DO $$ 
BEGIN
    -- Try to drop the constraint, ignore if it doesn't exist
    ALTER TABLE public.rental_payments 
    DROP CONSTRAINT IF EXISTS rental_payments_status_check;
    
    -- Also try common variations of the constraint name
    ALTER TABLE public.rental_payments 
    DROP CONSTRAINT IF EXISTS rental_payments_status_check1;
    
    ALTER TABLE public.rental_payments 
    DROP CONSTRAINT IF EXISTS rental_payments_status_check2;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No existing status constraint found, continuing...';
END $$;

-- Add new constraint with PAD statuses
ALTER TABLE public.rental_payments 
ADD CONSTRAINT rental_payments_status_check 
CHECK (status IN (
  'pending',      -- Initial state
  'initiated',    -- Payment initiated (PAD or Card)
  'processing',   -- Payment processing (Card instant, PAD 1-2 days)
  'clearing',     -- PAD clearing (days 2-4)
  'succeeded',    -- Payment successful and cleared
  'paid',         -- Legacy status (keep for backward compatibility)
  'late',         -- Payment overdue
  'failed',       -- Payment failed (NSF, declined, etc.)
  'refunded',     -- Payment refunded
  'cancelled'     -- Payment cancelled
));

-- =====================================================
-- 2. ADD FAILURE TRACKING
-- =====================================================

-- Add failure reason for failed payments
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(255);

-- Add failure code for programmatic handling
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS failure_code VARCHAR(50);

-- Add retry count for failed payments
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add last retry timestamp
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. ADD NOTIFICATION TRACKING
-- =====================================================

-- Track if tenant was notified
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS tenant_notified_at TIMESTAMP WITH TIME ZONE;

-- Track if landlord was notified
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS landlord_notified_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 4. ADD METADATA FOR FLEXIBILITY
-- =====================================================

-- Add metadata JSONB column for additional data
ALTER TABLE public.rental_payments 
ADD COLUMN IF NOT EXISTS payment_metadata JSONB;

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_rental_payments_status_pad 
ON public.rental_payments(status);

-- Index on failure_code for error analysis
CREATE INDEX IF NOT EXISTS idx_rental_payments_failure_code 
ON public.rental_payments(failure_code) 
WHERE failure_code IS NOT NULL;

-- Index on retry_count for retry logic
CREATE INDEX IF NOT EXISTS idx_rental_payments_retry_count 
ON public.rental_payments(retry_count) 
WHERE retry_count > 0;

-- Composite index for pending payments that need processing
CREATE INDEX IF NOT EXISTS idx_rental_payments_pending_processing 
ON public.rental_payments(status, expected_clear_date) 
WHERE status IN ('processing', 'clearing');

-- =====================================================
-- 6. ADD COMMENTS
-- =====================================================

COMMENT ON COLUMN public.rental_payments.status IS 
'Payment status: pending, initiated, processing, clearing, succeeded, paid, late, failed, refunded, cancelled';

COMMENT ON COLUMN public.rental_payments.failure_reason IS 
'Human-readable reason for payment failure (e.g., "Insufficient funds")';

COMMENT ON COLUMN public.rental_payments.failure_code IS 
'Machine-readable failure code from Stripe (e.g., "insufficient_funds", "card_declined")';

COMMENT ON COLUMN public.rental_payments.retry_count IS 
'Number of times payment retry was attempted';

COMMENT ON COLUMN public.rental_payments.payment_metadata IS 
'Additional payment data in JSON format (Stripe response, custom fields, etc.)';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rental_payments' 
AND column_name IN ('failure_reason', 'failure_code', 'retry_count', 'payment_metadata', 'tenant_notified_at', 'landlord_notified_at')
ORDER BY column_name;

-- Check status constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.rental_payments'::regclass
AND conname LIKE '%status%';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'rental_payments'
AND (indexname LIKE '%failure%' OR indexname LIKE '%retry%' OR indexname LIKE '%pending%' OR indexname LIKE '%status%')
ORDER BY indexname;

-- Success message
SELECT '✅ Payment Status Tracking Migration Complete!' as status;
