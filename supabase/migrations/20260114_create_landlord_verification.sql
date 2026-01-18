-- Create table for storing Landlord/Realtor Verification Information
CREATE TABLE IF NOT EXISTS public.landlord_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  
  -- The role they identify as: 'landlord', 'realtor', 'property_manager', etc.
  -- This is distinct from the app-wide role (which might just be 'landlord')
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  
  -- Specific type they selected in the dropdown
  user_type TEXT NOT NULL CHECK (user_type IN ('landlord', 'realtor', 'property_manager', 'other')),
  
  -- For Realtors
  license_number TEXT,
  license_document_url TEXT,
  
  -- For Everyone
  government_id_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.landlord_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification status
CREATE POLICY "Users can view own verification" 
ON public.landlord_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own verification request
CREATE POLICY "Users can insert own verification" 
ON public.landlord_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification request (only if pending)
CREATE POLICY "Users can update own verification if pending" 
ON public.landlord_verifications 
FOR UPDATE 
USING (auth.uid() = user_id AND verification_status = 'pending');

-- Admins can view all (assuming admin policy exists generally, but adding specific here if needed)
-- (Skipping explicit admin policy for now as RLS is usually handled via service role for admins or separate admin policies)
