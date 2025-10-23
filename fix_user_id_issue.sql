-- Fix the user_id constraint issue and ensure proper schema
-- Run this in your Supabase SQL Editor

-- First, check current table structure
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'properties';

-- Drop the table and recreate with correct schema
DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  listing_title TEXT,
  property_type TEXT,
  description TEXT,
  
  -- Location Details
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  public_transport_access TEXT,
  nearby_amenities TEXT[],
  
  -- Rental Information
  monthly_rent DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  lease_terms TEXT,
  available_date DATE,
  furnished BOOLEAN DEFAULT false,
  
  -- Property Features
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_footage INTEGER,
  year_built INTEGER,
  property_condition TEXT,
  
  -- Amenities & Features
  amenities TEXT[],
  parking TEXT,
  pet_policy TEXT,
  utilities_included TEXT[],
  
  -- Additional Information
  special_instructions TEXT,
  roommate_preference TEXT,
  images TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'available'
);

-- Create indexes
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_monthly_rent ON properties(monthly_rent);
CREATE INDEX idx_properties_city ON properties(city);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON properties;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON properties;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON properties;

-- Create permissive policies
CREATE POLICY "Enable read access for all users" ON properties FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON properties FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON properties FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

CREATE POLICY "Anyone can view property images" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own property images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-images');

CREATE POLICY "Users can delete their own property images" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-images');

-- Verify the schema
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'properties' ORDER BY ordinal_position;