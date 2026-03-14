-- Fix handle_new_user to skip construction suppliers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := NEW.raw_user_meta_data->>'role';
    
    IF v_role = 'construction_supplier' THEN
        RETURN NEW;
    END IF;
    
    INSERT INTO public.user_profiles (id, full_name, role, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            NULL
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'role',
            'seeker'
        ),
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = COALESCE(
            EXCLUDED.full_name,
            user_profiles.full_name,
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name'
        ),
        role = COALESCE(
            EXCLUDED.role,
            user_profiles.role,
            NEW.raw_user_meta_data->>'role'
        ),
        email = COALESCE(EXCLUDED.email, user_profiles.email, NEW.email),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

SELECT 'handle_new_user function updated' as status;
