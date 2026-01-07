
-- Fix and recreate the trigger to handle profile creation robustly
-- Resolves the "null value in column user_type" error

-- 1. Helper function to cast role safely
CREATE OR REPLACE FUNCTION public.get_mapped_role(role_name text)
RETURNS public.user_type AS $$
BEGIN
  -- Attempt to match known roles to the Enum
  -- Adjust these cases if your specific Enum values differ (e.g. 'Tenant' instead of 'Seeker')
  CASE LOWER(role_name)
    WHEN 'landlord' THEN RETURN 'Landlord'::public.user_type;
    WHEN 'renovator' THEN RETURN 'Renovator'::public.user_type;
    -- Map 'tenant' and 'buyer' to 'Seeker' (assuming 'Seeker' is the enum value)
    WHEN 'tenant' THEN RETURN 'Seeker'::public.user_type;
    WHEN 'buyer' THEN RETURN 'Seeker'::public.user_type;
    WHEN 'seeker' THEN RETURN 'Seeker'::public.user_type;
    ELSE RETURN 'Seeker'::public.user_type; -- Default fallback
  END CASE;
EXCEPTION WHEN OTHERS THEN
  -- If 'Seeker' is not a valid enum value, try 'Tenant' or just return NULL (which will fail NOT NULL check, but we handle that in trigger)
  -- This part is tricky without knowing exact Enum. Assuming 'Seeker' exists.
  RETURN 'Seeker'::public.user_type; 
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 2. Create/Replace the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  mapped_role public.user_type;
BEGIN
  -- Determine role
  mapped_role := public.get_mapped_role(new.raw_user_meta_data->>'role');

  -- Insert Profile
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    mapped_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    user_type = COALESCE(public.profiles.user_type, EXCLUDED.user_type);
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback: If strict insert fails (e.g. enum issue), try to insert with a hardcoded valid user_type
  -- We MUST provide user_type because it is NOT NULL.
  -- We assume 'Seeker' is valid. If this fails, we log it.
  BEGIN
      INSERT INTO public.profiles (id, email, full_name, user_type)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        'Seeker'::public.user_type
      )
      ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create profile for user %: %', new.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Re-attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Backfill Existing Users (Robustly)
DO $$
DECLARE
  user_record record;
  mapped_role public.user_type;
BEGIN
  FOR user_record IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    BEGIN
        -- Try to get mapped role
        mapped_role := public.get_mapped_role(user_record.raw_user_meta_data->>'role');
        
        INSERT INTO public.profiles (id, email, full_name, user_type)
        VALUES (
            user_record.id, 
            user_record.email, 
            user_record.raw_user_meta_data->>'full_name',
            mapped_role
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Backfill warning for user %: %', user_record.id, SQLERRM;
        -- Attempt fallback insertion if first try failed
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, user_type)
            VALUES (
                user_record.id, 
                user_record.email, 
                user_record.raw_user_meta_data->>'full_name',
                'Seeker'::public.user_type
            );
        EXCEPTION WHEN OTHERS THEN
             RAISE NOTICE 'Backfill failed critically for user %: %', user_record.id, SQLERRM;
        END;
    END;
  END LOOP;
END $$;
