-- Make property_id nullable in conversations table to support general inquiries
-- This allows conversations between seekers and renovators without a specific property context

ALTER TABLE conversations ALTER COLUMN property_id DROP NOT NULL;

-- Verify the change (optional)
-- \d conversations
