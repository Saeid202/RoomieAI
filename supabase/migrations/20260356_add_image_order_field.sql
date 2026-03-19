-- Add order field to construction_product_images for gallery sequencing
ALTER TABLE construction_product_images
ADD COLUMN IF NOT EXISTS image_order INT DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_product_images_order 
ON construction_product_images(product_id, image_order);
