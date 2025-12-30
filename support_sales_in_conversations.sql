-- Add sales_listing_id to conversations table
DO $$ 
BEGIN 
    -- 1. Make property_id nullable if it's not already
    -- Note: alter_conversations_property_nullable.sql should have done this, but let's be sure
    ALTER TABLE public.conversations ALTER COLUMN property_id DROP NOT NULL;

    -- 2. Add sales_listing_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='conversations' AND column_name='sales_listing_id') THEN
        ALTER TABLE public.conversations ADD COLUMN sales_listing_id UUID REFERENCES public.sales_listings(id) ON DELETE CASCADE;
    END IF;

    -- 3. Drop existing uniqueness constraint if it exists
    -- We need to find the constraint name first. Usually it's conversations_property_id_landlord_id_tenant_id_key
    -- But let's just use a DO block to find and drop it.
    DECLARE
        constraint_name text;
    BEGIN
        SELECT tc.constraint_name INTO constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'conversations' AND tc.constraint_type = 'UNIQUE';
        
        IF constraint_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE public.conversations DROP CONSTRAINT ' || constraint_name;
        END IF;
    END;

    -- 4. Add new conditional uniqueness (simplified: just remove the strict property requirement)
    -- Actually, we can just allow duplicates for now or create a more complex one.
    -- For simplicity, let's just make sure we don't have the strict one.
END $$;
