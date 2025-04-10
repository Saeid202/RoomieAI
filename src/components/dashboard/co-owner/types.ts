
import { z } from "zod";

// Define the schema for the co-owner profile form
export const coOwnerFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  occupation: z.string().min(2, "Occupation is required"),
  investmentCapacity: z.array(z.number()).length(2),
  investmentTimeline: z.enum(["0-6 months", "6-12 months", "1-2 years", "2+ years"]),
  propertyType: z.enum(["Apartment", "House", "Townhouse", "Any"]),
  preferredLocation: z.string(),
  coOwnershipExperience: z.enum(["None", "Some", "Experienced"]),
});

export type CoOwnerFormValues = z.infer<typeof coOwnerFormSchema>;
