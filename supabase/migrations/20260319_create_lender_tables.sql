-- Lender Role Tables
-- Run this in Supabase SQL Editor

-- 1. Add 'lender' to user_role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('seeker', 'landlord', 'buyer', 'mortgage_broker', 'lawyer', 'lender', 'admin', 'construction');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lender';

-- 2. Create lender_profiles table
CREATE TABLE IF NOT EXISTS public.lender_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  license_number TEXT,
  license_state TEXT,
  nmls_id TEXT,
  company_address TEXT,
  company_city TEXT,
  company_province TEXT,
  company_postal_code TEXT,
  company_description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create lender_rates table
CREATE TABLE IF NOT EXISTS public.lender_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  term_years INTEGER NOT NULL,
  interest_rate DECIMAL(5,3) NOT NULL,
  apr DECIMAL(5,3),
  points DECIMAL(5,3) DEFAULT 0,
  min_loan_amount DECIMAL(12,2),
  max_loan_amount DECIMAL(12,2),
  min_credit_score INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create lender_rate_history table
CREATE TABLE IF NOT EXISTS public.lender_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  rate_id UUID REFERENCES public.lender_rates(id) ON DELETE SET NULL,
  loan_type TEXT NOT NULL,
  term_years INTEGER NOT NULL,
  old_rate DECIMAL(5,3),
  new_rate DECIMAL(5,3),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- 5. Update mortgage_profiles to add lender fields
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES public.lender_profiles(id);
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS lender_access_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS consent_granted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.mortgage_profiles ADD COLUMN IF NOT EXISTS consent_granted_to UUID REFERENCES auth.users(id);

-- 6. Enable RLS for lender_profiles
ALTER TABLE public.lender_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lender profile" ON lender_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lender profile" ON lender_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lender profile" ON lender_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active lender profiles" ON lender_profiles
  FOR SELECT USING (is_active = TRUE AND is_verified = TRUE);

-- 7. Enable RLS for lender_rates
ALTER TABLE public.lender_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lender can view their own rates" ON lender_rates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_rates.lender_id AND lender_profiles.user_id = auth.uid())
  );

CREATE POLICY "Lender can manage their own rates" ON lender_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_rates.lender_id AND lender_profiles.user_id = auth.uid())
  );

CREATE POLICY "Anyone can view active rates" ON lender_rates
  FOR SELECT USING (is_active = TRUE);

-- 8. Enable RLS for lender_rate_history
ALTER TABLE public.lender_rate_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lender can view their rate history" ON lender_rate_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_rate_history.lender_id AND lender_profiles.user_id = auth.uid())
  );

CREATE POLICY "Lender can insert rate history" ON lender_rate_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_rate_history.lender_id AND lender_profiles.user_id = auth.uid())
  );

-- Verify tables created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'lender%';