-- Add downpayment_target column to sales_listings table
ALTER TABLE public.sales_listings 
ADD COLUMN IF NOT EXISTS downpayment_target DECIMAL(10, 2);

-- Update RLS policies just in case (though adding a column usually doesn't break them)
