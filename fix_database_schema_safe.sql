-- Safe database schema fix for RoomieAI property listing
-- This script will create/update the properties table without test data insertion

-- Drop the existing table if it exists (WARNING: This will delete all data)
DROP TABLE IF EXISTS properties CASCADE;

-- Create the properties table with all required fields matching the frontend
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Information (matching frontend PropertyFormData)
  listing_title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  description TEXT,
  
  -- Location Details (matching AddressDetails from frontend)
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  public_transport_access TEXT,
  nearby_amenities TEXT[], -- Array of strings
  
  -- Rental Information (matching frontend form fields)
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  lease_terms TEXT, -- "6 months", "1 year", etc.
  available_date DATE, -- This is the key field that was missing!
  furnished BOOLEAN DEFAULT false,
  
  -- Property Features
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_footage INTEGER,
  year_built INTEGER,
  property_condition TEXT,
  
  -- Amenities & Features (matching frontend arrays)
  amenities TEXT[], -- Array of amenity strings
  parking TEXT, -- "Street Parking", "Garage", etc.
  pet_policy TEXT, -- "Pets Allowed", "No Pets", etc.
  utilities_included TEXT[], -- Array of utility strings
  
  -- Additional Information
  special_instructions TEXT,
  roommate_preference TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status and visibility
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'pending', 'unavailable')),
  views_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_monthly_rent ON properties(monthly_rent);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_available_date ON properties(available_date);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON properties;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON properties;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON properties;
DROP POLICY IF EXISTS "Anyone can view available properties" ON properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

-- Create permissive policies for testing
CREATE POLICY "Enable read access for all users" ON properties FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON properties FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

CREATE POLICY "Anyone can view property images" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own property images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property images" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;
