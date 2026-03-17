-- Drop existing policies if any, then recreate
DROP POLICY IF EXISTS "Lenders can view own profile" ON public.lender_profiles;
DROP POLICY IF EXISTS "Lenders can update own profile" ON public.lender_profiles;
DROP POLICY IF EXISTS "Lenders can insert own profile" ON public.lender_profiles;
DROP POLICY IF EXISTS "Lenders can view own rates" ON public.lender_rates;
DROP POLICY IF EXISTS "Lenders can insert own rates" ON public.lender_rates;
DROP POLICY IF EXISTS "Lenders can update own rates" ON public.lender_rates;
DROP POLICY IF EXISTS "Lenders can delete own rates" ON public.lender_rates;

CREATE POLICY "Lenders can view own profile"
  ON public.lender_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Lenders can update own profile"
  ON public.lender_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Lenders can insert own profile"
  ON public.lender_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Lenders can view own rates"
  ON public.lender_rates FOR SELECT
  USING (lender_id IN (SELECT id FROM public.lender_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Lenders can insert own rates"
  ON public.lender_rates FOR INSERT
  WITH CHECK (lender_id IN (SELECT id FROM public.lender_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Lenders can update own rates"
  ON public.lender_rates FOR UPDATE
  USING (lender_id IN (SELECT id FROM public.lender_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Lenders can delete own rates"
  ON public.lender_rates FOR DELETE
  USING (lender_id IN (SELECT id FROM public.lender_profiles WHERE user_id = auth.uid()));
