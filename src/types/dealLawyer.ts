// =====================================================
// Deal Lawyer Types
// =====================================================
// Purpose: Type definitions for lawyer document room access
// =====================================================

export interface DealLawyer {
  id: string;
  deal_id: string;
  lawyer_id: string;
  buyer_id: string;
  role: 'buyer_lawyer';
  status: 'active' | 'removed';
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface LawyerNotification {
  id: string;
  lawyer_id: string;
  deal_id: string;
  buyer_id: string;
  type: 'document_review_request';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignedDeal {
  deal_id: string;
  buyer_id: string;
  assigned_at: string;
  status: string;
  property?: {
    address: string;
    city: string;
    province: string;
    document_count?: number;
  };
  buyer?: {
    full_name: string;
    email: string;
  };
}

export interface PlatformLawyer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  law_firm_name: string;
  bar_association_number?: string;
  practice_areas?: string[];
  years_of_experience?: number;
  bio?: string;
  city?: string;
  province?: string;
}

