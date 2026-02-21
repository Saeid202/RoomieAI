-- Payment Status Tracking Enhancement
-- Phase 1: Add enhanced status tracking for PAD payments
-- Created: 2026-02-19

BEGIN;

-- =====================================================
-- 1. EXTEND rent_payments STATUS VALUES
-- =====================================================
-- Add new status values for PAD payment lifecycle

-- Drop existing constraint
ALTER TABLE public.rent_payments 
DROP CONSTRAINT IF EXISTS rent_payments_status_check;

-- Add new constraint with PAD statuses
ALTER TABLE public.rent_payments 
ADD CONSTRAINT rent_payments_status_check 
CHECK (status IN (
  'pending',      -- Initial state
  'initiated',    -- Payment initiated (PAD or Card)
  'processing',   -- Payment processing (Card instant, PAD 1-2 days)
  'clearing',     -- PAD clearing (days 2-4)
  'succeeded',    -- Payment successful and cleared
  'paid',         -- Legacy status (keep for backward compatibility)
  'late',         -- Payment overdue
  'failed',       -- Payment failed (NSF, declined, etc.)
  'refunded'      -- Payment refunded
));

-- =====================================================
-- 2. ADD FAILURE TRACKING
-- =====================================================

-- Add failure reason for failed payments
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(255);

-- Add failure code for programmatic handling
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS failure_code VARCHAR(50);

-- Add retry count for failed payments
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add last retry timestamp
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. ADD NOTIFICATION TRACKING
-- =====================================================

-- Track if tenant was notified
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS tenant_notified_at TIMESTAMP WITH TIME ZONE;

-- Track if landlord was notified
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS landlord_notified_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 4. ADD METADATA FOR FLEXIBILITY
-- =====================================================

-- Add metadata JSONB column for additional data
ALTER TABLE public.rent_payments 
ADD COLUMN IF NOT EXISTS payment_metadata JSONB;

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_rent_payments_status 
ON public.rent_payments(status);

-- Index on failure_code for error analysis
CREATE INDEX IF NOT EXISTS idx_rent_payments_failure_code 
ON public.rent_payments(failure_code) 
WHERE failure_code IS NOT NULL;

-- Index on retry_count for retry logic
CREATE INDEX IF NOT EXISTS idx_rent_payments_retry_count 
ON public.rent_payments(retry_count) 
WHERE retry_count > 0;

-- Composite index for pending payments that need processing
CREATE INDEX IF NOT EXISTS idx_rent_payments_pending_processing 
ON public.rent_payments(status, expected_clear_date) 
WHERE status IN ('processing', 'clearing');

-- =====================================================
-- 6. ADD COMMENTS
-- =====================================================

COMMENT ON COLUMN public.rent_payments.status IS 
'Payment status: pending, initiated, processing, clearing, succeeded, paid, late, failed, refunded';

COMMENT ON COLUMN public.rent_payments.failure_reason IS 
'Human-readable reason for payment failure (e.g., "Insufficient funds")';

COMMENT ON COLUMN public.rent_payments.failure_code IS 
'Machine-readable failure code from Stripe (e.g., "insufficient_funds", "card_declined")';

COMMENT ON COLUMN public.rent_payments.retry_count IS 
'Number of times payment retry was attempted';

COMMENT ON COLUMN public.rent_payments.payment_metadata IS 
'Additional payment data in JSON format (Stripe response, custom fields, etc.)';

COMMIT;

-- =====================================================
-- ROLLBACK SCRIPT
-- =====================================================
/*
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS public.idx_rent_payments_status;
DROP INDEX IF EXISTS public.idx_rent_payments_failure_code;
DROP INDEX IF EXISTS public.idx_rent_payments_retry_count;
DROP INDEX IF EXISTS public.idx_rent_payments_pending_processing;

-- Remove columns
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS failure_reason;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS failure_code;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS retry_count;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS last_retry_at;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS tenant_notified_at;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS landlord_notified_at;
ALTER TABLE public.rent_payments DROP COLUMN IF EXISTS payment_metadata;

-- Restore original constraint
ALTER TABLE public.rent_payments DROP CONSTRAINT IF EXISTS rent_payments_status_check;
ALTER TABLE public.rent_payments 
ADD CONSTRAINT rent_payments_status_check 
CHECK (status IN ('pending', 'paid', 'late', 'failed', 'refunded'));

COMMIT;
*/
