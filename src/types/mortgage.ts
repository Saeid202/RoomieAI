export interface MortgageProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  age: number | null;
  phone_number: string | null;
  date_of_birth: string | null;
  first_time_buyer: boolean | null;
  buying_with_co_borrower: boolean | null;
  co_borrower_details: string | null;
  // Employment & Income
  employment_status: 'employed' | 'contractor' | 'self_employed' | null;
  employment_type: 'permanent' | 'part_time' | null;
  employer_name: string | null;
  client_names: string[] | null;
  industry: string | null;
  employment_duration: string | null;
  contracting_duration: string | null;
  business_name: string | null;
  business_duration: string | null;
  income_range: string | null;
  variable_income_types: string[] | null;
  // Assets & Down Payment
  intended_down_payment: string | null;
  funding_sources: string[] | null;
  funding_other_explanation: string | null;
  gift_provider_relationship: string | null;
  gift_amount_range: string | null;
  gift_letter_available: boolean | null;
  liquid_savings_balance: string | null;
  has_investments: string | null;
  investment_value_range: string | null;
  has_cryptocurrency: boolean | null;
  crypto_storage_type: string | null;
  crypto_exposure_level: string | null;
  funds_outside_canada: boolean | null;
  funds_country_region: string | null;
  // Credit & Debts
  credit_score_range: string | null;
  monthly_debt_payments: number | null;
  debt_credit_cards: number | null;
  debt_personal_loans: number | null;
  debt_auto_loans: number | null;
  debt_student_loans: number | null;
  debt_other: number | null;
  missed_payments_last_12_months: boolean | null;
  missed_payment_type: string | null;
  missed_payment_count: number | null;
  last_missed_payment_date: string | null;
  bankruptcy_proposal_history: boolean | null;
  bankruptcy_type: string | null;
  bankruptcy_filing_year: string | null;
  bankruptcy_discharge_date: string | null;
  credit_additional_notes: string | null;
  // Property Intent
  purchase_price_range: string | null;
  property_type: string | null;
  intended_use: string | null;
  target_location: string | null;
  timeline_to_buy: string | null;
  broker_consent: boolean | null;
  broker_consent_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MortgageProfileFormData {
  full_name?: string | null;
  email?: string | null;
  age?: number | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  first_time_buyer?: boolean | null;
  buying_with_co_borrower?: boolean | null;
  co_borrower_details?: string | null;
  // Employment & Income
  employment_status?: 'employed' | 'contractor' | 'self_employed' | null;
  employment_type?: 'permanent' | 'part_time' | null;
  employer_name?: string | null;
  client_names?: string[] | null;
  industry?: string | null;
  employment_duration?: string | null;
  contracting_duration?: string | null;
  business_name?: string | null;
  business_duration?: string | null;
  income_range?: string | null;
  variable_income_types?: string[] | null;
  // Assets & Down Payment
  intended_down_payment?: string | null;
  funding_sources?: string[] | null;
  funding_other_explanation?: string | null;
  gift_provider_relationship?: string | null;
  gift_amount_range?: string | null;
  gift_letter_available?: boolean | null;
  liquid_savings_balance?: string | null;
  has_investments?: string | null;
  investment_value_range?: string | null;
  has_cryptocurrency?: boolean | null;
  crypto_storage_type?: string | null;
  crypto_exposure_level?: string | null;
  funds_outside_canada?: boolean | null;
  funds_country_region?: string | null;
  // Credit & Debts
  credit_score_range?: string | null;
  monthly_debt_payments?: number | null;
  debt_credit_cards?: number | null;
  debt_personal_loans?: number | null;
  debt_auto_loans?: number | null;
  debt_student_loans?: number | null;
  debt_other?: number | null;
  missed_payments_last_12_months?: boolean | null;
  missed_payment_type?: string | null;
  missed_payment_count?: number | null;
  last_missed_payment_date?: string | null;
  bankruptcy_proposal_history?: boolean | null;
  bankruptcy_type?: string | null;
  bankruptcy_filing_year?: string | null;
  bankruptcy_discharge_date?: string | null;
  credit_additional_notes?: string | null;
  // Property Intent
  purchase_price_range?: string | null;
  property_type?: string | null;
  intended_use?: string | null;
  target_location?: string | null;
  timeline_to_buy?: string | null;
  broker_consent?: boolean | null;
}
