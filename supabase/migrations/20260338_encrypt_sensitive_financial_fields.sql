-- =====================================================
-- ENCRYPT SENSITIVE FINANCIAL FIELDS
-- =====================================================
-- Uses pgcrypto pgp_sym_encrypt / pgp_sym_decrypt.
-- Key is stored in a private.app_secrets table —
-- no ALTER DATABASE / superuser needed.
-- =====================================================

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create private schema + secrets table
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_secrets (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Lock it down — anon and authenticated roles cannot touch it
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.app_secrets FROM PUBLIC, anon, authenticated;

-- 3. Store the encryption key
--    Replace the value below if you want a different key.
INSERT INTO private.app_secrets (key, value)
VALUES (
    'encryption_key',
    '58a3f1ac46e5c9db46fa230ab5dfdfac7dd13bd24391a6700d0e51a440a7f391'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =====================================================
-- 4. MORTGAGE_PROFILES – add encrypted columns
-- =====================================================

ALTER TABLE public.mortgage_profiles
  ADD COLUMN IF NOT EXISTS credit_score_range_enc        BYTEA,
  ADD COLUMN IF NOT EXISTS monthly_debt_payments_enc     BYTEA,
  ADD COLUMN IF NOT EXISTS missed_payments_enc           BYTEA,
  ADD COLUMN IF NOT EXISTS bankruptcy_history_enc        BYTEA,
  ADD COLUMN IF NOT EXISTS credit_notes_enc              BYTEA,
  ADD COLUMN IF NOT EXISTS income_range_enc              BYTEA,
  ADD COLUMN IF NOT EXISTS liquid_savings_enc            BYTEA,
  ADD COLUMN IF NOT EXISTS investment_value_enc          BYTEA,
  ADD COLUMN IF NOT EXISTS intended_down_payment_enc     BYTEA,
  ADD COLUMN IF NOT EXISTS gift_amount_range_enc         BYTEA,
  ADD COLUMN IF NOT EXISTS funding_other_enc             BYTEA,
  ADD COLUMN IF NOT EXISTS co_borrower_details_enc       BYTEA,
  ADD COLUMN IF NOT EXISTS date_of_birth_enc             BYTEA,
  ADD COLUMN IF NOT EXISTS phone_number_enc              BYTEA;

-- Migrate existing plaintext → encrypted
DO $$
DECLARE
  enc_key TEXT;
BEGIN
  SELECT value INTO enc_key FROM private.app_secrets WHERE key = 'encryption_key';

  IF enc_key IS NULL OR enc_key = '' THEN
    RAISE EXCEPTION 'encryption_key not found in private.app_secrets';
  END IF;

  UPDATE public.mortgage_profiles SET
    credit_score_range_enc    = CASE WHEN credit_score_range IS NOT NULL
                                  THEN pgp_sym_encrypt(credit_score_range, enc_key) END,
    monthly_debt_payments_enc = CASE WHEN monthly_debt_payments IS NOT NULL
                                  THEN pgp_sym_encrypt(monthly_debt_payments::TEXT, enc_key) END,
    missed_payments_enc       = CASE WHEN missed_payments_last_12_months IS NOT NULL
                                  THEN pgp_sym_encrypt(missed_payments_last_12_months::TEXT, enc_key) END,
    bankruptcy_history_enc    = CASE WHEN bankruptcy_proposal_history IS NOT NULL
                                  THEN pgp_sym_encrypt(bankruptcy_proposal_history::TEXT, enc_key) END,
    credit_notes_enc          = CASE WHEN credit_additional_notes IS NOT NULL
                                  THEN pgp_sym_encrypt(credit_additional_notes, enc_key) END,
    income_range_enc          = CASE WHEN income_range IS NOT NULL
                                  THEN pgp_sym_encrypt(income_range, enc_key) END,
    liquid_savings_enc        = CASE WHEN liquid_savings_balance IS NOT NULL
                                  THEN pgp_sym_encrypt(liquid_savings_balance, enc_key) END,
    investment_value_enc      = CASE WHEN investment_value_range IS NOT NULL
                                  THEN pgp_sym_encrypt(investment_value_range, enc_key) END,
    intended_down_payment_enc = CASE WHEN intended_down_payment IS NOT NULL
                                  THEN pgp_sym_encrypt(intended_down_payment, enc_key) END,
    gift_amount_range_enc     = CASE WHEN gift_amount_range IS NOT NULL
                                  THEN pgp_sym_encrypt(gift_amount_range, enc_key) END,
    funding_other_enc         = CASE WHEN funding_other_explanation IS NOT NULL
                                  THEN pgp_sym_encrypt(funding_other_explanation, enc_key) END,
    co_borrower_details_enc   = CASE WHEN co_borrower_details IS NOT NULL
                                  THEN pgp_sym_encrypt(co_borrower_details, enc_key) END,
    date_of_birth_enc         = CASE WHEN date_of_birth IS NOT NULL
                                  THEN pgp_sym_encrypt(date_of_birth::TEXT, enc_key) END,
    phone_number_enc          = CASE WHEN phone_number IS NOT NULL
                                  THEN pgp_sym_encrypt(phone_number, enc_key) END;
END $$;

-- Drop plaintext columns
ALTER TABLE public.mortgage_profiles
  DROP COLUMN IF EXISTS credit_score_range,
  DROP COLUMN IF EXISTS monthly_debt_payments,
  DROP COLUMN IF EXISTS missed_payments_last_12_months,
  DROP COLUMN IF EXISTS bankruptcy_proposal_history,
  DROP COLUMN IF EXISTS credit_additional_notes,
  DROP COLUMN IF EXISTS income_range,
  DROP COLUMN IF EXISTS liquid_savings_balance,
  DROP COLUMN IF EXISTS investment_value_range,
  DROP COLUMN IF EXISTS intended_down_payment,
  DROP COLUMN IF EXISTS gift_amount_range,
  DROP COLUMN IF EXISTS funding_other_explanation,
  DROP COLUMN IF EXISTS co_borrower_details,
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS phone_number;

-- =====================================================
-- 5. RENTAL_APPLICATIONS – encrypt monthly_income
-- =====================================================

ALTER TABLE public.rental_applications
  ADD COLUMN IF NOT EXISTS monthly_income_enc BYTEA;

DO $$
DECLARE
  enc_key TEXT;
BEGIN
  SELECT value INTO enc_key FROM private.app_secrets WHERE key = 'encryption_key';

  UPDATE public.rental_applications SET
    monthly_income_enc = CASE WHEN monthly_income IS NOT NULL
                           THEN pgp_sym_encrypt(monthly_income::TEXT, enc_key) END;
END $$;

ALTER TABLE public.rental_applications
  DROP CONSTRAINT IF EXISTS valid_monthly_income;

ALTER TABLE public.rental_applications
  DROP COLUMN IF EXISTS monthly_income;

-- =====================================================
-- 6. Encrypt / decrypt helper functions
--    SECURITY DEFINER so they can read private.app_secrets
--    but callers cannot access the table directly.
-- =====================================================

CREATE OR REPLACE FUNCTION public.encrypt_financial(plaintext TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  enc_key TEXT;
BEGIN
  SELECT value INTO enc_key FROM private.app_secrets WHERE key = 'encryption_key';
  IF enc_key IS NULL THEN RAISE EXCEPTION 'Encryption key not configured'; END IF;
  IF plaintext IS NULL THEN RETURN NULL; END IF;
  RETURN pgp_sym_encrypt(plaintext, enc_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_financial(ciphertext BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  enc_key TEXT;
BEGIN
  SELECT value INTO enc_key FROM private.app_secrets WHERE key = 'encryption_key';
  IF enc_key IS NULL THEN RAISE EXCEPTION 'Encryption key not configured'; END IF;
  IF ciphertext IS NULL THEN RETURN NULL; END IF;
  RETURN pgp_sym_decrypt(ciphertext, enc_key);
END;
$$;

-- Only authenticated users can call these functions
REVOKE ALL ON FUNCTION public.encrypt_financial(TEXT)  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrypt_financial(BYTEA) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.encrypt_financial(TEXT)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_financial(BYTEA) TO authenticated;
