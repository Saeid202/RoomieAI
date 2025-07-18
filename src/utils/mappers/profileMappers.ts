
import { ProfileFormValues } from "@/types/profile";
import { ProfileTableRow } from "@/components/dashboard/types/profileTypes";
import {
  mapBasicInfoDbToForm,
  mapHousingDbToForm,
  mapLifestyleDbToForm,
  mapRoommatePreferencesDbToForm,
  mapBasicInfoFormToDb,
  mapHousingFormToDb,
  mapLifestyleFormToDb,
  mapRoommatePreferencesFormToDb
} from './mappingUtils';

/**
 * Maps database row data to the ProfileFormValues format used by the form
 */
export function mapDbRowToFormValues(data: ProfileTableRow): Partial<ProfileFormValues> {
  // Create default formattedData with safe defaults
  const formattedData: Partial<ProfileFormValues> = {
    fullName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    linkedinProfile: "",
    nationality: "",
    language: "",
    ethnicity: "",
    religion: "",
    occupation: "",
    preferredLocation: [],
    budgetRange: [800, 1500],
    moveInDateStart: new Date(),
    
    housingType: "apartment",
    livingSpace: "privateRoom",
    smoking: false,
    livesWithSmokers: false,
    hasPets: false,
    petType: "",
    workLocation: "remote",
    workSchedule: "dayShift",
    hobbies: [],
    diet: "noPreference",
    genderPreference: [],
    nationalityPreference: "noPreference",
    nationalityCustom: "",
    languagePreference: "noPreference",
    languageSpecific: "",
    ethnicityPreference: "noPreference",
    religionPreference: "noPreference",
    ethnicityOther: "",
    religionOther: "",
    occupationPreference: false,
    occupationSpecific: "",
    workSchedulePreference: "noPreference",
    roommateHobbies: [],
    rentOption: "findTogether",
  };
  
  // Map different sections
  Object.assign(formattedData, mapBasicInfoDbToForm(data));
  Object.assign(formattedData, mapHousingDbToForm(data));
  Object.assign(formattedData, mapLifestyleDbToForm(data));
  Object.assign(formattedData, mapRoommatePreferencesDbToForm(data));
  
  return formattedData;
}

/**
 * Maps form values (ProfileFormValues) to database row format for saving
 */
export function mapFormValuesToDbRow(formData: ProfileFormValues, userId: string): ProfileTableRow {
  // Create the database row object with the correct types
  const dbRow: ProfileTableRow = {
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...mapBasicInfoFormToDb(formData),
    ...mapHousingFormToDb(formData),
    ...mapLifestyleFormToDb(formData),
    ...mapRoommatePreferencesFormToDb(formData),
  } as ProfileTableRow;

  return dbRow;
}
