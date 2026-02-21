// =====================================================
// Property Categorization Types
// =====================================================
// Purpose: Type definitions for the new parent-child
//          property categorization system
// =====================================================

/**
 * Parent-level property categories
 */
export type PropertyCategory = 'Condo' | 'House' | 'Townhouse';

/**
 * Child-level configurations based on parent category
 */
export type CondoConfiguration = 
  | 'Studio'
  | '1-Bedroom'
  | '2-Bedroom'
  | '3-Bedroom+'
  | 'Penthouse';

export type HouseConfiguration = 
  | 'Detached'
  | 'Semi-Detached'
  | 'Bungalow'
  | 'Multi-Unit (Plex)';

export type TownhouseConfiguration = 
  | 'Freehold'
  | 'Condo-Town'
  | 'Stacked';

/**
 * Union type for all possible configurations
 */
export type PropertyConfiguration = 
  | CondoConfiguration 
  | HouseConfiguration 
  | TownhouseConfiguration;

/**
 * Property category hierarchy mapping
 */
export const PROPERTY_HIERARCHY: Record<PropertyCategory, PropertyConfiguration[]> = {
  Condo: ['Studio', '1-Bedroom', '2-Bedroom', '3-Bedroom+', 'Penthouse'],
  House: ['Detached', 'Semi-Detached', 'Bungalow', 'Multi-Unit (Plex)'],
  Townhouse: ['Freehold', 'Condo-Town', 'Stacked'],
};

/**
 * Helper function to get configurations for a category
 */
export function getConfigurationsForCategory(
  category: PropertyCategory | null | undefined
): PropertyConfiguration[] {
  if (!category) return [];
  return PROPERTY_HIERARCHY[category] || [];
}

/**
 * Helper function to validate category-configuration pair
 */
export function isValidCategoryConfiguration(
  category: PropertyCategory,
  configuration: PropertyConfiguration
): boolean {
  return PROPERTY_HIERARCHY[category]?.includes(configuration) || false;
}

// =====================================================
// Property Document Types
// =====================================================

/**
 * Document types for property listings
 * IMPORTANT: These must match the database constraint in property_documents table
 */
export type PropertyDocumentType =
  | 'title_deed'
  | 'property_tax_bill'
  | 'disclosures'
  | 'status_certificate'
  | 'condo_bylaws'
  | 'reserve_fund_study'
  | 'building_inspection'
  | 'appraisal_report'
  | 'survey_plan'
  | 'zoning_documents'
  | 'rental_income_statement'
  | 'tenant_lease_agreements'
  | 'maintenance_records'
  | 'utility_bills'
  | 'insurance_policy'
  | 'hoa_documents'
  | 'environmental_reports'
  | 'permits_licenses'
  | 'floor_plans'
  | 'other';

/**
 * Document metadata
 */
export interface PropertyDocument {
  id: string;
  property_id: string;
  document_type: PropertyDocumentType;
  document_label: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  is_public: boolean;
  uploaded_by?: string;
  uploaded_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Document access request
 */
export interface DocumentAccessRequest {
  id: string;
  property_id: string;
  requester_id: string;
  requester_email?: string;
  requester_name?: string;
  request_message?: string;
  status: 'pending' | 'approved' | 'denied';
  response_message?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  requested_at: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Document slot configuration for UI
 */
export interface DocumentSlot {
  type: PropertyDocumentType;
  label: string;
  description: string;
  weight: number; // Contribution to listing strength (0-100)
  isCommon: boolean; // True if shown for all categories
  categories?: PropertyCategory[]; // If not common, which categories show this
  icon?: string; // Icon name for UI
}

/**
 * Document slots configuration
 */
export const DOCUMENT_SLOTS: DocumentSlot[] = [
  // Common documents (shown for all)
  {
    type: 'title_deed',
    label: 'Title Deed',
    description: 'Proof of Ownership',
    weight: 20,
    isCommon: true,
    icon: 'FileText',
  },
  {
    type: 'property_tax_bill',
    label: 'Property Tax Bill',
    description: 'Recent Tax Assessment',
    weight: 15,
    isCommon: true,
    icon: 'Receipt',
  },
  {
    type: 'disclosures',
    label: 'Disclosures',
    description: 'Seller Disclosure Forms',
    weight: 15,
    isCommon: true,
    icon: 'FileWarning',
  },
  
  // Condo-specific documents
  {
    type: 'status_certificate',
    label: 'Status Certificate',
    description: 'Condo Corporation Status',
    weight: 20,
    isCommon: false,
    categories: ['Condo', 'Townhouse'],
    icon: 'Building',
  },
  {
    type: 'condo_bylaws',
    label: 'Condo Bylaws',
    description: 'Rules and Regulations',
    weight: 10,
    isCommon: false,
    categories: ['Condo', 'Townhouse'],
    icon: 'Scale',
  },
  
  // House-specific documents
  {
    type: 'survey_plan',
    label: 'Land Survey',
    description: 'Property Boundaries',
    weight: 15,
    isCommon: false,
    categories: ['House', 'Townhouse'],
    icon: 'Map',
  },
  {
    type: 'building_inspection',
    label: 'Home Inspection Report',
    description: 'Professional Inspection',
    weight: 20,
    isCommon: false,
    categories: ['House', 'Townhouse'],
    icon: 'ClipboardCheck',
  },
];

/**
 * Get document slots for a specific category
 */
export function getDocumentSlotsForCategory(
  category: PropertyCategory | null | undefined
): DocumentSlot[] {
  if (!category) {
    return DOCUMENT_SLOTS.filter(slot => slot.isCommon);
  }
  
  return DOCUMENT_SLOTS.filter(
    slot => slot.isCommon || slot.categories?.includes(category)
  );
}

/**
 * Calculate listing strength based on uploaded documents
 */
export function calculateListingStrength(
  documents: PropertyDocument[],
  category: PropertyCategory | null | undefined
): number {
  const relevantSlots = getDocumentSlotsForCategory(category);
  const activeDocuments = documents.filter(doc => !doc.deleted_at);
  
  let strength = 0;
  
  // Base score for having any documents
  if (activeDocuments.length > 0) {
    strength += 10;
  }
  
  // Add weight for each uploaded document type
  relevantSlots.forEach(slot => {
    const hasDocument = activeDocuments.some(
      doc => doc.document_type === slot.type
    );
    if (hasDocument) {
      strength += slot.weight;
    }
  });
  
  // Cap at 100
  return Math.min(strength, 100);
}

/**
 * Get listing strength color and label
 */
export function getListingStrengthInfo(score: number): {
  color: string;
  label: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      color: 'text-green-600',
      label: 'Excellent',
      bgColor: 'bg-green-100',
    };
  } else if (score >= 60) {
    return {
      color: 'text-blue-600',
      label: 'Good',
      bgColor: 'bg-blue-100',
    };
  } else if (score >= 40) {
    return {
      color: 'text-yellow-600',
      label: 'Fair',
      bgColor: 'bg-yellow-100',
    };
  } else if (score >= 20) {
    return {
      color: 'text-orange-600',
      label: 'Basic',
      bgColor: 'bg-orange-100',
    };
  } else {
    return {
      color: 'text-slate-600',
      label: 'Minimal',
      bgColor: 'bg-slate-100',
    };
  }
}

/**
 * Format property type display string
 */
export function formatPropertyType(
  category: PropertyCategory | null | undefined,
  configuration: PropertyConfiguration | null | undefined
): string {
  if (!category) return 'Not specified';
  if (!configuration) return category;
  return `${category} - ${configuration}`;
}
