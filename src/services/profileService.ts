
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { ProfileTableRow, TableName } from "@/components/dashboard/types/profileTypes";
import { UserPreference } from "@/components/dashboard/types";
import { mapFormValuesToDbRow } from "@/utils/profileDataMappers";

/**
 * Determine which table to use based on user preference
 */
export function getTableNameFromPreference(preference: UserPreference): TableName | null {
  if (!preference) return null;
  
  if (preference === 'roommate') {
    return 'roommate';
  } else if (preference === 'co-owner') {
    return 'co-owner';
  }
  
  // Remove "Both" option as it's been deprecated
  return null;
}

/**
 * Fetch profile data for a user from the appropriate table
 */
export async function fetchProfileData(userId: string, tableName: TableName) {
  console.log("Fetching from table:", tableName);
  console.log("User ID:", userId);

  // Query by user_id field for user-specific data
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Save profile data to the database
 */
export async function saveProfileData(
  formData: ProfileFormValues, 
  userId: string, 
  tableName: TableName
) {
  console.log("Saving to table:", tableName);
  console.log("User ID:", userId);
  
  // Convert form data to database format
  const dbData = mapFormValuesToDbRow(formData, userId);

  // First check if a record already exists with the user_id
  const { data: existingData, error: fetchError } = await supabase
    .from(tableName)
    .select('id, user_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error checking existing profile:", fetchError);
    throw fetchError;
  }
  
  let result;
  if (existingData) {
    // Update existing record
    console.log("Updating existing record:", existingData);
    // Remove id from the data for update
    const { id, ...dataWithoutId } = dbData;
    result = await supabase
      .from(tableName)
      .update(dataWithoutId)
      .eq('user_id', userId);
  } else {
    // Insert new record
    console.log("Inserting new record");
    // Type cast to any to avoid TypeScript strict checking since different tables have different id types
    result = await supabase
      .from(tableName)
      .insert(dbData as any);
  }
  
  return result;
}
