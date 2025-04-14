
import { z } from "zod";

// Define the co-owner validation schema
export const coOwnerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  occupation: z.string().min(2, "Occupation must be at least 2 characters"),
  preferredLocation: z.string().min(1, "Location is required"),
  coOwnershipExperience: z.enum(["None", "Some", "Extensive"]),
  investmentCapacity: z.array(z.number()).min(2).max(2),
  investmentTimeline: z.enum(["0-6 months", "6-12 months", "1-2 years", "2+ years"]),
  propertyType: z.enum(["House", "Apartment", "Condo", "Townhouse", "Multi-family", "Any"]),
});

export type CoOwnerFormValues = z.infer<typeof coOwnerSchema>;
