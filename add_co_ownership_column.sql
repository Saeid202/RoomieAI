-- ADD is_co_ownership COLUMN TO sales_listings IF IT DOESN'T EXIST
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='sales_listings' AND column_name='is_co_ownership') THEN
        ALTER TABLE public.sales_listings ADD COLUMN is_co_ownership BOOLEAN DEFAULT false;
    END IF;
END $$;
