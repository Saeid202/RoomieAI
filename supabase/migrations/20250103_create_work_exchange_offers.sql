-- Create work_exchange_offers table for work exchange functionality
-- Safe to run multiple times in dev; in prod ensure idempotency via IF NOT EXISTS

-- Create work_exchange_offers table
CREATE TABLE IF NOT EXISTS public.work_exchange_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information (denormalized for performance)
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Space Information
  space_type TEXT NOT NULL CHECK (space_type IN ('private-room', 'shared-room', 'studio', 'entire-apartment', 'basement', 'other')),
  work_requested TEXT NOT NULL,
  duration TEXT NOT NULL,
  work_hours_per_week TEXT NOT NULL,
  
  -- Location Details
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  
  -- Amenities and Additional Info
  amenities_provided TEXT[] DEFAULT '{}',
  additional_notes TEXT,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Contact Information
  contact_preference TEXT NOT NULL CHECK (contact_preference IN ('email', 'phone', 'messenger')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_user_id ON public.work_exchange_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_status ON public.work_exchange_offers(status);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_city ON public.work_exchange_offers(city);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_space_type ON public.work_exchange_offers(space_type);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_created_at ON public.work_exchange_offers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.work_exchange_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for work exchange offers
-- Anyone can view active offers
CREATE POLICY IF NOT EXISTS "Anyone can view active work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (status = 'active');

-- Users can view their own offers regardless of status
CREATE POLICY IF NOT EXISTS "Users can view their own work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own offers
CREATE POLICY IF NOT EXISTS "Users can create work exchange offers"
ON public.work_exchange_offers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own offers
CREATE POLICY IF NOT EXISTS "Users can update their own work exchange offers"
ON public.work_exchange_offers
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own offers
CREATE POLICY IF NOT EXISTS "Users can delete their own work exchange offers"
ON public.work_exchange_offers
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_work_exchange_offers_updated_at
BEFORE UPDATE ON public.work_exchange_offers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for work exchange images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-exchange-images', 'work-exchange-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for work exchange images
CREATE POLICY IF NOT EXISTS "Anyone can view work exchange images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'work-exchange-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload work exchange images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'work-exchange-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can update their own work exchange images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'work-exchange-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own work exchange images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'work-exchange-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert some sample data for development/testing
INSERT INTO public.work_exchange_offers (
  user_id,
  user_name,
  user_email,
  space_type,
  work_requested,
  duration,
  work_hours_per_week,
  address,
  city,
  state,
  zip_code,
  amenities_provided,
  additional_notes,
  contact_preference
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
  'Sarah Johnson',
  'sarah@example.com',
  'private-room',
  'House cleaning, pet care, and light cooking',
  '3 months',
  '15 hours per week',
  '123 Main Street',
  'Toronto',
  'Ontario',
  'M5V 3A8',
  ARRAY['wifi', 'meals', 'parking', 'laundry'],
  'Looking for someone reliable and trustworthy. Must love dogs!',
  'email'
), (
  '00000000-0000-0000-0000-000000000001', -- Placeholder UUID
  'Mike Chen',
  'mike@example.com',
  'studio',
  'IT support, tutoring, and apartment maintenance',
  '6 months',
  '20 hours per week',
  '456 Queen Street',
  'Vancouver',
  'British Columbia',
  'V6B 1A1',
  ARRAY['wifi', 'utilities', 'furnished'],
  'Perfect for students or freelancers. Quiet neighborhood.',
  'messenger'
) ON CONFLICT DO NOTHING;
