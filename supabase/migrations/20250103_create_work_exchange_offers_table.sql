-- Create work_exchange_offers table based on the form fields
-- This table stores work exchange offers created by users

-- Create work_exchange_offers table
CREATE TABLE IF NOT EXISTS public.work_exchange_offers (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User information (foreign key to auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User information (denormalized for performance and display)
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Space Information (from form)
  space_type TEXT NOT NULL CHECK (space_type IN ('private-room', 'shared-room', 'studio', 'entire-apartment', 'basement', 'other')),
  work_requested TEXT NOT NULL,
  duration TEXT NOT NULL,
  work_hours_per_week TEXT NOT NULL,
  
  -- Location Information (from form)
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  
  -- Amenities (from form - stored as array)
  amenities_provided TEXT[] DEFAULT '{}',
  
  -- Additional Information (from form)
  additional_notes TEXT,
  
  -- Contact Information (from form)
  contact_preference TEXT NOT NULL CHECK (contact_preference IN ('email', 'phone', 'messenger')),
  
  -- Status management
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'expired')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_user_id ON public.work_exchange_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_status ON public.work_exchange_offers(status);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_city ON public.work_exchange_offers(city);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_state ON public.work_exchange_offers(state);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_space_type ON public.work_exchange_offers(space_type);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_duration ON public.work_exchange_offers(duration);
CREATE INDEX IF NOT EXISTS idx_work_exchange_offers_created_at ON public.work_exchange_offers(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.work_exchange_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy 1: Anyone can view active work exchange offers
CREATE POLICY IF NOT EXISTS "Anyone can view active work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (status = 'active');

-- Policy 2: Users can view their own offers regardless of status
CREATE POLICY IF NOT EXISTS "Users can view their own work exchange offers"
ON public.work_exchange_offers
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can create work exchange offers
CREATE POLICY IF NOT EXISTS "Authenticated users can create work exchange offers"
ON public.work_exchange_offers
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

-- Policy 4: Users can update their own offers
CREATE POLICY IF NOT EXISTS "Users can update their own work exchange offers"
ON public.work_exchange_offers
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy 5: Users can delete their own offers
CREATE POLICY IF NOT EXISTS "Users can delete their own work exchange offers"
ON public.work_exchange_offers
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_exchange_offers_updated_at
BEFORE UPDATE ON public.work_exchange_offers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data for testing (optional)
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
  contact_preference,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID - replace with actual user ID
  'Sarah Johnson',
  'sarah@example.com',
  'private-room',
  'House cleaning, pet care, and light cooking. Looking for someone reliable and trustworthy. Must love dogs!',
  '3-months',
  '15 hours per week',
  '123 Main Street',
  'Toronto',
  'Ontario',
  'M5V 3A8',
  ARRAY['wifi', 'meals', 'parking', 'laundry'],
  'Looking for someone reliable and trustworthy. Must love dogs! Quiet neighborhood, close to public transit.',
  'email',
  'active'
), (
  '00000000-0000-0000-0000-000000000001', -- Placeholder UUID - replace with actual user ID
  'Mike Chen',
  'mike@example.com',
  'studio',
  'IT support, tutoring, and apartment maintenance. Perfect for students or freelancers.',
  '6-months',
  '20 hours per week',
  '456 Queen Street',
  'Vancouver',
  'British Columbia',
  'V6B 1A1',
  ARRAY['wifi', 'utilities', 'furnished'],
  'Perfect for students or freelancers. Quiet neighborhood, close to university and tech companies.',
  'messenger',
  'active'
), (
  '00000000-0000-0000-0000-000000000002', -- Placeholder UUID - replace with actual user ID
  'Emily Rodriguez',
  'emily@example.com',
  'shared-room',
  'Gardening, cooking, and general house maintenance. Great for someone who loves plants and cooking.',
  '2-months',
  '12 hours per week',
  '789 Oak Avenue',
  'Montreal',
  'Quebec',
  'H3A 1B2',
  ARRAY['wifi', 'meals', 'laundry', 'furnished'],
  'Great for someone who loves plants and cooking. We have a large garden and love to cook together.',
  'phone',
  'active'
) ON CONFLICT DO NOTHING;

-- Add comments to the table and columns for documentation
COMMENT ON TABLE public.work_exchange_offers IS 'Stores work exchange offers where users can offer their space in exchange for work services';
COMMENT ON COLUMN public.work_exchange_offers.space_type IS 'Type of space being offered (private-room, shared-room, studio, entire-apartment, basement, other)';
COMMENT ON COLUMN public.work_exchange_offers.work_requested IS 'Description of work/services requested in exchange for housing';
COMMENT ON COLUMN public.work_exchange_offers.duration IS 'Duration of the work exchange arrangement';
COMMENT ON COLUMN public.work_exchange_offers.work_hours_per_week IS 'Number of hours per week expected from the worker';
COMMENT ON COLUMN public.work_exchange_offers.amenities_provided IS 'Array of amenities provided to the worker (wifi, meals, parking, laundry, utilities, furnished, air-conditioning, heating)';
COMMENT ON COLUMN public.work_exchange_offers.contact_preference IS 'Preferred method of contact (email, phone, messenger)';
COMMENT ON COLUMN public.work_exchange_offers.status IS 'Status of the offer (active, inactive, completed, expired)';
