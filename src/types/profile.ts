
import { z } from "zod";

const optionalString = () =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().optional()
  );

const optionalStringWithMin = (min: number, message: string) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().min(min, message).optional()
  );

const optionalEmail = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().email("Please enter a valid email address").optional()
);

const optionalPhone = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().min(10, "Please enter a valid phone number").optional()
);

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.enum(values).optional()
  );

const optionalDate = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.date().optional()
);

const optionalNumberArray = z
  .array(z.number())
  .length(2, "Please provide both minimum and maximum budget values")
  .optional();

// Define the validation schema
export const profileSchema = z.object({
  // Basic Information
  fullName: optionalStringWithMin(2, "Name must be at least 2 characters"),
  age: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z
        .string()
        .optional()
        .refine(
          (val) => !val || (!isNaN(Number(val)) && Number(val) >= 18),
          { message: "Age must be a number and at least 18" }
        )
    ),
  gender: optionalString(),
  phoneNumber: optionalPhone,
  email: optionalEmail,
  linkedinProfile: optionalString(),

  // New demographic fields
  nationality: optionalString(),
  language: optionalString(),
  ethnicity: optionalString(),
  religion: optionalString(),
  occupation: optionalString(),

  // Housing Preferences (simplified)
  preferredLocation: z.array(z.string()).max(15, "Maximum 15 locations allowed").optional(),
  budgetRange: optionalNumberArray,
  moveInDateStart: optionalDate,
  housingType: optionalEnum(["house", "apartment"] as const),
  livingSpace: optionalEnum(["privateRoom", "sharedRoom", "entirePlace"] as const),

  // Lifestyle & Habits (simplified)
  smoking: z.boolean().optional(),
  livesWithSmokers: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  petType: optionalString(),
  workLocation: optionalEnum(["remote", "office", "hybrid"] as const),
  workSchedule: optionalEnum(["dayShift", "afternoonShift", "overnightShift"] as const),
  hobbies: z.array(z.string()).optional(),
  diet: optionalEnum(["vegetarian", "halal", "kosher", "noPreference", "other"] as const),
  dietOther: optionalString(),
  profileVisibility: z.array(z.string()).optional(),

  // Ideal Roommate Preferences
  ageRangePreference: z.array(z.number()).min(2).max(2).optional(),
  genderPreference: z.array(z.string()).optional(),
  nationalityPreference: optionalEnum(["sameCountry", "noPreference", "custom"] as const),
  nationalityCustom: optionalString(),
  languagePreference: optionalEnum(["sameLanguage", "noPreference", "specific"] as const),
  languageSpecific: optionalString(),
  dietaryPreferences: optionalEnum(["vegetarian", "halal", "kosher", "others", "noPreference"] as const),
  dietaryOther: optionalString(),
  occupationPreference: z.boolean().optional(),
  occupationSpecific: optionalString(),
  workSchedulePreference: optionalEnum(["opposite", "dayShift", "afternoonShift", "overnightShift", "noPreference"] as const),
  ethnicityPreference: optionalEnum(["same", "noPreference", "others"] as const),
  ethnicityOther: optionalString(),
  religionPreference: optionalEnum(["same", "noPreference", "others"] as const),
  religionOther: optionalString(),
  petPreference: optionalEnum(["noPets", "catOk", "smallPetsOk"] as const),
  petSpecification: optionalString(),
  smokingPreference: optionalEnum(["noSmoking", "noVaping", "socialOk"] as const),
  roommateHobbies: z.array(z.string()).optional(),
  rentOption: optionalEnum(["findTogether", "joinExisting"] as const),

  // New housing preference field
  housingPreference: z
    .array(
      z.enum([
        "onlyRoommate",
        "sharingRoom",
        "sharingApartment",
        "sharingHouse",
        "singleOneBed",
        "twoBed",
        "entireHouse",
      ] as const)
    )
    .optional(),

  // Preference importance fields
  age_range_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  gender_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  nationality_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  language_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  dietary_preferences_importance: optionalEnum(["notImportant", "important", "must"] as const),
  occupation_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  work_schedule_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  ethnicity_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  religion_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  pet_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  smoking_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
  housing_preference_importance: optionalEnum(["notImportant", "important", "must"] as const),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import the MatchResult type from matchingAlgorithm to maintain consistency
import { MatchResult as AlgorithmMatchResult } from "@/utils/matchingAlgorithm";
export type MatchResult = AlgorithmMatchResult;
