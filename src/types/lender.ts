export type LoanType = 
  | 'conventional' 
  | 'fha' 
  | 'va' 
  | 'usda' 
  | 'jumbo' 
  | 'refinance' 
  | 'home_equity'
  | 'construction';

export interface LenderProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  website_url: string | null;
  license_number: string | null;
  license_state: string | null;
  nmls_id: string | null;
  company_address: string | null;
  company_city: string | null;
  company_province: string | null;
  company_postal_code: string | null;
  company_description: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LenderRate {
  id: string;
  lender_id: string;
  loan_type: LoanType;
  term_years: number;
  interest_rate: number;
  apr: number | null;
  points: number;
  min_loan_amount: number | null;
  max_loan_amount: number | null;
  min_credit_score: number | null;
  is_active: boolean;
  effective_date: string;
  expiration_date: string | null;
  notes: string | null;
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface LenderRateHistory {
  id: string;
  lender_id: string;
  rate_id: string | null;
  loan_type: LoanType;
  term_years: number;
  old_rate: number | null;
  new_rate: number | null;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

export interface CreateLenderProfileInput {
  company_name: string;
  company_logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  license_number?: string;
  license_state?: string;
  nmls_id?: string;
  company_address?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;
  company_description?: string;
}

export interface UpdateLenderProfileInput extends Partial<CreateLenderProfileInput> {
  is_active?: boolean;
}

export interface CreateLenderRateInput {
  lender_id: string;
  loan_type: LoanType;
  term_years: number;
  interest_rate: number;
  apr?: number;
  points?: number;
  min_loan_amount?: number;
  max_loan_amount?: number;
  min_credit_score?: number;
  effective_date?: string;
  expiration_date?: string;
  notes?: string;
  terms_and_conditions?: string;
}

export interface UpdateLenderRateInput extends Partial<CreateLenderRateInput> {
  is_active?: boolean;
}

export interface LenderWithRates extends LenderProfile {
  rates: LenderRate[];
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  conventional: 'Conventional',
  fha: 'FHA',
  va: 'VA',
  usda: 'USDA',
  jumbo: 'Jumbo',
  refinance: 'Refinance',
  home_equity: 'Home Equity',
  construction: 'Construction',
};

export const TERM_YEARS_OPTIONS = [5, 7, 10, 15, 20, 25, 30];