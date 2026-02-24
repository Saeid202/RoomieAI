-- Run this in Supabase SQL Editor to create the mortgage_profiles table

-- Create mortgage_profiles table
CREATE TABLE IF NOT EXISTS public.mortgage_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Basic Information
    full_name TEXT,
    email TEXT,
    age INTEGER,
    phone_number TEXT,
    date_of_birth DATE,
    first_time_buyer BOOLEAN,
    buying_with_co_borrower BOOLEAN,
    co_borrower_details TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.mortgage_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own mortgage profile"
    ON public.mortgage_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mortgage profile"
    ON public.mortgage_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mortgage profile"
    ON public.mortgage_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mortgage profile"
    ON public.mortgage_profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_mortgage_profiles_user_id ON public.mortgage_profiles(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mortgage_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mortgage_profiles_updated_at
    BEFORE UPDATE ON public.mortgage_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_mortgage_profiles_updated_at();

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'mortgage_profiles'
ORDER BY ordinal_position;
