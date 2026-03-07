// Co-Ownership Profile Service
// Handles all API operations for co-ownership profiles

import { supabase } from '@/integrations/supabase/client';
import type { 
  CoOwnershipProfile, 
  CoOwnershipProfileFormData,
} from '@/types/coOwnershipProfile';
import { 
  calculateProfileCompleteness,
  formDataToProfile,
} from '@/types/coOwnershipProfile';

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

interface ProfileUpdateData extends Partial<CoOwnershipProfile> {
  profile_completeness?: number;
}

// ============================================================================
// Error Handling
// ============================================================================

class CoOwnershipProfileError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CoOwnershipProfileError';
  }
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof CoOwnershipProfileError && error.code === 'PGRST116') {
        // RLS policy violation - don't retry
        throw error;
      }
      
      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Fetch a user's co-ownership profile
 */
export async function getCoOwnershipProfile(
  userId: string
): Promise<ServiceResponse<CoOwnershipProfile>> {
  try {
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase
        .from('co_ownership_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    });

    if (error) {
      // Profile doesn't exist yet - this is not an error
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      
      throw new CoOwnershipProfileError(
        `Failed to fetch profile: ${error.message}`,
        error.code
      );
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching co-ownership profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Create a new co-ownership profile
 */
export async function createCoOwnershipProfile(
  userId: string,
  formData: CoOwnershipProfileFormData
): Promise<ServiceResponse<CoOwnershipProfile>> {
  try {
    // Convert form data to database format
    const profileData = formDataToProfile(formData);
    
    // Calculate completeness
    const completeness = calculateProfileCompleteness(profileData);
    
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase
        .from('co_ownership_profiles')
        .insert({
          user_id: userId,
          ...profileData,
          profile_completeness: completeness,
          is_active: true,
        })
        .select()
        .single();
    });

    if (error) {
      throw new CoOwnershipProfileError(
        `Failed to create profile: ${error.message}`,
        error.code
      );
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating co-ownership profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Update an existing co-ownership profile
 */
export async function updateCoOwnershipProfile(
  profileId: string,
  formData: CoOwnershipProfileFormData
): Promise<ServiceResponse<CoOwnershipProfile>> {
  try {
    // Convert form data to database format
    const profileData = formDataToProfile(formData);
    
    // Calculate completeness
    const completeness = calculateProfileCompleteness(profileData);
    
    const updateData: ProfileUpdateData = {
      ...profileData,
      profile_completeness: completeness,
    };

    const { data, error } = await retryWithBackoff(async () => {
      return await supabase
        .from('co_ownership_profiles')
        .update(updateData)
        .eq('id', profileId)
        .select()
        .single();
    });

    if (error) {
      throw new CoOwnershipProfileError(
        `Failed to update profile: ${error.message}`,
        error.code
      );
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating co-ownership profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Save profile (create or update based on existence)
 */
export async function saveCoOwnershipProfile(
  userId: string,
  formData: CoOwnershipProfileFormData,
  existingProfileId?: string
): Promise<ServiceResponse<CoOwnershipProfile>> {
  if (existingProfileId) {
    return updateCoOwnershipProfile(existingProfileId, formData);
  } else {
    return createCoOwnershipProfile(userId, formData);
  }
}

/**
 * Delete a co-ownership profile
 */
export async function deleteCoOwnershipProfile(
  profileId: string
): Promise<ServiceResponse<void>> {
  try {
    const { error } = await retryWithBackoff(async () => {
      return await supabase
        .from('co_ownership_profiles')
        .delete()
        .eq('id', profileId);
    });

    if (error) {
      throw new CoOwnershipProfileError(
        `Failed to delete profile: ${error.message}`,
        error.code
      );
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error deleting co-ownership profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Toggle profile active status
 */
export async function toggleProfileActive(
  profileId: string,
  isActive: boolean
): Promise<ServiceResponse<CoOwnershipProfile>> {
  try {
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase
        .from('co_ownership_profiles')
        .update({ is_active: isActive })
        .eq('id', profileId)
        .select()
        .single();
    });

    if (error) {
      throw new CoOwnershipProfileError(
        `Failed to toggle profile status: ${error.message}`,
        error.code
      );
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error toggling profile status:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate profile data before saving
 */
export function validateProfileData(formData: CoOwnershipProfileFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Budget validation
  const minBudget = Number(formData.budget_min);
  const maxBudget = Number(formData.budget_max);
  
  if (isNaN(minBudget) || minBudget <= 0) {
    errors.push('Minimum budget must be a positive number');
  }
  
  if (isNaN(maxBudget) || maxBudget <= 0) {
    errors.push('Maximum budget must be a positive number');
  }
  
  if (minBudget > maxBudget) {
    errors.push('Minimum budget cannot be greater than maximum budget');
  }

  // Down payment validation
  const downPayment = Number(formData.down_payment);
  if (isNaN(downPayment) || downPayment < 0) {
    errors.push('Down payment must be a non-negative number');
  }

  // Annual income validation
  const annualIncome = Number(formData.annual_income);
  if (isNaN(annualIncome) || annualIncome <= 0) {
    errors.push('Annual income must be a positive number');
  }

  // Required fields
  if (!formData.credit_score_range) {
    errors.push('Credit score range is required');
  }

  if (formData.property_types.length === 0) {
    errors.push('At least one property type must be selected');
  }

  if (formData.preferred_locations.length === 0) {
    errors.push('At least one location must be selected');
  }

  if (!formData.purchase_timeline) {
    errors.push('Purchase timeline is required');
  }

  if (!formData.ownership_split) {
    errors.push('Ownership split preference is required');
  }

  if (formData.living_arrangements.length === 0) {
    errors.push('At least one living arrangement must be selected');
  }

  if (formData.co_ownership_purposes.length === 0) {
    errors.push('At least one co-ownership purpose must be selected');
  }

  if (!formData.age_range) {
    errors.push('Age range is required');
  }

  if (!formData.occupation || formData.occupation.trim().length === 0) {
    errors.push('Occupation is required');
  }

  // Character limits
  if (formData.occupation && formData.occupation.length > 100) {
    errors.push('Occupation must be 100 characters or less');
  }

  if (formData.why_co_ownership && formData.why_co_ownership.length > 500) {
    errors.push('Why co-ownership must be 500 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Check if user has a profile
 */
export async function hasCoOwnershipProfile(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('co_ownership_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Get profile completeness percentage
 */
export async function getProfileCompleteness(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('co_ownership_profiles')
      .select('profile_completeness')
      .eq('user_id', userId)
      .single();

    return data?.profile_completeness || 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  getCoOwnershipProfile,
  createCoOwnershipProfile,
  updateCoOwnershipProfile,
  saveCoOwnershipProfile,
  deleteCoOwnershipProfile,
  toggleProfileActive,
  validateProfileData,
  hasCoOwnershipProfile,
  getProfileCompleteness,
};
