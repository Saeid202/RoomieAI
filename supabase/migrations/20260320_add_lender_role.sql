-- Add 'lender' to existing user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lender';

-- Create lender_profiles table
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

-- Create lender_rates table
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

-- Create lender_rate_history table
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

-- Enable RLS for lender_profiles
ALTER TABLE public.lender_profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS for lender_rates
ALTER TABLE public.lender_rates ENABLE ROW LEVEL SECURITY;

-- Enable RLS for lender_rate_history
ALTER TABLE public.lender_rate_history ENABLE ROW LEVEL SECURITY;
