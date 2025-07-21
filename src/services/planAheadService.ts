import { supabase } from "@/integrations/supabase/client";
import type { PlanAheadProfile, PlanAheadFormData } from "@/types/planAhead";
import type { Database } from "@/integrations/supabase/types";

type DatabasePlanAheadProfile = Database['public']['Tables']['plan_ahead_profiles']['Row'];
type DatabasePlanAheadProfileInsert = Database['public']['Tables']['plan_ahead_profiles']['Insert'];
type DatabasePlanAheadProfileUpdate = Database['public']['Tables']['plan_ahead_profiles']['Update'];

// Convert form data to database format
function convertFormDataToDatabase(formData: PlanAheadFormData, userId: string): DatabasePlanAheadProfileInsert {
  // Split target locations into cities and states
  const targetCities: string[] = [];
  const targetStates: string[] = [];
  
  formData.targetLocations?.forEach(location => {
    const parts = location.split(', ');
    if (parts.length === 2) {
      targetCities.push(parts[0]);
      targetStates.push(parts[1]);
    }
  });

  return {
    user_id: userId,
    planned_move_date: formData.plannedMoveDate,
    flexible_move_date: formData.flexibleMoveDate || false,
    flexibility_weeks: formData.flexibilityWeeks || 0,
    current_city: formData.currentCity,
    current_state: formData.currentState,
    current_country: formData.currentCountry || 'United States',
    target_cities: targetCities,
    target_states: targetStates,
    willing_to_relocate_anywhere: formData.willingToRelocateAnywhere || false,
    max_distance_from_target: formData.maxDistanceFromTarget,
    housing_search_status: formData.housingSearchStatus as any || 'not_started',
    budget_range: formData.budgetRange,
    preferred_housing_types: formData.preferredHousingTypes || [],
    preferred_living_arrangements: formData.preferredLivingArrangements || [],
    room_type_preference: formData.roomTypePreference,
    lease_duration_preference: formData.leaseDurationPreference,
    looking_for_roommate: formData.lookingForRoommate !== false,
    max_roommates: formData.maxRoommates || 3,
    age_range_preference: formData.ageRangePreference || [18, 65],
    gender_preference: formData.genderPreference,
    lifestyle_compatibility: formData.lifestyleCompatibility,
    shared_interests: formData.sharedInterests,
    work_situation: formData.workSituation,
    school_situation: formData.schoolSituation,
    daily_schedule: formData.dailySchedule,
    social_level: formData.socialLevel,
    cleanliness_level: formData.cleanlinessLevel || 5,
    noise_tolerance: formData.noiseTolerance,
    guest_policy: formData.guestPolicy,
    special_requirements: formData.specialRequirements,
    accessibility_needs: formData.accessibilityNeeds,
    pet_situation: formData.petSituation,
    pet_preferences: formData.petPreferences,
    smoking_preference: formData.smokingPreference,
    substance_policies: formData.substancePolicies,
    communication_frequency: formData.communicationFrequency || 'weekly',
    match_notification_preferences: formData.matchNotificationPreferences || ['email', 'in_app'],
    profile_visibility: formData.profileVisibility || 'public',
    move_reason: formData.moveReason,
    prior_roommate_experience: formData.priorRoommateExperience,
    additional_notes: formData.additionalNotes,
    auto_match_enabled: true,
    is_active: true,
    profile_completion_percentage: calculateProfileCompletion(formData)
  };
}

// Calculate profile completion percentage
function calculateProfileCompletion(formData: PlanAheadFormData): number {
  const requiredFields = [
    formData.plannedMoveDate,
    formData.moveReason,
    formData.budgetRange,
    formData.preferredHousingTypes?.length,
    formData.targetLocations?.length
  ];
  
  const optionalFields = [
    formData.currentCity,
    formData.workSituation,
    formData.dailySchedule,
    formData.cleanlinessLevel,
    formData.genderPreference?.length,
    formData.lifestyleCompatibility?.length
  ];
  
  const completedRequired = requiredFields.filter(Boolean).length;
  const completedOptional = optionalFields.filter(Boolean).length;
  
  const requiredWeight = 70; // 70% for required fields
  const optionalWeight = 30; // 30% for optional fields
  
  const requiredScore = (completedRequired / requiredFields.length) * requiredWeight;
  const optionalScore = (completedOptional / optionalFields.length) * optionalWeight;
  
  return Math.round(requiredScore + optionalScore);
}

export const planAheadService = {
  // Create a new plan ahead profile
  async createProfile(formData: PlanAheadFormData): Promise<PlanAheadProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const profileData = convertFormDataToDatabase(formData, user.id);
    
    const { data, error } = await supabase
      .from('plan_ahead_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data as PlanAheadProfile;
  },

  // Get user's plan ahead profile
  async getUserProfile(userId?: string): Promise<PlanAheadProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plan_ahead_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PlanAheadProfile || null;
  },

  // Update plan ahead profile
  async updateProfile(profileId: string, updates: Partial<PlanAheadFormData>): Promise<PlanAheadProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert updates to database format
    const updateData: DatabasePlanAheadProfileUpdate = {};
    
    if (updates.plannedMoveDate) updateData.planned_move_date = updates.plannedMoveDate;
    if (updates.flexibleMoveDate !== undefined) updateData.flexible_move_date = updates.flexibleMoveDate;
    if (updates.flexibilityWeeks !== undefined) updateData.flexibility_weeks = updates.flexibilityWeeks;
    if (updates.budgetRange) updateData.budget_range = updates.budgetRange;
    if (updates.preferredHousingTypes) updateData.preferred_housing_types = updates.preferredHousingTypes;
    
    // Always update completion percentage
    updateData.profile_completion_percentage = calculateProfileCompletion(updates as PlanAheadFormData);

    const { data, error } = await supabase
      .from('plan_ahead_profiles')
      .update(updateData)
      .eq('id', profileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as PlanAheadProfile;
  },

  // Get all active profiles for matching (excluding current user)
  async getMatchingProfiles(excludeUserId?: string): Promise<PlanAheadProfile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const targetExcludeId = excludeUserId || user.id;

    const { data, error } = await supabase
      .from('plan_ahead_profiles')
      .select('*')
      .eq('is_active', true)
      .eq('profile_visibility', 'public')
      .neq('user_id', targetExcludeId);

    if (error) throw error;
    return (data as PlanAheadProfile[]) || [];
  },

  // Update timeline status
  async updateTimelineStatus(profileId: string, status: 'planning' | 'active' | 'completed' | 'cancelled'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('plan_ahead_profiles')
      .update({ timeline_status: status })
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Delete profile
  async deleteProfile(profileId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('plan_ahead_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};