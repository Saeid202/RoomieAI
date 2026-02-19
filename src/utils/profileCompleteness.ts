// Utility to check if tenant profile is complete for quick apply
import { supabase } from "@/integrations/supabase/client";

export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  missingDocuments: string[];
  hasAllDocuments: boolean;
  hasBasicInfo: boolean;
}

export interface TenantProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  monthly_income?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  reference_letters?: string;
  employment_letter?: string;
  credit_score_report?: string;
}

/**
 * Check if tenant profile is complete enough for quick apply
 * @param userId - The user's ID
 * @returns Profile completeness result
 */
export async function checkProfileCompleteness(
  userId: string
): Promise<ProfileCompletenessResult> {
  const missingFields: string[] = [];
  const missingDocuments: string[] = [];

  try {
    // Fetch user profile (common fields)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    // Fetch tenant profile (tenant-specific fields + documents)
    const { data: tenantProfile } = await supabase
      .from('tenant_profiles')
      .select(`
        monthly_income,
        emergency_contact_name,
        emergency_contact_phone,
        reference_letters,
        employment_letter,
        credit_score_report
      `)
      .eq('user_id', userId)
      .maybeSingle();

    // Check basic info
    if (!userProfile?.full_name) missingFields.push('Full Name');
    if (!userProfile?.email) missingFields.push('Email');
    if (!userProfile?.phone) missingFields.push('Phone Number');

    // Check financial info
    if (!tenantProfile?.monthly_income) missingFields.push('Monthly Income');

    // Check emergency contact
    if (!tenantProfile?.emergency_contact_name) missingFields.push('Emergency Contact Name');
    if (!tenantProfile?.emergency_contact_phone) missingFields.push('Emergency Contact Phone');

    // Check documents
    if (!tenantProfile?.reference_letters) missingDocuments.push('Reference Letters');
    if (!tenantProfile?.employment_letter) missingDocuments.push('Employment Letter');
    if (!tenantProfile?.credit_score_report) missingDocuments.push('Credit Score Report');

    const hasBasicInfo = missingFields.length === 0;
    const hasAllDocuments = missingDocuments.length === 0;
    const isComplete = hasBasicInfo && hasAllDocuments;

    return {
      isComplete,
      missingFields,
      missingDocuments,
      hasAllDocuments,
      hasBasicInfo,
    };
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return {
      isComplete: false,
      missingFields: ['Unable to load profile'],
      missingDocuments: [],
      hasAllDocuments: false,
      hasBasicInfo: false,
    };
  }
}

/**
 * Get tenant profile data for application
 * @param userId - The user's ID
 * @returns Tenant profile data or null
 */
export async function getTenantProfileForApplication(
  userId: string
): Promise<TenantProfileData | null> {
  try {
    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, email, phone, occupation')
      .eq('id', userId)
      .single();

    // Fetch tenant profile
    const { data: tenantProfile } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userProfile) return null;

    return {
      full_name: userProfile.full_name,
      email: userProfile.email,
      phone: userProfile.phone,
      monthly_income: tenantProfile?.monthly_income,
      emergency_contact_name: tenantProfile?.emergency_contact_name,
      emergency_contact_phone: tenantProfile?.emergency_contact_phone,
      emergency_contact_relationship: tenantProfile?.emergency_contact_relationship,
      reference_letters: tenantProfile?.reference_letters,
      employment_letter: tenantProfile?.employment_letter,
      credit_score_report: tenantProfile?.credit_score_report,
    };
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    return null;
  }
}
