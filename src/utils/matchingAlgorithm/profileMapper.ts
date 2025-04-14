
import { ProfileFormValues, ProfileData } from "./types";
import { convertFormToProfileData } from "./index";

// Re-export the helper function for consistency
export { convertFormToProfileData };

// Original mapper function for backward compatibility
export const mapFormToProfileData = convertFormToProfileData;
