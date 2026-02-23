import { supabase } from "@/integrations/supabase/client";
import { MortgageBrokerProfile, MortgageBrokerFormData } from "@/types/mortgageBroker";
import { MortgageProfile } from "@/types/mortgage";

/**
 * Clean form data - convert empty strings to null for database
 */
function cleanFormData(formData: MortgageBrokerFormData) {
  return {
    ...formData,
    full_name: formData.full_name || null,
    email: formData.email || null,
    phone_number: formData.phone_number || null,
    company_name: formData.company_name || null,
    license_number: formData.license_number || null,
  };
}

/**
 * Fetch mortgage broker profile for the current user
 */
export async function fetchMortgageBrokerProfile(userId: string): Promise<MortgageBrokerProfile | null> {
  const { data, error } = await supabase
    .from('mortgage_broker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching mortgage broker profile:", error);
    throw error;
  }

  return data;
}

/**
 * Create or update mortgage broker profile
 */
export async function saveMortgageBrokerProfile(
  userId: string,
  formData: MortgageBrokerFormData
): Promise<MortgageBrokerProfile> {
  const cleanedData = cleanFormData(formData);

  // Check if profile exists
  const { data: existing } = await supabase
    .from('mortgage_broker_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Update existing profile
    const { data, error } = await supabase
      .from('mortgage_broker_profiles')
      .update(cleanedData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating mortgage broker profile:", error);
      throw error;
    }

    return data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('mortgage_broker_profiles')
      .insert({
        user_id: userId,
        ...cleanedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating mortgage broker profile:", error);
      throw error;
    }

    return data;
  }
}

/**
 * Fetch all mortgage profiles (for clients list)
 * Only returns profiles where the user has given consent to share with brokers
 */
export async function fetchAllMortgageProfiles(): Promise<MortgageProfile[]> {
  const { data, error } = await supabase
    .from('mortgage_profiles')
    .select('*')
    .eq('broker_consent', true)  // Only fetch profiles with explicit consent
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching mortgage profiles:", error);
    throw error;
  }

  return data || [];
}
