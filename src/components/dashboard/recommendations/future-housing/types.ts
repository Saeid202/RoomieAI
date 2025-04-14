
// Types for future housing plans
export interface FutureHousingPlan {
  id: string;
  location: string;
  moveInDate: Date;
  flexibilityDays: number;
  budgetRange: [number, number];
  lookingFor: 'roommate' | 'property' | 'both';
  purpose: string;
  notificationPreference: 'email' | 'app' | 'both';
  status: 'active' | 'pending' | 'completed' | 'archived';
  additionalNotes?: string;
}

export interface PlanRecommendation {
  id: string;
  type: 'roommate' | 'property' | 'alternative';
  title: string;
  description: string;
  confidence: number;
  tags: string[];
}
