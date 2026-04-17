// Mortgage Document Types

export type MortgageDocumentCategory =
  | 'identity'
  | 'income'
  | 'employment'
  | 'assets'
  | 'credit'
  | 'property'
  | 'additional';

export type MortgageDocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'processing'
  | 'verified'
  | 'rejected';

export interface MortgageDocument {
  id: string;
  mortgage_profile_id: string;
  user_id: string;
  document_category: MortgageDocumentCategory;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_status: MortgageDocumentStatus;
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
  category: MortgageDocumentCategory;
  label: string;
  icon: string;
  documentTypes: DocumentTypeConfig[];
}

// Document type definitions by category
export const DOCUMENT_TYPES: Record<MortgageDocumentCategory, DocumentTypeConfig[]> = {
  identity: [
    {
      type: 'drivers_license',
      label: "Driver's License",
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf'
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Front and back of your driver\'s license'
    },
    {
      type: 'passport',
      label: 'Passport',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Photo page of your passport'
    }
  ],
  income: [
    {
      type: 'pay_stub',
      label: 'Pay Stubs (Recent 2 months)',
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Most recent 2 months of pay stubs'
    },
    {
      type: 't4',
      label: 'T4 Slips (Last 2 years)',
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'T4 slips from the last 2 tax years'
    },
    {
      type: 'noa',
      label: 'Notice of Assessment (Last 2 years)',
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'CRA Notice of Assessment for last 2 years'
    }
  ],
  employment: [
    {
      type: 'employment_letter',
      label: 'Employment Letter',
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Letter from employer confirming employment'
    }
  ],
  assets: [
    {
      type: 'bank_statement',
      label: 'Bank Statements (Last 3 months)',
      required: true,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Last 3 months of bank statements'
    },
    {
      type: 'investment_statement',
      label: 'Investment Statements',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Recent investment account statements'
    }
  ],
  credit: [
    {
      type: 'credit_report',
      label: 'Credit Report',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Recent credit report from Equifax or TransUnion'
    }
  ],
  property: [
    {
      type: 'purchase_agreement',
      label: 'Purchase Agreement',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Signed purchase agreement for the property'
    },
    {
      type: 'property_listing',
      label: 'Property Listing',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Property listing or details'
    }
  ],
  additional: [
    {
      type: 'other',
      label: 'Other Documents',
      required: false,
      acceptedFormats: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
        'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv', 'application/rtf'
      ],
      maxSize: 10 * 1024 * 1024,
      description: 'Any additional supporting documents'
    }
  ]
};

// Category configurations
export const DOCUMENT_CATEGORIES: DocumentCategoryConfig[] = [
  {
    category: 'identity',
    label: 'Identity Documents',
    icon: '🆔',
    documentTypes: DOCUMENT_TYPES.identity
  },
  {
    category: 'income',
    label: 'Income Verification',
    icon: '💰',
    documentTypes: DOCUMENT_TYPES.income
  },
  {
    category: 'employment',
    label: 'Employment Verification',
    icon: '💼',
    documentTypes: DOCUMENT_TYPES.employment
  },
  {
    category: 'assets',
    label: 'Asset Documents',
    icon: '🏦',
    documentTypes: DOCUMENT_TYPES.assets
  },
  {
    category: 'credit',
    label: 'Credit Documents',
    icon: '📊',
    documentTypes: DOCUMENT_TYPES.credit
  },
  {
    category: 'property',
    label: 'Property Documents',
    icon: '🏠',
    documentTypes: DOCUMENT_TYPES.property
  },
  {
    category: 'additional',
    label: 'Additional Documents',
    icon: '📄',
    documentTypes: DOCUMENT_TYPES.additional
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
