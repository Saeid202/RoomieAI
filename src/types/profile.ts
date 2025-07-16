
import { z } from "zod";

// Define the validation schema
export const profileSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  gender: z.string().optional(),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  linkedinProfile: z.string().optional(),
  
  // New demographic fields
  nationality: z.string().optional(),
  language: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  
  // Housing Preferences (simplified)
  preferredLocation: z.array(z.string()).max(15, "Maximum 15 locations allowed"),
  budgetRange: z.array(z.number()).min(2).max(2),
  moveInDateStart: z.date({
    required_error: "Please select a move-in start date",
  }),
  moveInDateEnd: z.date({
    required_error: "Please select a move-in end date",
  }),
  housingType: z.enum(["house", "apartment"]),
  livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"]),
  
  // Lifestyle & Habits (simplified)
  smoking: z.boolean(),
  livesWithSmokers: z.boolean(),
  hasPets: z.boolean(),
  petType: z.string().optional(),
  workLocation: z.enum(["remote", "office", "hybrid"]),
  workSchedule: z.enum(["dayShift", "afternoonShift", "overnightShift"]),
  hobbies: z.array(z.string()),
  diet: z.enum(["vegetarian", "halal", "kosher", "noPreference", "other"]),
  dietOther: z.string().optional(),
  profileVisibility: z.array(z.string()).optional(),
  
  // Ideal Roommate Preferences
  ageRangePreference: z.array(z.number()).min(2).max(2).optional(),
  genderPreference: z.array(z.string()).optional(),
  nationalityPreference: z.enum(["sameCountry", "noPreference", "custom"]).optional(),
  nationalityCustom: z.string().optional(),
  languagePreference: z.enum(["sameLanguage", "noPreference", "specific"]).optional(),
  languageSpecific: z.string().optional(),
  dietaryPreferences: z.enum(["vegetarian", "halal", "kosher", "others", "noPreference"]).optional(),
  dietaryOther: z.string().optional(),
  occupationPreference: z.boolean().optional(),
  occupationSpecific: z.string().optional(),
  workSchedulePreference: z.enum(["opposite", "dayShift", "afternoonShift", "overnightShift", "noPreference"]).optional(),
  ethnicityPreference: z.enum(["same", "noPreference", "others"]).optional(),
  ethnicityOther: z.string().optional(),
  religionPreference: z.enum(["same", "noPreference", "others"]).optional(),
  religionOther: z.string().optional(),
  petPreference: z.enum(["noPets", "catOk", "smallPetsOk"]).optional(),
  petSpecification: z.string().optional(),
  smokingPreference: z.enum(["noSmoking", "noVaping", "socialOk"]).optional(),
  roommateHobbies: z.array(z.string()).optional(),
  rentOption: z.enum(["findTogether", "joinExisting"]).optional(),
  
  // Preference importance fields
  age_range_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  gender_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  nationality_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  language_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  dietary_preferences_importance: z.enum(["notImportant", "important", "must"]).optional(),
  occupation_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  work_schedule_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  ethnicity_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  religion_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  pet_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
  smoking_preference_importance: z.enum(["notImportant", "important", "must"]).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import the MatchResult type from matchingAlgorithm to maintain consistency
import { MatchResult as AlgorithmMatchResult } from "@/utils/matchingAlgorithm";
export type MatchResult = AlgorithmMatchResult;
