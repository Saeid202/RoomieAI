import { supabase } from "@/integrations/supabase/client-simple";
import {
  LenderProfile,
  LenderRate,
  LenderRateHistory,
  CreateLenderProfileInput,
  UpdateLenderProfileInput,
  CreateLenderRateInput,
  UpdateLenderRateInput,
  LenderWithRates,
} from "@/types/lender";

function cleanFormData(formData: CreateLenderProfileInput) {
  return {
    ...formData,
    company_logo_url: formData.company_logo_url || null,
    contact_phone: formData.contact_phone || null,
    website_url: formData.website_url || null,
    license_number: formData.license_number || null,
    license_state: formData.license_state || null,
    nmls_id: formData.nmls_id || null,
    company_address: formData.company_address || null,
    company_city: formData.company_city || null,
    company_province: formData.company_province || null,
    company_postal_code: formData.company_postal_code || null,
    company_description: formData.company_description || null,
  };
}

export async function getLenderProfile(userId: string): Promise<LenderProfile | null> {
  const { data, error } = await supabase
    .from("lender_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching lender profile:", error);
    throw error;
  }

  return data;
}

export async function createLenderProfile(
  userId: string,
  input: CreateLenderProfileInput
): Promise<LenderProfile> {
  const cleanedData = cleanFormData(input);

  const { data, error } = await supabase
    .from("lender_profiles")
    .insert({
      user_id: userId,
      ...cleanedData,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating lender profile:", error);
    throw error;
  }

  return data;
}

export async function updateLenderProfile(
  profileId: string,
  updates: UpdateLenderProfileInput
): Promise<LenderProfile> {
  const { data, error } = await supabase
    .from("lender_profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lender profile:", error);
    throw error;
  }

  return data;
}

export async function getLenderRates(lenderId: string): Promise<LenderRate[]> {
  const { data, error } = await supabase
    .from("lender_rates")
    .select("*")
    .eq("lender_id", lenderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lender rates:", error);
    throw error;
  }

  return data || [];
}

export async function createLenderRate(input: CreateLenderRateInput): Promise<LenderRate> {
  const { data, error } = await supabase
    .from("lender_rates")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error creating lender rate:", error);
    throw error;
  }

  return data;
}

export async function updateLenderRate(
  rateId: string,
  updates: UpdateLenderRateInput
): Promise<LenderRate> {
  const { data, error } = await supabase
    .from("lender_rates")
    .update(updates)
    .eq("id", rateId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lender rate:", error);
    throw error;
  }

  return data;
}

export async function deleteLenderRate(rateId: string): Promise<void> {
  const { error } = await supabase.from("lender_rates").delete().eq("id", rateId);

  if (error) {
    console.error("Error deleting lender rate:", error);
    throw error;
  }
}

export async function getLenderRateHistory(lenderId: string): Promise<LenderRateHistory[]> {
  const { data, error } = await supabase
    .from("lender_rate_history")
    .select("*")
    .eq("lender_id", lenderId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Error fetching rate history:", error);
    throw error;
  }

  return data || [];
}

