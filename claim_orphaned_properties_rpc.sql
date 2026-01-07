-- Function to claim orphaned properties (security definer acts as admin)
CREATE OR REPLACE FUNCTION claim_orphaned_properties(old_owner_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  prop_count INT;
  sale_count INT;
BEGIN
  -- Get the ID of the currently authenticated user
  current_user_id := auth.uid();
  
  -- Prevent claiming if not logged in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update properties
  WITH p AS (
    UPDATE public.properties
    SET user_id = current_user_id
    WHERE user_id = old_owner_id
    RETURNING id
  )
  SELECT count(*) INTO prop_count FROM p;

  -- Update sales listings
  WITH s AS (
    UPDATE public.sales_listings
    SET user_id = current_user_id
    WHERE user_id = old_owner_id
    RETURNING id
  )
  SELECT count(*) INTO sale_count FROM s;

  RETURN json_build_object(
    'success', true,
    'claimed_properties', prop_count,
    'claimed_sales', sale_count
  );
END;
$$;

-- IMPORTANT: Grant execution permission to authenticated users so they can call this function
-- If 'service_role' causes an error, you can remove that specific line, but 'authenticated' is REQUIRED.
GRANT EXECUTE ON FUNCTION claim_orphaned_properties(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_orphaned_properties(UUID) TO service_role;
