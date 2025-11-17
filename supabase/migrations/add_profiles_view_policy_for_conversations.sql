-- Add RLS policy to allow users to view profiles of other users in conversations
-- This is needed for the messaging system to display landlord and tenant names
-- NOTE: This uses user_profiles table (not profiles)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view profiles in conversations" ON public.user_profiles;

-- Create policy that allows authenticated users to view profiles of users they have conversations with
CREATE POLICY "Users can view profiles in conversations" ON public.user_profiles
  FOR SELECT
  USING (
    -- Allow if user is viewing their own profile
    auth.uid() = id
    OR
    -- Allow if the profile belongs to a landlord or tenant in a conversation with the current user
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE (
        (conversations.landlord_id = user_profiles.id AND conversations.tenant_id = auth.uid())
        OR
        (conversations.tenant_id = user_profiles.id AND conversations.landlord_id = auth.uid())
      )
    )
  );

