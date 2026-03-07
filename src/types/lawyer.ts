export interface LawyerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  law_firm_name: string | null;
  bar_association_number: string | null;
  practice_areas: string[] | null;
  years_of_experience: number | null;
  hourly_rate: number | null;
  consultation_fee: number | null;
  bio: string | null;
  city: string | null;
  province: string | null;
  is_accepting_clients: boolean;
  created_at: string;
  updated_at: string;
}

export interface LawyerFormData {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  law_firm_name?: string | null;
  bar_association_number?: string | null;
  practice_areas?: string[] | null;
  years_of_experience?: number | null;
  hourly_rate?: number | null;
  consultation_fee?: number | null;
  bio?: string | null;
  city?: string | null;
  province?: string | null;
  is_accepting_clients?: boolean;
}

export const PRACTICE_AREAS = [
  'Landlord-Tenant Law',
  'Real Estate Law',
  'Property Disputes',
  'Lease Agreements',
  'Eviction Proceedings',
  'Housing Rights',
  'Property Transactions',
  'Mortgage Law',
  'Zoning & Land Use'
] as const;

export const PROVINCES = [
  'Ontario',
  'Quebec',
  'British Columbia',
  'Alberta',
  'Manitoba',
  'Saskatchewan',
  'Nova Scotia',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Prince Edward Island',
  'Northwest Territories',
  'Yukon',
  'Nunavut'
] as const;

export interface LawyerClientRelationship {
  id: string;
  lawyer_id: string;
  client_id: string;
  case_type: string;
  case_description: string | null;
  status: string;
  consultation_date: string | null;
  retainer_paid: boolean;
  retainer_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    email: string;
    full_name: string | null;
  };
}

export interface LawyerClientFormData {
  client_id: string;
  case_type: string;
  case_description?: string;
  status?: string;
  consultation_date?: string;
  retainer_paid?: boolean;
  retainer_amount?: number;
  notes?: string;
}

export const CASE_TYPES = [
  'Landlord-Tenant Dispute',
  'Lease Review',
  'Eviction Proceedings',
  'Property Purchase',
  'Property Sale',
  'Mortgage Issues',
  'Property Dispute',
  'Zoning Issues',
  'Other'
] as const;

export const CASE_STATUS = [
  'pending',
  'active',
  'on_hold',
  'completed',
  'cancelled'
] as const;
