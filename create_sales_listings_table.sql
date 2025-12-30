-- CREATE SALES LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.sales_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Basic Information
  listing_title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  neighborhood TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  public_transport_access TEXT,
  nearby_amenities TEXT[] DEFAULT '{}',
  is_co_ownership BOOLEAN DEFAULT false,
  
  -- Sales Information (The specific changes requested)
  sales_price NUMERIC NOT NULL,
  available_date DATE,
  
  -- Property Features
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_footage INTEGER,
  furnished BOOLEAN,
  
  -- Amenities & Policies
  amenities TEXT[] DEFAULT '{}',
  parking TEXT,
  pet_policy TEXT,
  utilities_included TEXT[] DEFAULT '{}',
  
  -- Additional Info
  special_instructions TEXT,
  roommate_preference TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- AI & Media Features (matching properties table)
  description_audio_url TEXT,
  three_d_model_url TEXT,
  video_script TEXT,
  background_music_url TEXT,
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE public.sales_listings ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Public sales listings are viewable by everyone" ON public.sales_listings;
CREATE POLICY "Public sales listings are viewable by everyone" 
ON public.sales_listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own sales listings" ON public.sales_listings;
CREATE POLICY "Users can insert their own sales listings" 
ON public.sales_listings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sales listings" ON public.sales_listings;
CREATE POLICY "Users can update their own sales listings" 
ON public.sales_listings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sales listings" ON public.sales_listings;
CREATE POLICY "Users can delete their own sales listings" 
ON public.sales_listings FOR DELETE USING (auth.uid() = user_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_sales_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_listings_updated_at
BEFORE UPDATE ON public.sales_listings
FOR EACH ROW
EXECUTE FUNCTION update_sales_listings_updated_at();
