-- Create properties table for landlord listings
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Basic Information
  property_type TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  description TEXT,
  
  -- Location Details
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  public_transport_access TEXT,
  nearby_amenities TEXT[],
  
  -- Rental Information  
  monthly_rent DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2),
  lease_terms TEXT,
  available_date DATE,
  furnished TEXT,
  
  -- Property Features
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_footage INTEGER,
  year_built INTEGER,
  property_condition TEXT,
  
  -- Amenities & Features
  amenities TEXT[],
  parking TEXT,
  pet_policy TEXT,
  utilities_included TEXT[],
  
  -- Additional Info
  special_instructions TEXT,
  roommate_preference TEXT,
  images TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for property access
CREATE POLICY "Users can view all properties" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();