export interface ContractorPublicProfile {
  id: string;
  user_id: string;
  company: string;
  name: string;
  location: string;
  description: string | null;
  slug: string;
  cover_images: string[];
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  is_published: boolean;
  verified: boolean;
  tagline: string | null;
  nav_links: NavLink[] | null;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ContractorService {
  id: string;
  contractor_id: string;
  service_name: string;
  description: string | null;
  icon_name: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ContractorProject {
  id: string;
  contractor_id: string;
  title: string;
  description: string | null;
  images: string[];
  service_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface ContractorReview {
  id: string;
  contractor_id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ContractorLead {
  id: string;
  contractor_id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source_slug: string | null;
  read: boolean;
  created_at: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ReviewFormData {
  reviewer_name: string;
  rating: number;
  comment: string;
}
