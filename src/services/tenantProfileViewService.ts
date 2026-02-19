// Service for landlords to view tenant profile data
import { supabase } from "@/integrations/supabase/client";
import { getDocumentSignedUrl } from "./documentUploadService";

export interface TenantProfileView {
  // User profile data
  full_name: string;
  email: string;
  phone: string;
  age?: number;
  nationality?: string;
  occupation?: string;
  
  // Tenant profile data
  monthly_income?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Documents
  reference_letters?: string;
  employment_letter?: string;
  credit_score_report?: string;
  additional_documents?: string;
  
  // Preferences
  preferred_location?: string;
  budget_range?: string;
  housing_type?: string;
  pet_preference?: string;
  smoking?: string;
}

/**
 * Get tenant profile data for landlord view
 * @param userId - Tenant's user ID
 * @returns Tenant profile data or null
 */
export async function getTenantProfileForLandlord(
  userId: string
): Promise<TenantProfileView | null> {
  try {
    console.log('🔍 getTenantProfileForLandlord - userId:', userId);
    
    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('full_name, email, phone, age, nationality, occupation')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("❌ Error fetching user profile:", userError);
      return null;
    }

    console.log('✅ User profile fetched:', userProfile);

    // Try fetching tenant profile by user_id first
    let { data: tenantProfile, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // If not found by user_id, try by id (in case table uses id as primary key)
    if (!tenantProfile && !tenantError) {
      console.log('⚠️ No profile found by user_id, trying by id...');
      const result = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      tenantProfile = result.data;
      tenantError = result.error;
    }

    if (tenantError) {
      console.error("❌ Error fetching tenant profile:", tenantError);
    }

    console.log('📋 Tenant profile fetched:', tenantProfile);
    console.log('📄 Documents in profile:', {
      reference_letters: tenantProfile?.reference_letters,
      employment_letter: tenantProfile?.employment_letter,
      credit_score_report: tenantProfile?.credit_score_report,
      additional_documents: tenantProfile?.additional_documents
    });

    const result = {
      full_name: userProfile.full_name,
      email: userProfile.email,
      phone: userProfile.phone,
      age: userProfile.age,
      nationality: userProfile.nationality,
      occupation: userProfile.occupation,
      monthly_income: tenantProfile?.monthly_income,
      emergency_contact_name: tenantProfile?.emergency_contact_name,
      emergency_contact_phone: tenantProfile?.emergency_contact_phone,
      emergency_contact_relationship: tenantProfile?.emergency_contact_relationship,
      reference_letters: tenantProfile?.reference_letters,
      employment_letter: tenantProfile?.employment_letter,
      credit_score_report: tenantProfile?.credit_score_report,
      additional_documents: tenantProfile?.additional_documents,
      preferred_location: tenantProfile?.preferred_location,
      budget_range: tenantProfile?.budget_range,
      housing_type: tenantProfile?.housing_type,
      pet_preference: tenantProfile?.pet_preference,
      smoking: tenantProfile?.smoking,
    };

    console.log('✅ Final result:', result);
    return result;
  } catch (error) {
    console.error("❌ Error in getTenantProfileForLandlord:", error);
    return null;
  }
}

/**
 * Get signed URL for a tenant document
 * @param filePath - Document file path
 * @returns Signed URL or null
 */
export async function getTenantDocumentUrl(filePath: string): Promise<string | null> {
  return await getDocumentSignedUrl(filePath);
}
