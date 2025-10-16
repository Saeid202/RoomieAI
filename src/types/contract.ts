// Contract Status Enum
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_TENANT = 'pending_tenant',
  PENDING_LANDLORD = 'pending_landlord',
  FULLY_EXECUTED = 'fully_executed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Signature Data Interface
export interface SignatureData {
  signature: string; // Base64 signature image
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  fullName: string;
  email: string;
}

// Contract Creation Data
export interface ContractData {
  propertyId: string;
  tenantId: string;
  landlordId: string;
  monthlyRent: number;
  securityDeposit?: number;
  leaseStartDate: string;
  leaseEndDate: string;
  contractTerms: string;
  specialTerms?: string;
  utilitiesIncluded?: string[];
  petPolicy?: string;
  smokingAllowed?: boolean;
  expiresAt?: string; // When contract expires if not signed
}

// Full Contract Interface
export interface RentalContract {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  
  // Contract content
  contractTerms: string;
  monthlyRent: number;
  securityDeposit?: number;
  leaseStartDate: string;
  leaseEndDate: string;
  
  // Signing status
  status: ContractStatus;
  
  // Tenant signature
  tenantSignedAt?: string;
  tenantSignatureData?: SignatureData;
  tenantIpAddress?: string;
  
  // Landlord signature
  landlordSignedAt?: string;
  landlordSignatureData?: SignatureData;
  landlordIpAddress?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  
  // Contract document
  contractPdfUrl?: string;
  
  // Additional terms
  specialTerms?: string;
  utilitiesIncluded?: string[];
  petPolicy?: string;
  smokingAllowed?: boolean;
  
  // Related data (populated via joins)
  property?: {
    id: string;
    listingTitle: string;
    address: string;
    city: string;
    state: string;
  };
  tenant?: {
    id: string;
    email: string;
    fullName?: string;
  };
  landlord?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

// Contract Update Data
export interface ContractUpdateData {
  status?: ContractStatus;
  tenantSignedAt?: string;
  tenantSignatureData?: SignatureData;
  tenantIpAddress?: string;
  landlordSignedAt?: string;
  landlordSignatureData?: SignatureData;
  landlordIpAddress?: string;
  contractPdfUrl?: string;
}

// API Response Types
export interface ContractResponse {
  contract: RentalContract;
  success: boolean;
  message?: string;
}

export interface ContractsListResponse {
  contracts: RentalContract[];
  success: boolean;
  message?: string;
  totalCount?: number;
}

// Contract Signing Request
export interface SignContractRequest {
  contractId: string;
  signature: SignatureData;
  userType: 'tenant' | 'landlord';
  agreedToTerms: boolean;
}

// Contract Creation Request
export interface CreateContractRequest extends ContractData {
  // Additional validation or processing fields if needed
}

// Contract Status Update Request
export interface UpdateContractStatusRequest {
  contractId: string;
  status: ContractStatus;
  reason?: string; // For rejections
}

// PDF Generation Request
export interface GeneratePDFRequest {
  contractId: string;
  includeSignatures: boolean;
}

// Contract Template Data
export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Types for Contract Events
export interface ContractNotification {
  contractId: string;
  recipientId: string;
  type: 'signature_required' | 'contract_signed' | 'contract_completed' | 'contract_expired';
  message: string;
  createdAt: string;
}

// Form Validation Types
export interface ContractFormErrors {
  monthlyRent?: string;
  securityDeposit?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  contractTerms?: string;
  signature?: string;
  agreement?: string;
}

// Contract Analytics/Statistics
export interface ContractStats {
  totalContracts: number;
  pendingContracts: number;
  executedContracts: number;
  expiredContracts: number;
  averageSigningTime: number; // in hours
}

export default RentalContract;