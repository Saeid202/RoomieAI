// User preference importance types
export type PreferenceImportance = 'must' | 'important' | 'notImportant';

export interface PreferenceWeight {
  importance: PreferenceImportance;
  weight: number; // Calculated weight based on importance
}

export interface UserPreferences {
  // Basic demographic preferences
  gender: PreferenceWeight;
  age: PreferenceWeight;
  nationality: PreferenceWeight;
  language: PreferenceWeight;
  ethnicity: PreferenceWeight;
  religion: PreferenceWeight;
  occupation: PreferenceWeight;
  
  // Location and housing preferences
  location: PreferenceWeight;
  budget: PreferenceWeight;
  housingType: PreferenceWeight;
  livingSpace: PreferenceWeight;
  
  // Lifestyle preferences
  smoking: PreferenceWeight;
  pets: PreferenceWeight;
  workSchedule: PreferenceWeight;
  diet: PreferenceWeight;
  
  // Social and compatibility preferences
  hobbies: PreferenceWeight;
  cleanliness: PreferenceWeight;
  socialLevel: PreferenceWeight;
  guests: PreferenceWeight;
  sleepSchedule: PreferenceWeight;
}

export interface PreferenceOption {
  key: keyof UserPreferences;
  label: string;
  description: string;
  category: 'demographics' | 'housing' | 'lifestyle' | 'social';
}

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  // Demographics
  { 
    key: 'gender', 
    label: 'Gender', 
    description: 'Roommate gender preference',
    category: 'demographics'
  },
  { 
    key: 'age', 
    label: 'Age Range', 
    description: 'Preferred age range for roommate',
    category: 'demographics'
  },
  { 
    key: 'nationality', 
    label: 'Nationality', 
    description: 'Roommate nationality preference',
    category: 'demographics'
  },
  { 
    key: 'language', 
    label: 'Language', 
    description: 'Preferred communication language',
    category: 'demographics'
  },
  { 
    key: 'ethnicity', 
    label: 'Ethnicity', 
    description: 'Roommate ethnicity preference',
    category: 'demographics'
  },
  { 
    key: 'religion', 
    label: 'Religion', 
    description: 'Roommate religious background preference',
    category: 'demographics'
  },
  { 
    key: 'occupation', 
    label: 'Occupation', 
    description: 'Roommate profession or work field',
    category: 'demographics'
  },
  
  // Housing
  { 
    key: 'location', 
    label: 'Location', 
    description: 'Preferred living area or neighborhood',
    category: 'housing'
  },
  { 
    key: 'budget', 
    label: 'Budget Range', 
    description: 'Compatible rental budget range',
    category: 'housing'
  },
  { 
    key: 'housingType', 
    label: 'Housing Type', 
    description: 'Apartment vs house preference',
    category: 'housing'
  },
  { 
    key: 'livingSpace', 
    label: 'Living Space', 
    description: 'Private room vs shared space preference',
    category: 'housing'
  },
  
  // Lifestyle
  { 
    key: 'smoking', 
    label: 'Smoking Policy', 
    description: 'Smoking preferences and restrictions',
    category: 'lifestyle'
  },
  { 
    key: 'pets', 
    label: 'Pet Policy', 
    description: 'Pet ownership and preferences',
    category: 'lifestyle'
  },
  { 
    key: 'workSchedule', 
    label: 'Work Schedule', 
    description: 'Compatible work hours and schedules',
    category: 'lifestyle'
  },
  { 
    key: 'diet', 
    label: 'Dietary Preferences', 
    description: 'Food restrictions and preferences',
    category: 'lifestyle'
  },
  
  // Social
  { 
    key: 'hobbies', 
    label: 'Hobbies & Interests', 
    description: 'Shared interests and activities',
    category: 'social'
  },
  { 
    key: 'cleanliness', 
    label: 'Cleanliness Standards', 
    description: 'Home cleanliness and organization',
    category: 'social'
  },
  { 
    key: 'socialLevel', 
    label: 'Social Level', 
    description: 'Social interaction preferences',
    category: 'social'
  },
  { 
    key: 'guests', 
    label: 'Guest Policy', 
    description: 'Having friends and visitors over',
    category: 'social'
  },
  { 
    key: 'sleepSchedule', 
    label: 'Sleep Schedule', 
    description: 'Sleep timing and noise preferences',
    category: 'social'
  }
];

// Default preference weights
export const DEFAULT_PREFERENCES: UserPreferences = {
  gender: { importance: 'important', weight: 0.8 },
  age: { importance: 'important', weight: 0.7 },
  nationality: { importance: 'notImportant', weight: 0.3 },
  language: { importance: 'important', weight: 0.6 },
  ethnicity: { importance: 'notImportant', weight: 0.2 },
  religion: { importance: 'notImportant', weight: 0.3 },
  occupation: { importance: 'notImportant', weight: 0.4 },
  
  location: { importance: 'must', weight: 1.0 },
  budget: { importance: 'must', weight: 1.0 },
  housingType: { importance: 'important', weight: 0.6 },
  livingSpace: { importance: 'important', weight: 0.7 },
  
  smoking: { importance: 'must', weight: 1.0 },
  pets: { importance: 'important', weight: 0.8 },
  workSchedule: { importance: 'important', weight: 0.7 },
  diet: { importance: 'notImportant', weight: 0.4 },
  
  hobbies: { importance: 'important', weight: 0.6 },
  cleanliness: { importance: 'important', weight: 0.8 },
  socialLevel: { importance: 'notImportant', weight: 0.5 },
  guests: { importance: 'notImportant', weight: 0.4 },
  sleepSchedule: { importance: 'important', weight: 0.7 }
};

// Utility functions
export function calculateWeight(importance: PreferenceImportance): number {
  switch (importance) {
    case 'must':
      return 1.0;
    case 'important':
      return 0.7;
    case 'notImportant':
      return 0.3;
    default:
      return 0.5;
  }
}

export function updatePreferenceWeight(
  preferences: UserPreferences, 
  key: keyof UserPreferences, 
  importance: PreferenceImportance
): UserPreferences {
  return {
    ...preferences,
    [key]: {
      importance,
      weight: calculateWeight(importance)
    }
  };
} 