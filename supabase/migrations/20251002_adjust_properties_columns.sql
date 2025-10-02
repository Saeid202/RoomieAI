-- Align properties table with current app fields
-- - Add lease_duration, backfill from lease_terms, drop lease_terms
-- - Convert furnished to BOOLEAN (preserve values)
-- - Ensure latitude/longitude columns exist

BEGIN;

-- 1) Add lease_duration if missing
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS lease_duration TEXT;

-- 2) Backfill lease_duration from legacy lease_terms when empty
UPDATE public.properties
SET lease_duration = COALESCE(lease_duration, lease_terms)
WHERE lease_duration IS NULL AND lease_terms IS NOT NULL;

-- 3) Drop legacy lease_terms if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'properties'
      AND column_name = 'lease_terms'
  ) THEN
    ALTER TABLE public.properties DROP COLUMN lease_terms;
  END IF;
END $$;

-- 4) Convert furnished from TEXT to BOOLEAN if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'properties'
      AND column_name = 'furnished'
      AND data_type <> 'boolean'
  ) THEN
    ALTER TABLE public.properties
      ALTER COLUMN furnished TYPE boolean
      USING CASE
        WHEN furnished::text ILIKE 'true'
          OR furnished::text ILIKE 'yes'
          OR furnished::text ILIKE 'furnished'
          OR furnished::text ILIKE 'fully furnished'
          OR furnished::text ILIKE 'semi-furnished'
          OR furnished::text ILIKE 'semi furnished'
          OR furnished::text ILIKE 'partially furnished'
          OR furnished::text ILIKE 'partially-furnished'
        THEN true
        WHEN furnished::text ILIKE 'false'
          OR furnished::text ILIKE 'no'
          OR furnished::text ILIKE 'unfurnished'
        THEN false
        ELSE NULL
      END;
  END IF;
END $$;

-- 5) Ensure latitude/longitude columns exist with expected numeric types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='properties' AND column_name='latitude'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN latitude DECIMAL(10,8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='properties' AND column_name='longitude'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN longitude DECIMAL(11,8);
  END IF;
END $$;

COMMIT;



