/**
 * Landlord service for managing landlord profiles and contact information
 */

import { supabase } from '@/integrations/supabase/client';
import { LandlordContactInfo, LandlordProfile } from '@/types/landlord';

/**
 * Fetch landlord contact information
 */
export const getLandlordContactInfo = async (userId: string): Promise<LandlordContactInfo | null> => {
  if (!userId) return null;
  try {
    // These contact fields don't exist in user_profiles schema.
    // Return null gracefully — contact info is not stored in this table.
    console.warn('getLandlordContactInfo: contact_* columns do not exist in user_profiles schema');
    return null;
  } catch (error) {
    console.error('Error in getLandlordContactInfo:', error);
    return null;
  }
};

/**
 * Update landlord contact information
 */
export const updateLandlordContactInfo = async (
  userId: string,
  contactInfo: LandlordContactInfo
): Promise<boolean> => {
  if (!userId) return false;
  // contact_* columns do not exist in user_profiles schema — no-op to prevent 400 errors
  console.warn('updateLandlordContactInfo: contact_* columns do not exist in user_profiles schema');
  return false;
};

/**
 * Validate landlord contact information
 */
export const validateContactInfo = (data: Partial<LandlordContactInfo>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.contactStreetNumber || data.contactStreetNumber.trim() === '') {
    errors.contactStreetNumber = 'Street number is required';
  }

  if (!data.contactStreetName || data.contactStreetName.trim() === '') {
    errors.contactStreetName = 'Street name is required';
  }

  if (!data.contactCityTown || data.contactCityTown.trim() === '') {
    errors.contactCityTown = 'City/Town is required';
  }

  if (!data.contactProvince || data.contactProvince.trim() === '') {
    errors.contactProvince = 'Province is required';
  }

  if (!data.contactPostalCode || data.contactPostalCode.trim() === '') {
    errors.contactPostalCode = 'Postal code is required';
  }

  // Optional fields - just trim if present
  // No validation needed for optional fields

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Fetch complete landlord profile including contact info
 */
export const getLandlordProfile = async (userId: string): Promise<LandlordProfile | null> => {
  if (!userId) return null;
  try {
    // Only select columns that actually exist in user_profiles schema
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching landlord profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      // contact_* columns don't exist in schema — return null
      contactUnit: null,
      contactStreetNumber: null,
      contactStreetName: null,
      contactPoBox: null,
      contactCityTown: null,
      contactProvince: null,
      contactPostalCode: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getLandlordProfile:', error);
    return null;
  }
};
