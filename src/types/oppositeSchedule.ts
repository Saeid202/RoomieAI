export interface OppositeScheduleProfile {
  id?: string;
  user_id?: string;
  
  // User's Work Schedule
  work_schedule: string;
  occupation?: string;
  nationality?: string;
  
  // Property Preferences
  property_type: string;
  
  // What They're Looking For
  preferred_schedule: string;
  preferred_nationality?: string;
  food_restrictions?: string;
  
  // Additional Preferences
  additional_notes?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface OppositeScheduleFormData {
  work_schedule: string;
  occupation: string;
  nationality: string;
  property_type: string;
  preferred_schedule: string;
  preferred_nationality: string;
  food_restrictions: string;
  additional_notes: string;
}

export interface OppositeScheduleMatch {
  id: string;
  user_id: string;
  work_schedule: string;
  occupation?: string;
  nationality?: string;
  property_type: string;
  preferred_schedule: string;
  preferred_nationality?: string;
  food_restrictions?: string;
  additional_notes?: string;
  created_at: string;
  compatibility_score?: number;
}
