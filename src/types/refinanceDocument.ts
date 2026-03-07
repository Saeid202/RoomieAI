// Refinance Document Types

export type RefinanceDocumentCategory =
  | 'identity'
  | 'income'
  | 'self_employed'
  | 'property'
  | 'assets'
  | 'debt';

export type RefinanceDocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'verified'
  | 'rejected';

export interface RefinanceDocument {
  id: string;
  user_id: string;
  mortgage_profile_id: string;
  document_category: RefinanceDocumentCategory;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_status: RefinanceDocumentStatus;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  notes?: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTypeConfig {
  type: string;
  label: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number; // in bytes
  description?: string;
}

export interface DocumentCategoryConfig {
  category: RefinanceDocumentCategory;
  label: string;
  icon: string;
  documentTypes: DocumentTypeConfig[];
}

// Document type definitions by category
export const REFINANCE_DOCUMENT_TYPES: Record<RefinanceDocumentCategory, DocumentTypeConfig[]> = {
  identity: [
    {
      type: 'government_id',
      label: 'Government-Issued Photo ID',
      required: true,
      acceptedFormats: ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Valid government-issued photo identification'
    }
  ],
  income: [
    {
      type: 'employment_letter',
      label: 'Employment Letter',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Letter from employer confirming employment'
    },
    {
      type: 'pay_stubs',
      label: 'Recent Pay Stubs',
      required: true,
      acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSize: 10 * 1024 * 1024,
      description: 'Most recent pay stubs'
    },
    {
      type: 't4_slips',
      label: 'T4 Slips (Last 2 Years)',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'T4 slips for the last 2 years'
    },
    {
      type: 'noa',
      label: 'Notice of Assessment – CRA (Last 2 Years)',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'CRA Notice of Assessment for last 2 years'
    }
  ],
  self_employed: [
    {
      type: 'personal_tax_returns',
      label: 'Personal Tax Returns (Last 2 Years)',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Personal tax returns for the last 2 years'
    },
    {
      type: 'business_financial_statements',
      label: 'Business Financial Statements',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Recent business financial statements'
    },
    {
      type: 'business_license',
      label: 'Business License or Incorporation Documents',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Business license or incorporation documents'
    }
  ],
  property: [
    {
      type: 'current_mortgage_statement',
      label: 'Current Mortgage Statement',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Most recent mortgage statement'
    },
    {
      type: 'property_tax_bill',
      label: 'Property Tax Bill',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current property tax bill'
    },
    {
      type: 'property_insurance',
      label: 'Property Insurance Policy',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current property insurance policy'
    },
    {
      type: 'purchase_agreement',
      label: 'Purchase Agreement (if available)',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Original purchase agreement if available'
    }
  ],
  assets: [
    {
      type: 'bank_statements',
      label: 'Bank Statements (Last 3 Months)',
      required: true,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Last 3 months of bank statements'
    }
  ],
  debt: [
    {
      type: 'credit_card_statements',
      label: 'Credit Card Statements',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Recent credit card statements'
    },
    {
      type: 'car_loan_statement',
      label: 'Car Loan Statement',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current car loan statement if applicable'
    },
    {
      type: 'personal_loan_statement',
      label: 'Personal Loan Statement',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current personal loan statement if applicable'
    },
    {
      type: 'line_of_credit_statement',
      label: 'Line of Credit Statement',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current line of credit statement if applicable'
    },
    {
      type: 'student_loan_statement',
      label: 'Student Loan Statement',
      required: false,
      acceptedFormats: ['application/pdf'],
      maxSize: 10 * 1024 * 1024,
      description: 'Current student loan statement if applicable'
    }
  ]
};

// Category configurations
export const REFINANCE_DOCUMENT_CATEGORIES: DocumentCategoryConfig[] = [
  {
    category: 'identity',
    label: 'Identity',
    icon: '🆔',
    documentTypes: REFINANCE_DOCUMENT_TYPES.identity
  },
  {
    category: 'income',
    label: 'Income Verification',
    icon: '💰',
    documentTypes: REFINANCE_DOCUMENT_TYPES.income
  },
  {
    category: 'self_employed',
    label: 'Self-Employed (if applicable)',
    icon: '💼',
    documentTypes: REFINANCE_DOCUMENT_TYPES.self_employed
  },
  {
    category: 'property',
    label: 'Property Documents',
    icon: '🏠',
    documentTypes: REFINANCE_DOCUMENT_TYPES.property
  },
  {
    category: 'assets',
    label: 'Financial / Assets',
    icon: '🏦',
    documentTypes: REFINANCE_DOCUMENT_TYPES.assets
  },
  {
    category: 'debt',
    label: 'Debt Statements',
    icon: '📊',
    documentTypes: REFINANCE_DOCUMENT_TYPES.debt
  }
];

export interface DocumentUploadProgress {
  documentType: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface DocumentCompletionStats {
  totalRequired: number;
  uploadedRequired: number;
  totalOptional: number;
  uploadedOptional: number;
  completionPercentage: number;
}
