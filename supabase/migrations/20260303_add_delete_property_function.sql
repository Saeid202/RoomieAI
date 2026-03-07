-- Create a database function to delete properties with all related data
-- This bypasses RLS policies and ensures proper deletion order

CREATE OR REPLACE FUNCTION delete_property_with_relations(property_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  v_user_id UUID;
  v_current_user_id UUID;
  v_deleted_leases INT := 0;
  v_deleted_applications INT := 0;
  v_deleted_payments INT := 0;
  v_deleted_documents INT := 0;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if property exists and belongs to current user
  SELECT user_id INTO v_user_id
  FROM properties
  WHERE id = property_id_param;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Property not found';
  END IF;

  IF v_user_id != v_current_user_id THEN
    RAISE EXCEPTION 'Permission denied: You do not own this property';
  END IF;

  -- Delete in correct order to avoid foreign key violations

  -- 1. Delete lease contracts
  DELETE FROM lease_contracts WHERE property_id = property_id_param;
  GET DIAGNOSTICS v_deleted_leases = ROW_COUNT;

  -- 2. Delete rental applications
  DELETE FROM rental_applications WHERE property_id = property_id_param;
  GET DIAGNOSTICS v_deleted_applications = ROW_COUNT;

  -- 3. Delete rental payments
  DELETE FROM rental_payments WHERE property_id = property_id_param;
  GET DIAGNOSTICS v_deleted_payments = ROW_COUNT;

  -- 4. Delete property documents
  DELETE FROM property_documents WHERE property_id = property_id_param;
  GET DIAGNOSTICS v_deleted_documents = ROW_COUNT;

  -- 5. Delete landlord availability (if exists)
  BEGIN
    DELETE FROM landlord_availability WHERE property_id = property_id_param;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Table doesn't exist, skip
  END;

  -- 6. Delete sales listings (if exists)
  BEGIN
    DELETE FROM sales_listings WHERE property_id = property_id_param;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Table doesn't exist, skip
  END;

  -- 7. Delete document access requests (if exists)
  BEGIN
    DELETE FROM document_access_requests WHERE property_id = property_id_param;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Table doesn't exist, skip
  END;

  -- 8. Delete AI property knowledge (if exists)
  BEGIN
    DELETE FROM ai_property_knowledge WHERE property_id = property_id_param;
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Table doesn't exist, skip
  END;

  -- 9. Finally, delete the property itself
  DELETE FROM properties WHERE id = property_id_param;

  -- Return summary
  v_result := json_build_object(
    'success', true,
    'property_id', property_id_param,
    'deleted_lease_contracts', v_deleted_leases,
    'deleted_applications', v_deleted_applications,
    'deleted_payments', v_deleted_payments,
    'deleted_documents', v_deleted_documents
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_property_with_relations(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_property_with_relations IS 'Safely deletes a property and all related data in the correct order, bypassing RLS policies';
