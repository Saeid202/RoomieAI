-- Add sales-related fields to properties table
-- These fields are needed for the sales listing functionality

-- Add sales_price column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS sales_price DECIMAL(12,2);

-- Add is_co_ownership column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_co_ownership BOOLEAN DEFAULT false;

-- Add downpayment_target column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS downpayment_target DECIMAL(12,2);

-- Add listing_category column (if not exists from previous migration)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS listing_category TEXT DEFAULT 'rental';

-- Add check constraint for listing_category
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'properties_listing_category_check'
  ) THEN
    ALTER TABLE properties 
    ADD CONSTRAINT properties_listing_category_check 
    CHECK (listing_category IN ('rental', 'sale'));
  END IF;
END $$;

-- Add property_category column (if not exists from previous migration)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_category TEXT;

-- Add property_configuration column (if not exists from previous migration)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_configuration TEXT;

-- Create index on listing_category for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_listing_category 
ON properties(listing_category);

-- Create index on property_category for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_property_category 
ON properties(property_category);

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN (
    'sales_price', 
    'is_co_ownership', 
    'downpayment_target', 
    'listing_category',
    'property_category',
    'property_configuration'
  )
ORDER BY column_name;
