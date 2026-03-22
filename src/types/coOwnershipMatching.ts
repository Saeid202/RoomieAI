// Mirrors co_ownership_profiles table (existing)
export interface CoOwnershipProfile {
  id: string;
  user_id: string;
  budget_min: number;
  budget_max: number;
  down_payment: number;
  annual_income: number;
  credit_score_range: string; // e.g. "700-749", "750+", "flexible"
  property_types: string[];
  preferred_locations: string[];
  min_bedrooms: number;
  purchase_timeline: string; // "0-3 months" | "3-6 months" | "6-12 months" | "12+ months"
  ownership_split: string;   // "50/50" | "60/40" | "70/30" | "flexible"
  living_arrangements: string[];
  co_ownership_purposes: string[];
  age_range: string;
  occupation: string;
  why_co_ownership: string;
  profile_completeness: number;
  is_active: boolean;
}

export type ScoreTier = 'exceptional' | 'strong' | 'good' | 'possible';

export interface SubScores {
  budgetOverlap: number;
  downPaymentComp: number;
  incomeComp: number;
  creditCompat: number;
  locationOverlap: number;
  propertyTypeOverlap: number;
  timelineAlignment: number;
  ownershipSplit: number;
  livingArrangement: number;
  purposeAlignment: number;
}

export interface ScoredPair {
  profile1: CoOwnershipProfile;
  profile2: CoOwnershipProfile;
  totalScore: number;
  tier: ScoreTier;
  financialScore: number;
  propertyScore: number;
  structureScore: number;
  qualityScore: number;
  bonusScore: number;
  subScores: SubScores;
}

export type ConnectionState = 'pending_chat' | 'active_chat' | 'declined' | 'blocked';

export interface Connection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  initiated_by: string;
  state: ConnectionState;
  education_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Partial profile — safe to show before connection
export interface PartialProfile {
  userId: string;
  ageRange: string;
  occupation: string;
  whyCoOwnership: string;
  approxBudgetMin: number;  // rounded to nearest $50K
  approxBudgetMax: number;
  preferredLocations: string[];
  coOwnershipPurposes: string[];
  livingArrangements: string[];
}

export interface PartialMatchResult {
  matchId: string;
  totalScore: number;
  tier: ScoreTier;
  financialScore: number;
  propertyScore: number;
  structureScore: number;
  qualityScore: number;
  bonusScore: number;
  subScores: SubScores;
  aiBriefing: string | null;
  gapAnalysis: string | null;
  partialProfile: PartialProfile;
  connectionState: ConnectionState | null;
}

export interface FullMatchResult {
  matchId: string;
  totalScore: number;
  tier: ScoreTier;
  financialScore: number;
  propertyScore: number;
  structureScore: number;
  qualityScore: number;
  bonusScore: number;
  subScores: SubScores;
  aiBriefing: string | null;
  gapAnalysis: string | null;
  fullProfile: CoOwnershipProfile;
  connectionState: ConnectionState | null;
}

export interface FilterCounts {
  inactive: number;
  lowCompleteness: number;
  noBudgetOverlap: number;
}

export interface MatchEventCounts {
  totalActiveProfiles: number;
  totalPairsEvaluated: number;
  totalPairsFiltered: number;
  filterCounts: FilterCounts;
  totalPairsScored: number;
  totalMatchesStored: number;
  totalNotificationsSent: number;
  totalBriefingsGenerated: number;
}
