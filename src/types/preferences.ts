export type PreferenceImportance = "must" | "important" | "notImportant";

export interface PreferenceItem {
  importance: PreferenceImportance;
  weight: number;
}

export interface UserPreferences {
  // Demographics
  ageRange: PreferenceItem;
  gender: PreferenceItem;
  nationality: PreferenceItem;
  language: PreferenceItem;
  ethnicity: PreferenceItem;
  religion: PreferenceItem;
  occupation: PreferenceItem;
  
  // Housing
  location: PreferenceItem;
  budget: PreferenceItem;
  housingType: PreferenceItem;
  livingSpace: PreferenceItem;
  
  // Lifestyle
  smoking: PreferenceItem;
  pets: PreferenceItem;
  workSchedule: PreferenceItem;
  diet: PreferenceItem;
  hobbies: PreferenceItem;
  
  // Social
  cleanliness: PreferenceItem;
  socialLevel: PreferenceItem;
  guests: PreferenceItem;
  sleepSchedule: PreferenceItem;
}

export interface PreferenceOption {
  key: keyof UserPreferences;
  label: string;
  description: string;
  category: string;
}

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  // Demographics
  { key: "ageRange", label: "Age Range", description: "Preferred age range for roommates", category: "demographics" },
  { key: "gender", label: "Gender", description: "Gender preference for roommates", category: "demographics" },
  { key: "nationality", label: "Nationality", description: "Nationality/cultural background preference", category: "demographics" },
  { key: "language", label: "Language", description: "Primary language preference", category: "demographics" },
  { key: "ethnicity", label: "Ethnicity", description: "Ethnic background preference", category: "demographics" },
  { key: "religion", label: "Religion", description: "Religious background preference", category: "demographics" },
  { key: "occupation", label: "Occupation", description: "Professional background preference", category: "demographics" },
  
  // Housing
  { key: "location", label: "Location", description: "Preferred living location", category: "housing" },
  { key: "budget", label: "Budget", description: "Budget compatibility", category: "housing" },
  { key: "housingType", label: "Housing Type", description: "Apartment vs house preference", category: "housing" },
  { key: "livingSpace", label: "Living Space", description: "Private room vs shared space", category: "housing" },
  
  // Lifestyle
  { key: "smoking", label: "Smoking", description: "Smoking preferences and tolerance", category: "lifestyle" },
  { key: "pets", label: "Pets", description: "Pet ownership and preferences", category: "lifestyle" },
  { key: "workSchedule", label: "Work Schedule", description: "Work schedule compatibility", category: "lifestyle" },
  { key: "diet", label: "Diet", description: "Dietary preferences and restrictions", category: "lifestyle" },
  { key: "hobbies", label: "Hobbies", description: "Shared interests and activities", category: "lifestyle" },
  
  // Social
  { key: "cleanliness", label: "Cleanliness", description: "Cleanliness standards", category: "social" },
  { key: "socialLevel", label: "Social Level", description: "Social activity preferences", category: "social" },
  { key: "guests", label: "Guests", description: "Frequency of having guests over", category: "social" },
  { key: "sleepSchedule", label: "Sleep Schedule", description: "Sleep and wake time compatibility", category: "social" },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  // Demographics - typically less important
  ageRange: { importance: "notImportant", weight: 0.3 },
  gender: { importance: "notImportant", weight: 0.3 },
  nationality: { importance: "notImportant", weight: 0.3 },
  language: { importance: "notImportant", weight: 0.3 },
  ethnicity: { importance: "notImportant", weight: 0.3 },
  religion: { importance: "notImportant", weight: 0.3 },
  occupation: { importance: "notImportant", weight: 0.3 },
  
  // Housing - typically important
  location: { importance: "important", weight: 0.7 },
  budget: { importance: "important", weight: 0.7 },
  housingType: { importance: "notImportant", weight: 0.3 },
  livingSpace: { importance: "important", weight: 0.7 },
  
  // Lifestyle - mixed importance
  smoking: { importance: "important", weight: 0.7 },
  pets: { importance: "important", weight: 0.7 },
  workSchedule: { importance: "notImportant", weight: 0.3 },
  diet: { importance: "notImportant", weight: 0.3 },
  hobbies: { importance: "notImportant", weight: 0.3 },
  
  // Social - typically important
  cleanliness: { importance: "important", weight: 0.7 },
  socialLevel: { importance: "notImportant", weight: 0.3 },
  guests: { importance: "notImportant", weight: 0.3 },
  sleepSchedule: { importance: "important", weight: 0.7 },
};

export function updatePreferenceWeight(
  preferences: UserPreferences,
  key: keyof UserPreferences,
  importance: PreferenceImportance
): UserPreferences {
  const weightMap: Record<PreferenceImportance, number> = {
    must: 1.0,
    important: 0.7,
    notImportant: 0.3
  };

  return {
    ...preferences,
    [key]: {
      importance,
      weight: weightMap[importance]
    }
  };
}