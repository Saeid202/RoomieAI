
import { CoOwnerFormValues } from "@/components/dashboard/co-owner/types";
import { ProfileTableRow } from "@/components/dashboard/types/profileTypes";
import { safeString, safeArray, safeEnum } from './mapperUtils';

/**
 * Maps database row data to the CoOwnerFormValues format used by the form
 */
export function mapCoOwnerDbRowToFormValues(data: ProfileTableRow): Partial<CoOwnerFormValues> {
  // Create default formattedData with safe defaults
  const formattedData: Partial<CoOwnerFormValues> = {
    fullName: "",
    age: "",
    email: "",
    phoneNumber: "",
    occupation: "",
    investmentCapacity: [100000, 500000],
    investmentTimeline: "0-6 months",
    propertyType: "Any",
    preferredLocation: "",
    coOwnershipExperience: "None",
  };
  
  // Map basic information
  if ('full_name' in data) formattedData.fullName = safeString(data.full_name);
  if ('age' in data) formattedData.age = safeString(data.age);
  if ('email' in data) formattedData.email = safeString(data.email);
  if ('phone_number' in data) formattedData.phoneNumber = safeString(data.phone_number);
  if ('occupation' in data) formattedData.occupation = safeString(data.occupation);
  if ('preferred_location' in data) formattedData.preferredLocation = safeString(data.preferred_location);
  
  // Map investment details
  if ('investment_capacity' in data) {
    formattedData.investmentCapacity = safeArray(data.investment_capacity, Number);
  }
  
  if ('investment_timeline' in data) {
    formattedData.investmentTimeline = safeEnum(
      data.investment_timeline,
      ["0-6 months", "6-12 months", "1-2 years", "2+ years"],
      "0-6 months"
    );
  }
  
  if ('property_type' in data) {
    formattedData.propertyType = safeEnum(
      data.property_type,
      ["Apartment", "House", "Townhouse", "Any"],
      "Any"
    );
  }
  
  if ('co_ownership_experience' in data) {
    formattedData.coOwnershipExperience = safeEnum(
      data.co_ownership_experience,
      ["None", "Some", "Experienced"],
      "None"
    );
  }
  
  return formattedData;
}

/**
 * Maps form values (CoOwnerFormValues) to database row format for saving
 */
export function mapCoOwnerFormToDbRow(formData: CoOwnerFormValues, userId: string): ProfileTableRow {
  // Create the database row object with the correct types
  const dbRow: ProfileTableRow = {
    user_id: userId,
    full_name: formData.fullName,
    age: formData.age,
    email: formData.email,
    phone_number: formData.phoneNumber,
    occupation: formData.occupation,
    preferred_location: formData.preferredLocation,
    investment_capacity: formData.investmentCapacity,
    investment_timeline: formData.investmentTimeline,
    property_type: formData.propertyType,
    co_ownership_experience: formData.coOwnershipExperience,
    updated_at: new Date().toISOString(),
  };

  return dbRow;
}
