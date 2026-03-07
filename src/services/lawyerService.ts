import { supabase } from "@/integrations/supabase/client";
import { LawyerProfile, LawyerFormData, LawyerClientRelationship, LawyerClientFormData } from "@/types/lawyer";

export async function fetchLawyerProfile(userId: string): Promise<LawyerProfile | null> {
  const { data, error } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching lawyer profile:", error);
    return null;
  }
  return data;
}

export async function updateLawyerProfile(
  userId: string,
  profileData: LawyerFormData
): Promise<LawyerProfile | null> {
  // First check if profile exists
  const { data: existingProfile } = await supabase
    .from("lawyer_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from("lawyer_profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating lawyer profile:", error);
      throw error;
    }
    return data;
  } else {
    // Insert new profile
    const { data, error } = await supabase
      .from("lawyer_profiles")
      .insert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lawyer profile:", error);
      throw error;
    }
    return data;
  }
}

export async function fetchLawyerClients(
  lawyerId: string
): Promise<LawyerClientRelationship[]> {
  const { data, error } = await supabase
    .from("lawyer_client_relationships")
    .select(`
      *,
      client:user_profiles!client_id (
        email,
        full_name
      )
    `)
    .eq("lawyer_id", lawyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return (data || []).map((rel: any) => ({
    ...rel,
    client: rel.client ? {
      email: rel.client.email,
      full_name: rel.client.full_name
    } : undefined
  }));
}

export async function createClientRelationship(
  lawyerId: string,
  clientData: LawyerClientFormData
): Promise<LawyerClientRelationship | null> {
  const { data, error } = await supabase
    .from("lawyer_client_relationships")
    .insert({
      lawyer_id: lawyerId,
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating client relationship:", error);
    throw error;
  }
  return data;
}

export async function updateClientRelationship(
  relationshipId: string,
  updates: Partial<LawyerClientFormData>
): Promise<LawyerClientRelationship | null> {
  const { data, error } = await supabase
    .from("lawyer_client_relationships")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", relationshipId)
    .select()
    .single();

  if (error) {
    console.error("Error updating client relationship:", error);
    throw error;
  }
  return data;
}

export async function deleteClientRelationship(relationshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from("lawyer_client_relationships")
    .delete()
    .eq("id", relationshipId);

  if (error) {
    console.error("Error deleting client relationship:", error);
    throw error;
  }
  return true;
}

export async function fetchAllLawyers(): Promise<LawyerProfile[]> {
  const { data, error } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("is_accepting_clients", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lawyers:", error);
    throw error;
  }
  return data || [];
}
