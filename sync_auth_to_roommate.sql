-- 1. Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a roommate profile if the user role is 'seeker'
  -- You can remove the IF condition if you want profiles for all user types
  IF (new.raw_user_meta_data->>'role' = 'seeker') THEN
    INSERT INTO public.roommate (user_id, email, full_name)
    VALUES (
      new.id, 
      new.email, 
      -- Try to get name from metadata, otherwise default to empty string or email username
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent errors if profile exists
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to fire after every new user insert in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill script: Create roommate profiles for EXISTING authenticated seekers who are missing from the roommate table
INSERT INTO public.roommate (user_id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
FROM auth.users
WHERE 
  (raw_user_meta_data->>'role' = 'seeker') -- Only backfill seekers
  AND NOT EXISTS (SELECT 1 FROM public.roommate WHERE user_id = auth.users.id);

-- Optional: Verify the backfill worked
SELECT count(*) as new_profiles_created FROM public.roommate;
