// Co-Ownership Profile Types
// Types for the co-buyer matching profile feature

import { z } from 'zod';

// ============================================================================
// Database Types
// ============================================================================

export interface CoOwnershipProfile {
  id: string;
  user_id: string;
  
  // Financial Capacity
  budget_min: number | null;
  budget_max: number | null;
  down_payment: number | null;
  annual_income: number | null;
  credit_score_range: CreditScoreRange | null;
  
  // Property Preferences
  property_types: PropertyType[];
  preferred_locations: string[];
  min_bedrooms: number | null;
  purchase_timeline: PurchaseTimeline | null;
  
  // Co-Ownership Preferences
  ownership_split: OwnershipSplit | null;
  living_arrangements: LivingArrangement[];
  co_ownership_purposes: CoOwnershipPurpose[];
  
  // About You
  age_range: AgeRange | null;
  occupation: string | null;
  why_co_ownership: string | null;
  
  // Metadata
  profile_completeness: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Enum Types
// ============================================================================

export type CreditScoreRange = 
  | 'below_600'
  | '600-649'
  | '650-699'
  | '700-749'
  | '750+';

export type PropertyType = 
  | 'condo'
  | 'townhouse'
  | 'detached'
  | 'semi-detached'
  | 'multi-unit';

export type PurchaseTimeline = 
  | '0-3 months'
  | '3-6 months'
  | '6-12 months'
  | '12+ months';

export type OwnershipSplit = 
  | '50/50'
  | '60/40'
  | '70/30'
  | 'flexible';

export type LivingArrangement = 
  | 'live_together'
  | 'rent_out'
  | 'investment_only';

export type CoOwnershipPurpose = 
  | 'primary_residence'
  | 'investment'
  | 'vacation_property';

export type AgeRange = 
  | '18-25'
  | '26-35'
  | '36-45'
  | '46-55'
  | '56+';

// ============================================================================
// Form Data Types
// ============================================================================

export interface CoOwnershipProfileFormData {
  // Financial Capacity
  budget_min: string;
  budget_max: string;
  down_payment: string;
  annual_income: string;
  credit_score_range: CreditScoreRange | '';
  
  // Property Preferences
  property_types: PropertyType[];
  preferred_locations: string[];
  min_bedrooms: number | null;
  purchase_timeline: PurchaseTimeline | '';
  
  // Co-Ownership Preferences
  ownership_split: OwnershipSplit | '';
  living_arrangements: LivingArrangement[];
  co_ownership_purposes: CoOwnershipPurpose[];
  
