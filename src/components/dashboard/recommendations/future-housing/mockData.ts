
import { FutureHousingPlan, PlanRecommendation } from "./types";

// Mock plans for demonstration
export const initialPlans: FutureHousingPlan[] = [
  {
    id: "plan-1",
    location: "Toronto",
    moveInDate: new Date(2025, 8, 1), // September 1, 2025
    flexibilityDays: 14,
    budgetRange: [1000, 1800],
    lookingFor: 'both',
    purpose: "University - Fall Semester",
    notificationPreference: 'both',
    status: 'active',
    additionalNotes: "Looking for a place close to University of Toronto"
  }
];

// Mock recommendations based on user profile and housing plan
export const mockRecommendations: PlanRecommendation[] = [
  {
    id: "rec-1",
    type: "roommate",
    title: "Roommate with similar timeline",
    description: "Sarah is also looking to move to Toronto in September 2025 for the university semester",
    confidence: 0.87,
    tags: ["University Student", "Similar Budget", "Compatible Schedule"]
  },
  {
    id: "rec-2",
    type: "property",
    title: "Pre-leasing apartment near UofT",
    description: "Modern apartment with pre-leasing options for September 2025 within walking distance to campus",
    confidence: 0.74,
    tags: ["Close to University", "Within Budget", "Available Sept 2025"]
  },
  {
    id: "rec-3",
    type: "alternative",
    title: "Consider Mississauga",
    description: "More affordable options with transit access to Toronto",
    confidence: 0.65,
    tags: ["Cost Saving", "Alternative Location", "More Availability"]
  }
];
