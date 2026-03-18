-- =====================================================
-- ADD AI SCREENING CONSENT TRACKING
-- =====================================================
-- Adds consent_given + consent_date to rental_applications
-- and creates an immutable ai_screening_consent_log for
-- full audit trail (who consented, when, from where).
-- AI screening is blocked at the DB level if no consent.
-- =====================================================

-- 1. Add consent columns to rental_applications
ALTER TABLE public.rental_applications
  ADD COLUMN IF NOT EXISTS ai_screening_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_screening_consent_date  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_screening_consent_ip    TEXT,
  ADD COLUMN IF NOT EXISTS ai_screening_consent_text  TEXT; -- exact wording shown to tenant at time of consent

-- Existing rows: consent is unknown — leave as FALSE (no retroactive consent)
COMMENT ON COLUMN public.rental_applications.ai_screening_consent_given IS
  'Tenant explicitly consented to AI screening of their application';
COMMENT ON COLUMN public.rental_applications.ai_screening_consent_date IS
  'Timestamp when consent was recorded';
COMMENT ON COLUMN public.rental_applications.ai_screening_consent_ip IS
  'IP address of tenant at time of consent';
COMMENT ON COLUMN public.rental_applications.ai_screening_consent_text IS
  'Exact consent disclosure text shown to the tenant';

-- 2. Immutable consent audit log
--    Rows are INSERT-only — no UPDATE or DELETE allowed.
CREATE TABLE IF NOT EXISTS public.ai_screening_consent_log (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID        NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  tenant_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given   BOOLEAN     NOT NULL,
  consent_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_ip      TEXT,
  consent_text    TEXT,         -- snapshot of the disclosure wording
  user_agent      TEXT,         -- browser/device info for audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_screening_consent_log ENABLE ROW LEVEL SECURITY;

-- Tenants can read their own consent records
CREATE POLICY "Tenants can view own consent log"
  ON public.ai_screening_consent_log FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid());

-- Landlords can read consent logs for applications on their properties
CREATE POLICY "Landlords can view consent for their applications"
  ON public.ai_screening_consent_log FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT ra.id FROM public.rental_applications ra
      JOIN public.properties p ON p.id = ra.property_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Only authenticated users can insert (app writes consent on submission)
CREATE POLICY "Authenticated users can insert consent"
  ON public.ai_screening_consent_log FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.uid());

-- Nobody can update or delete consent records
CREATE POLICY "No updates to consent log"
  ON public.ai_screening_consent_log FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No deletes from consent log"
  ON public.ai_screening_consent_log FOR DELETE
  TO authenticated
  USING (false);

CREATE INDEX idx_consent_log_application ON public.ai_screening_consent_log(application_id);
CREATE INDEX idx_consent_log_tenant      ON public.ai_screening_consent_log(tenant_id);
CREATE INDEX idx_consent_log_date        ON public.ai_screening_consent_log(consent_date DESC);

-- 3. Guard function: block AI screening if consent not given
CREATE OR REPLACE FUNCTION public.assert_ai_screening_consent(p_application_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consent BOOLEAN;
BEGIN
  SELECT ai_screening_consent_given
    INTO v_consent
    FROM public.rental_applications
   WHERE id = p_application_id;

  IF v_consent IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  IF NOT v_consent THEN
    RAISE EXCEPTION 'AI screening blocked: tenant has not given consent for application %', p_application_id
      USING ERRCODE = 'P0001';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_ai_screening_consent(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assert_ai_screening_consent(UUID) TO authenticated;

COMMENT ON FUNCTION public.assert_ai_screening_consent IS
  'Call before running AI screening. Raises an exception if the tenant has not consented.';
