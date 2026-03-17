/**
 * Landlord service for managing landlord profiles and contact information
 */

import { supabase } from '@/integrations/supabase/client';
import { LandlordContactInfo, LandlordProfile } from '@/types/landlord';

/**
 * Fetch landlord contact information
 */
export const getLandlordContactInfo = async (userId: string): Promise<LandlordContactInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'contact_unit, contact_street_number, contact_street_name, contact_po_box, contact_city_town, contact_province, contact_postal_code'
      )
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching landlord contact info:', error);
      return null;
    }

    if (!data) return null;

    return {
      contactUnit: data.contact_unit,
      contactStreetNumber: data.contact_street_number,
      contactStreetName: data.contact_street_name,
      contactPoBox: data.contact_po_box,
      contactCityTown: data.contact_city_town,
      contactProvince: data.contact_province,
      contactPostalCode: data.contact_postal_code,
    };
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
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        contact_unit: contactInfo.contactUnit || null,
        contact_street_number: contactInfo.contactStreetNumber,
        contact_street_name: contactInfo.contactStreetName,
        contact_po_box: contactInfo.contactPoBox || null,
        contact_city_town: contactInfo.contactCityTown,
        contact_province: contactInfo.contactProvince,
        contact_postal_code: contactInfo.contactPostalCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating landlord contact info:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLandlordContactInfo:', error);
    return false;
  }
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
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        id,
        full_name,
        email,
        contact_unit,
        contact_street_number,
        contact_street_name,
        contact_po_box,
        contact_city_town,
        contact_province,
        contact_postal_code,
        created_at,
        updated_at
        `
      )
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
      contactUnit: data.contact_unit,
      contactStreetNumber: data.contact_street_number,
      contactStreetName: data.contact_street_name,
      contactPoBox: data.contact_po_box,
      contactCityTown: data.contact_city_town,
      contactProvince: data.contact_province,
      contactPostalCode: data.contact_postal_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getLandlordProfile:', error);
    return null;
  }
};
