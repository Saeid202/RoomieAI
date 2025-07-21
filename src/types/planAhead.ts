export interface PlanAheadProfile {
  id?: string;
  user_id?: string;
  
  // Move Timeline
  planned_move_date: string;
  flexible_move_date: boolean;
  flexibility_weeks: number;
  timeline_status: 'planning' | 'active' | 'completed' | 'cancelled';
  
  // Current Status
  current_city?: string;
  current_state?: string;
  current_country: string;
  
  // Target Location
  target_cities: string[];
  target_states: string[];
  willing_to_relocate_anywhere: boolean;
  max_distance_from_target?: number;
  
  // Housing Preferences
  housing_search_status: 'not_started' | 'actively_searching' | 'applications_submitted' | 'offer_received' | 'signed_lease';
  budget_range: [number, number];
  preferred_housing_types: string[];
  preferred_living_arrangements: string[];
  room_type_preference?: string;
  lease_duration_preference?: string;
  
  // Roommate Preferences
  looking_for_roommate: boolean;
  max_roommates: number;
  age_range_preference: [number, number];
  gender_preference?: string[];
  lifestyle_compatibility?: string[];
  shared_interests?: string[];
  
  // Lifestyle Information
  work_situation?: string;
  school_situation?: string;
  daily_schedule?: string;
  social_level?: string;
  cleanliness_level: number;
  noise_tolerance?: string;
  guest_policy?: string;
  
  // Requirements & Restrictions
  special_requirements?: string[];
  accessibility_needs?: string[];
  pet_situation?: string;
  pet_preferences?: string;
  smoking_preference?: string;
  substance_policies?: string[];
  
  // Communication & Matching
  communication_frequency: string;
  match_notification_preferences: string[];
  auto_match_enabled: boolean;
  profile_visibility: string;
  
  // Additional Information
  move_reason?: string;
  prior_roommate_experience?: string;
  additional_notes?: string;
  
  // Profile Management
  is_active: boolean;
  profile_completion_percentage: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface PlanAheadMatch {
  id?: string;
  user_id: string;
  matched_user_id: string;
  profile_id: string;
  matched_profile_id: string;
  compatibility_score: number;
  match_factors?: MatchFactors;
  status: 'pending' | 'liked' | 'passed' | 'mutual_match';
  user_action?: 'liked' | 'passed' | 'bookmarked';
  matched_user_action?: 'liked' | 'passed' | 'bookmarked';
  created_at?: string;
  updated_at?: string;
}

export interface MatchFactors {
  timeline_compatibility: number;
  location_compatibility: number;
  budget_compatibility: number;
  lifestyle_compatibility: number;
  housing_compatibility: number;
  preference_compatibility: number;
  overall_score: number;
}

export interface PlanAheadFormData {
  // Move Timeline
  plannedMoveDate: string;
  flexibleMoveDate: boolean;
  flexibilityWeeks: number;
  moveReason: string;
  
  // Current Location
  currentCity: string;
  currentState: string;
  currentCountry: string;
  
  // Target Locations
  targetLocations: string[];
  willingToRelocateAnywhere: boolean;
  maxDistanceFromTarget: number;
  
  // Housing Preferences
  housingSearchStatus: string;
  budgetRange: [number, number];
  preferredHousingTypes: string[];
  preferredLivingArrangements: string[];
  roomTypePreference: string;
  leaseDurationPreference: string;
  
  // Roommate Preferences
  lookingForRoommate: boolean;
  maxRoommates: number;
  ageRangePreference: [number, number];
  genderPreference: string[];
  lifestyleCompatibility: string[];
  sharedInterests: string[];
  
  // Lifestyle
  workSituation: string;
  schoolSituation: string;
  dailySchedule: string;
  socialLevel: string;
  cleanlinessLevel: number;
  noiseTolerance: string;
  guestPolicy: string;
  
  // Special Requirements
  specialRequirements: string[];
  accessibilityNeeds: string[];
  petSituation: string;
  petPreferences: string;
  smokingPreference: string;
  substancePolicies: string[];
  
  // Communication
  communicationFrequency: string;
  matchNotificationPreferences: string[];
  profileVisibility: string;
  
  // Additional Info
  priorRoommateExperience: string;
  additionalNotes: string;
}