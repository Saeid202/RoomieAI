-- Add available_colors column to construction_products table
-- Stores array of color objects with name and hex code

ALTER TABLE public.construction_products 
ADD COLUMN available_colors JSONB DEFAULT '[]'::jsonb;
