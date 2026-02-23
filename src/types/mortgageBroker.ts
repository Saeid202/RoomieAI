export interface MortgageBrokerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  company_name: string | null;
  license_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface MortgageBrokerFormData {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  company_name?: string | null;
  license_number?: string | null;
}
