import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface RentalApplication {
  id: string;
  property_id: string;
  applicant_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  
  // Personal Information
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  occupation: string;
  employer?: string;
  monthly_income: number;
  
  // Rental Preferences
  move_in_date?: string;
  lease_duration?: string;
  pet_ownership: boolean;
  smoking_status?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // Additional Information
  additional_info?: string;
  agree_to_terms?: boolean;
  
  // Process Status
  contract_signed?: boolean;
  payment_completed?: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface RentalApplicationInput {
  property_id: string;
  applicant_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  occupation: string;
  employer?: string;
  monthly_income: number;
  move_in_date?: string;
  lease_duration?: string;
  pet_ownership: boolean;
  smoking_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  additional_info?: string;
  agree_to_terms?: boolean;
  contract_signed?: boolean;
  payment_completed?: boolean;
}

/**
 * Submit a new rental application (without documents)
 */
export async function submitRentalApplication(input: RentalApplicationInput): Promise<RentalApplication> {
  console.log("Submitting rental application:", input);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error("Error submitting rental application:", error);
      throw new Error(`Failed to submit rental application: ${error.message}`);
    }

    console.log("Rental application submitted successfully:", data);
    return data as RentalApplication;
  } catch (error) {
    console.error("Error in submitRentalApplication:", error);
    throw error;
  }
}

/**
 * Update rental application status
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
): Promise<RentalApplication> {
  console.log("Updating application status:", applicationId, status);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating application status:", error);
      throw new Error(`Failed to update application status: ${error.message}`);
    }

    console.log("Application status updated successfully:", data);
    return data as RentalApplication;
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    throw error;
  }
}

/**
 * Update contract signing status
 */
export async function updateContractSigningStatus(
  applicationId: string, 
  contractSigned: boolean
): Promise<RentalApplication> {
  console.log("Updating contract signing status:", applicationId, contractSigned);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .update({ contract_signed: contractSigned })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating contract signing status:", error);
      throw new Error(`Failed to update contract signing status: ${error.message}`);
    }

    console.log("Contract signing status updated successfully:", data);
    return data as RentalApplication;
  } catch (error) {
    console.error("Error in updateContractSigningStatus:", error);
    throw error;
  }
}

/**
 * Update payment completion status
 */
export async function updatePaymentStatus(
  applicationId: string, 
  paymentCompleted: boolean
): Promise<RentalApplication> {
  console.log("Updating payment status:", applicationId, paymentCompleted);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .update({ payment_completed: paymentCompleted })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment status:", error);
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    console.log("Payment status updated successfully:", data);
    return data as RentalApplication;
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    throw error;
  }
}

/**
 * Get rental application by ID
 */
export async function getApplicationById(applicationId: string): Promise<RentalApplication | null> {
  console.log("Fetching application by ID:", applicationId);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      console.error("Error fetching application by ID:", error);
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    console.log("Application fetched successfully:", data);
    return data as RentalApplication;
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    throw error;
  }
}

/**
 * Check if user has already applied for a property
 */
export async function hasUserAppliedForProperty(propertyId: string, userId: string): Promise<boolean> {
  console.log("Checking if user has applied for property:", propertyId, userId);
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .select('id')
      .eq('property_id', propertyId)
      .eq('applicant_id', userId)
      .limit(1);

    if (error) {
      console.error("Error checking application status:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Error in hasUserAppliedForProperty:", error);
    return false;
  }
}

/**
 * Get applications for landlord dashboard (filtered by landlord's properties)
 */
export async function getLandlordApplications(): Promise<any[]> {
  console.log("Fetching landlord applications");
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await sb
      .from('rental_applications')
      .select(`
        *,
        property:properties!inner(
          id, listing_title, address, city, state, monthly_rent, user_id
        )
      `)
      .eq('property.user_id', user.id)  // Filter by landlord's properties
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching landlord applications:", error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    console.log("Landlord applications fetched successfully:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in getLandlordApplications:", error);
    return [];
  }
}

/**
 * Get applications submitted by the current user
 */
export async function getUserApplications(): Promise<any[]> {
  console.log("Fetching user applications");
  
  try {
    const { data, error } = await sb
      .from('rental_applications')
      .select(`
        *,
        property:properties(listing_title, address, city, state, monthly_rent, property_type, user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user applications:", error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    console.log("User applications fetched successfully:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in getUserApplications:", error);
    return [];
  }
}