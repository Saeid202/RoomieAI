// Service for quick apply functionality
import { supabase } from "@/integrations/supabase/client";
import { getTenantProfileForApplication } from "@/utils/profileCompleteness";

export interface QuickApplicationData {
  user_id: string;
  property_id: string;
  message?: string;
}

/**
 * Submit a quick application using tenant profile data
 * @param data - Application data
 * @returns Application ID or null
 */
export async function submitQuickApplication(
  data: QuickApplicationData
): Promise<string | null> {
  try {
    // Get tenant profile data
    const profileData = await getTenantProfileForApplication(data.user_id);
    
    if (!profileData) {
      throw new Error("Could not load profile data");
    }

    // Create application record
    const applicationPayload = {
      applicant_id: data.user_id,
      property_id: data.property_id,
      status: 'pending',
      
      // Personal information from profile
      full_name: profileData.full_name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      occupation: '',
      
      // Financial information
      monthly_income: profileData.monthly_income || 0,
      
      // Rental preferences (defaults)
      pet_ownership: false,
      
      // Emergency contact
      emergency_contact_name: profileData.emergency_contact_name || '',
      emergency_contact_phone: profileData.emergency_contact_phone || '',
      emergency_contact_relation: profileData.emergency_contact_relationship || '',
      
      // Documents (store URLs as JSON)
      reference_documents: profileData.reference_letters ? [profileData.reference_letters] : [],
      employment_documents: profileData.employment_letter ? [profileData.employment_letter] : [],
      credit_documents: profileData.credit_score_report ? [profileData.credit_score_report] : [],
      
      // Optional message
      additional_info: data.message || '',
      
      // Terms
      agree_to_terms: true,
    };

    console.log("Submitting application with payload:", applicationPayload);

    const { data: application, error } = await supabase
      .from('rental_applications')
      .insert(applicationPayload)
      .select('id')
      .single();

    if (error) {
      console.error("Supabase error submitting application:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Database error: ${error.message}`);
    }

    if (!application) {
      throw new Error("No application returned from database");
    }

    console.log("Application submitted successfully:", application);
    return application.id;
  } catch (error) {
    console.error("Error in submitQuickApplication:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

/**
 * Check if user has already applied to a property
 * @param userId - User ID
 * @param propertyId - Property ID
 * @returns True if already applied
 */
export async function hasUserApplied(
  userId: string,
  propertyId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rental_applications')
      .select('id')
      .eq('applicant_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error("Error checking application status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error in hasUserApplied:", error);
    return false;
  }
}
