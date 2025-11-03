-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roommate table
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

-- Create co_owner table
CREATE TABLE IF NOT EXISTS public.co_owner (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  email TEXT,
  phone_number TEXT,
  occupation TEXT,
  preferred_location TEXT,
  investment_capacity INTEGER[],
  investment_timeline TEXT,
  property_type TEXT,
  co_ownership_experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create Both table for users who want both roommate and co-owner features
CREATE TABLE IF NOT EXISTS public."Both" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Both" ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for roommate table
CREATE POLICY "Users can view their own roommate profile" ON public.roommate
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roommate profile" ON public.roommate
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roommate profile" ON public.roommate
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roommate profile" ON public.roommate
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for co_owner table
CREATE POLICY "Users can view their own co_owner profile" ON public.co_owner
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own co_owner profile" ON public.co_owner
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own co_owner profile" ON public.co_owner
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own co_owner profile" ON public.co_owner
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for Both table
CREATE POLICY "Users can view their own Both profile" ON public."Both"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Both profile" ON public."Both"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Both profile" ON public."Both"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Both profile" ON public."Both"
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roommate_updated_at
  BEFORE UPDATE ON public.roommate
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_co_owner_updated_at
  BEFORE UPDATE ON public.co_owner
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_both_updated_at
  BEFORE UPDATE ON public."Both"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();