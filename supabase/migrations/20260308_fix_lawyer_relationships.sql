-- Fix lawyer_client_relationships foreign keys to point to user_profiles
-- This allows PostgREST to automatically resolve the relationship for joins

ALTER TABLE lawyer_client_relationships 
DROP CONSTRAINT IF EXISTS lawyer_client_relationships_lawyer_id_fkey,
DROP CONSTRAINT IF EXISTS lawyer_client_relationships_client_id_fkey;

ALTER TABLE lawyer_client_relationships
ADD CONSTRAINT lawyer_client_relationships_lawyer_id_fkey 
FOREIGN KEY (lawyer_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT lawyer_client_relationships_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Also ensure lawyer_profiles references user_profiles for consistency
ALTER TABLE lawyer_profiles
DROP CONSTRAINT IF EXISTS lawyer_profiles_user_id_fkey;

ALTER TABLE lawyer_profiles
ADD CONSTRAINT lawyer_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
