-- Create trigger to auto-create lender_profiles when user_profiles is created with role='lender'
CREATE OR REPLACE FUNCTION public.create_lender_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'lender' THEN
    INSERT INTO public.lender_profiles (
      user_id,
      company_name,
      contact_email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.full_name, 'Lender Company'),
      COALESCE(NEW.email, '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_lender_profile_on_user_profile_insert ON public.user_profiles;

-- Create trigger
CREATE TRIGGER create_lender_profile_on_user_profile_insert
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_lender_profile_on_signup();
