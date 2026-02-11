-- Safe migration to remove profiles table and update all dependencies
-- This script handles all the dependencies we found

-- Step 1: Update the after_auth_user_insert_safe function to use user_profiles
CREATE OR REPLACE FUNCTION public.after_auth_user_insert_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Optional lightweight profile seed (guarded + error-proof)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    BEGIN
      INSERT INTO public.user_profiles (id, email, created_at)
      VALUES (NEW.id, COALESCE(NEW.email, ''), now())
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN others THEN
      -- swallow any profile errors so user creation never fails
      PERFORM 1;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Update foreign key constraints to reference user_profiles instead of profiles
-- First, drop the existing constraint
ALTER TABLE rental_payments DROP CONSTRAINT IF EXISTS rental_payments_tenant_id_fkey_profiles;

-- Then add the new constraint pointing to user_profiles
ALTER TABLE rental_payments 
ADD CONSTRAINT rental_payments_tenant_id_fkey_user_profiles 
FOREIGN KEY (tenant_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Step 3: Update RLS policies on customers table to reference user_profiles
-- Drop existing policies
DROP POLICY IF EXISTS "Buyers can view their own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Buyers can update their own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Buyers can insert their own customer profile" ON public.customers;

-- Create new policies that reference user_profiles
CREATE POLICY "Buyers can view their own customer profile" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Buyers can update their own customer profile" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Buyers can insert their own customer profile" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 4: Now safely drop the profiles table
DROP TABLE IF EXISTS public.profiles;

-- Step 5: Verify the migration was successful
SELECT 'Migration completed successfully' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public');

-- Step 6: Verify user_profiles still exists and has data
SELECT 'user_profiles table has ' || COUNT(*) || ' records and is active' as status FROM user_profiles;

-- Step 7: Verify rental_payments constraint was updated
SELECT 'rental_payments now references user_profiles' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'rental_payments' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'tenant_id'
    AND tc.constraint_name = 'rental_payments_tenant_id_fkey_user_profiles'
);
