-- Fix missing tables that are causing console errors
-- This script ensures all required tables exist

-- Check if roommate table exists, if not create it
CREATE TABLE IF NOT EXISTS public.roommate (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  email TEXT,
  phone_number TEXT,
  linkedin_profile TEXT,
  preferred_location TEXT,
  budget_range TEXT,
  move_in_date DATE,
  housing_type TEXT,
  living_space TEXT,
  smoking BOOLEAN,
  lives_with_smokers BOOLEAN,
  has_pets BOOLEAN,
  pet_preference TEXT,
  work_location TEXT,
  work_schedule TEXT,
  hobbies TEXT[],
  diet TEXT,
  roommate_gender_preference TEXT,
  roommate_lifestyle_preference TEXT,
  important_roommate_traits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;

-- Create policies for roommate table
DROP POLICY IF EXISTS "Users can view their own roommate profile" ON public.roommate;
DROP POLICY IF EXISTS "Users can insert their own roommate profile" ON public.roommate;
DROP POLICY IF EXISTS "Users can update their own roommate profile" ON public.roommate;
DROP POLICY IF EXISTS "Users can delete their own roommate profile" ON public.roommate;

CREATE POLICY "Users can view their own roommate profile" ON public.roommate
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roommate profile" ON public.roommate
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roommate profile" ON public.roommate
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roommate profile" ON public.roommate
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_roommate_updated_at ON public.roommate;
CREATE TRIGGER update_roommate_updated_at
  BEFORE UPDATE ON public.roommate
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verify the table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roommate' 
AND table_schema = 'public'
ORDER BY ordinal_position;