  // About You
  age_range: AgeRange | '';
  occupation: string;
  why_co_ownership: string;
}

// ============================================================================
// Validation Schema (Zod)
// ============================================================================

export const coOwnershipProfileSchema = z.object({
  // Financial Capacity
  budget_min: z.string()
    .min(1, 'Minimum budget is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  
  budget_max: z.string()
    .min(1, 'Maximum budget is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  
  down_payment: z.string()
    .min(1, 'Down payment is required')
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Must be a non-negative number'),
  
  annual_income: z.string()
    .min(1, 'Annual income is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  
  credit_score_range: z.enum(['below_600', '600-649', '650-699', '700-749', '750+', ''] as const)
    .refine(val => val !== '', 'Credit score range is required'),
  
  // Property Preferences
  property_types: z.array(z.enum(['condo', 'townhouse', 'detached', 'semi-detached', 'multi-unit']))
    .min(1, 'Select at least one property type'),
  
  preferred_locations: z.array(z.string())
    .min(1, 'Select at least one location'),
  
  min_bedrooms: z.number()
    .min(0, 'Bedrooms must be 0 or more')
    .max(10, 'Bedrooms must be 10 or less')
    .nullable(),
  
  purchase_timeline: z.enum(['0-3 months', '3-6 months', '6-12 months', '12+ months', ''] as const)
    .refine(val => val !== '', 'Purchase timeline is required'),
  
  // Co-Ownership Preferences
  ownership_split: z.enum(['50/50', '60/40', '70/30', 'flexible', ''] as const)
    .refine(val => val !== '', 'Ownership split is required'),
  
  living_arrangements: z.array(z.enum(['live_together', 'rent_out', 'investment_only']))
    .min(1, 'Select at least one living arrangement'),
  
  co_ownership_purposes: z.array(z.enum(['primary_residence', 'investment', 'vacation_property']))
    .min(1, 'Select at least one purpose'),
  
  // About You
  age_range: z.enum(['18-25', '26-35', '36-45', '46-55', '56+', ''] as const)
    .refine(val => val !== '', 'Age range is required'),
  
  occupation: z.string()
    .min(1, 'Occupation is required')
    .max(100, 'Occupation must be 100 characters or less'),
  
  why_co_ownership: z.string()
    .max(500, 'Maximum 500 characters allowed')
    .optional(),
}).refine(
  data => Number(data.budget_min) <= Number(data.budget_max),
  {
    message: 'Minimum budget must be less than or equal to maximum budget',
    path: ['budget_min'],
  }
);

// ============================================================================
// Helper Types
// ============================================================================

export interface ProfileCompletenessMetrics {
  totalFields: number;
  filledFields: number;
  percentage: number;
  missingSections: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'length';
}

// ============================================================================
// Display Labels
// ============================================================================

export const CREDIT_SCORE_LABELS: Record<CreditScoreRange, string> = {
  'below_600': 'Building (<600)',
  '600-649': 'Fair (600-649)',
  '650-699': 'Good (650-699)',
  '700-749': 'Very Good (700-749)',
  '750+': 'Excellent (750+)',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  'condo': 'Condo',
  'townhouse': 'Townhouse',
  'detached': 'Detached',
  'semi-detached': 'Semi-Detached',
  'multi-unit': 'Multi-Unit',
};

export const PURCHASE_TIMELINE_LABELS: Record<PurchaseTimeline, string> = {
  '0-3 months': 'Immediately (0-3 months)',
  '3-6 months': '3-6 months',
  '6-12 months': '6-12 months',
  '12+ months': '1+ years',
};

export const OWNERSHIP_SPLIT_LABELS: Record<OwnershipSplit, string> = {
  '50/50': '50/50 Split',
  '60/40': '60/40 Split',
  '70/30': '70/30 Split',
  'flexible': 'Flexible',
};

export const LIVING_ARRANGEMENT_LABELS: Record<LivingArrangement, string> = {
  'live_together': 'Both Live There',
  'rent_out': 'Rent Out',
  'investment_only': 'Investment Only',
};

export const CO_OWNERSHIP_PURPOSE_LABELS: Record<CoOwnershipPurpose, string> = {
  'primary_residence': 'Primary Residence',
  'investment': 'Investment Property',
  'vacation_property': 'Vacation Home',
};

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '18-25': '18-25',
  '26-35': '26-35',
  '36-45': '36-45',
  '46-55': '46-55',
  '56+': '56+',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(profile: Partial<CoOwnershipProfile>): number {
  const fields = [
    // Financial Capacity (25% weight - 5 fields)
    { key: 'budget_min', weight: 5 },
    { key: 'budget_max', weight: 5 },
    { key: 'down_payment', weight: 5 },
    { key: 'annual_income', weight: 5 },
    { key: 'credit_score_range', weight: 5 },
    
    // Property Preferences (25% weight - 4 fields)
    { key: 'property_types', weight: 6.25, isArray: true },
    { key: 'preferred_locations', weight: 6.25, isArray: true },
    { key: 'min_bedrooms', weight: 6.25 },
    { key: 'purchase_timeline', weight: 6.25 },
    
    // Co-Ownership Preferences (25% weight - 3 fields)
    { key: 'ownership_split', weight: 8.33 },
    { key: 'living_arrangements', weight: 8.33, isArray: true },
    { key: 'co_ownership_purposes', weight: 8.34, isArray: true },
    
    // About You (25% weight - 3 fields)
    { key: 'age_range', weight: 8.33 },
    { key: 'occupation', weight: 8.33 },
    { key: 'why_co_ownership', weight: 8.34 },
  ];
  
  let totalWeight = 0;
  
  for (const field of fields) {
    const value = profile[field.key as keyof CoOwnershipProfile];
    
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) {
        totalWeight += field.weight;
      }
    } else {
      if (value !== null && value !== undefined && value !== '') {
        totalWeight += field.weight;
      }
    }
  }
  
  return Math.round(totalWeight);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert form data to database format
 */
export function formDataToProfile(formData: CoOwnershipProfileFormData): Partial<CoOwnershipProfile> {
  return {
    budget_min: formData.budget_min ? Number(formData.budget_min) : null,
    budget_max: formData.budget_max ? Number(formData.budget_max) : null,
    down_payment: formData.down_payment ? Number(formData.down_payment) : null,
    annual_income: formData.annual_income ? Number(formData.annual_income) : null,
    credit_score_range: formData.credit_score_range || null,
    property_types: formData.property_types,
    preferred_locations: formData.preferred_locations,
    min_bedrooms: formData.min_bedrooms,
    purchase_timeline: formData.purchase_timeline || null,
    ownership_split: formData.ownership_split || null,
    living_arrangements: formData.living_arrangements,
    co_ownership_purposes: formData.co_ownership_purposes,
    age_range: formData.age_range || null,
    occupation: formData.occupation || null,
    why_co_ownership: formData.why_co_ownership || null,
  };
}

/**
 * Convert database profile to form data
 */
export function profileToFormData(profile: CoOwnershipProfile): CoOwnershipProfileFormData {
  return {
    budget_min: profile.budget_min?.toString() || '',
    budget_max: profile.budget_max?.toString() || '',
    down_payment: profile.down_payment?.toString() || '',
    annual_income: profile.annual_income?.toString() || '',
    credit_score_range: profile.credit_score_range || '',
    property_types: profile.property_types || [],
    preferred_locations: profile.preferred_locations || [],
    min_bedrooms: profile.min_bedrooms,
    purchase_timeline: profile.purchase_timeline || '',
    ownership_split: profile.ownership_split || '',
    living_arrangements: profile.living_arrangements || [],
    co_ownership_purposes: profile.co_ownership_purposes || [],
    age_range: profile.age_range || '',
    occupation: profile.occupation || '',
    why_co_ownership: profile.why_co_ownership || '',
  };
}
