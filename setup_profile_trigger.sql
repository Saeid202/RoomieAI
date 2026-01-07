
-- Create a trigger and function to automatically create a public profile entry when a new user signs up via Supabase Auth.
-- This ensures that 'profiles' table always has a corresponding row for each user, preventing "Unknown User" issues.

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  mapped_role text;
BEGIN
  -- Map metadata role to expected Enum values (Capitalized based on recent constraints)
  -- 'tenant' or 'seeker' -> 'Seeker'
  -- 'landlord' -> 'Landlord'
  -- 'renovator' -> 'Renovator'
  -- Default -> 'Seeker'
  
  CASE LOWER(new.raw_user_meta_data->>'role')
    WHEN 'landlord' THEN mapped_role := 'Landlord';
    WHEN 'renovator' THEN mapped_role := 'Renovator';
    ELSE mapped_role := 'Seeker'; -- Default for 'tenant', 'seeker', or null
  END CASE;

  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    mapped_role::user_type -- Cast to the enum type
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    user_type = COALESCE(public.profiles.user_type, EXCLUDED.user_type);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback if user_type enum doesn't match or other error
  -- Try inserting without user_type if it fails? 
  -- Or just log and continue? For now, we'll try to insert just basic info if specific role fails.
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users
-- We iterate through users and try to insert them.
DO $$
DECLARE
  user_record record;
  mapped_role text;
BEGIN
  FOR user_record IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    CASE LOWER(user_record.raw_user_meta_data->>'role')
      WHEN 'landlord' THEN mapped_role := 'Landlord';
      WHEN 'renovator' THEN mapped_role := 'Renovator';
      ELSE mapped_role := 'Seeker';
    END CASE;

    BEGIN
      INSERT INTO public.profiles (id, email, full_name, user_type)
      VALUES (
        user_record.id, 
        user_record.email, 
        user_record.raw_user_meta_data->>'full_name',
        mapped_role::user_type
      );
    EXCEPTION WHEN OTHERS THEN
      -- If user_type fails (e.g. enum mismatch), try inserting without it
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (
        user_record.id, 
        user_record.email, 
        user_record.raw_user_meta_data->>'full_name'
      );
    END;
  END LOOP;
END $$;
