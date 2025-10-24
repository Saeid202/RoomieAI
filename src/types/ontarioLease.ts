export interface OntarioLeaseFormData {
  // Section 1: Parties to the Agreement
  landlordLegalName: string;
  tenantLastName: string;
  tenantFirstName: string;
  
  // Section 2: Rental Unit
  unitNumber?: string;
  streetNumber: string;
  streetName: string;
  cityTown: string;
  province: string; // Should be "Ontario"
  postalCode: string;
  parkingSpaces?: number;
  parkingDescription?: string;
  isCondominium: boolean;
  
  // Section 3: Contact Information
  landlordNoticeUnit?: string;
  landlordNoticeStreetNumber: string;
  landlordNoticeStreetName: string;
  landlordNoticePOBox?: string;
  landlordNoticeCityTown: string;
  landlordNoticeProvince: string;
  landlordNoticePostalCode: string;
  emailConsent: boolean;
  landlordEmail?: string;
  tenantEmail?: string;
  emergencyContactProvided: boolean;
  emergencyPhone?: string;
  emergencyEmail?: string;
  
  // Section 4: Term of Tenancy Agreement
  tenancyStartDate: Date;
  tenancyType: 'fixed' | 'monthly' | 'other' | 'periodic';
  tenancyEndDate?: Date;
  otherTenancyType?: string;
  startDate?: string;
  endDate?: string;
  periodicType?: string;
  
  // Section 5: Rent
  rentPaymentDay: string;
  rentPaymentPeriod: 'monthly' | 'other';
  otherRentPaymentPeriod?: string;
  baseRent: number;
  parkingRent?: number;
  otherServicesRent?: number;
  otherServicesDescription?: string;
  totalRent: number;
  rentPayableTo: string;
  rentPaymentMethods: string;
  partialRentAmount?: number;
  rentAmount?: number;
  rentDueDate?: string;
  paymentMethod?: string;
  partialRentDate?: Date;
  partialRentStartDate?: Date;
  partialRentEndDate?: Date;
  nsfCharge: number;
  nsfAdministrationCharge?: number;
  
  // Section 6: Services and Utilities
  gasIncluded: boolean;
  airConditioningIncluded: boolean;
  additionalStorageIncluded: boolean;
  onSiteLaundry: 'no_charge' | 'pay_per_use' | 'not_included';
  guestParking: 'no_charge' | 'pay_per_use' | 'not_included';
  gas?: boolean;
  airConditioning?: boolean;
  additionalStorage?: boolean;
  laundry?: string;
  otherServices1?: string;
  otherServices1Included?: boolean;
  otherServices2?: string;
  otherServices2Included?: boolean;
  otherServices3?: string;
  otherServices3Included?: boolean;
  servicesDetails?: string;
  electricityResponsibility: 'landlord' | 'tenant';
  heatResponsibility: 'landlord' | 'tenant';
  waterResponsibility: 'landlord' | 'tenant';
  utilitiesDetails?: string;
  electricity?: string;
  heat?: string;
  water?: string;
  
  // Section 7: Rent Discounts
  rentDiscount: boolean;
  rentDiscountDetails?: string;
  
  // Section 8: Rent Deposit
  rentDepositRequired: boolean;
  rentDepositAmount?: number;
  rentDeposit?: boolean;
  
  // Section 9: Key Deposit
  keyDepositRequired: boolean;
  keyDepositAmount?: number;
  keyDepositDescription?: string;
  keyDeposit?: boolean;
  
  // Section 10: Smoking
  smokingRules?: boolean;
  smokingRulesDetails?: string;
  
  // Section 11: Tenant's Insurance
  tenantInsuranceRequired: boolean;
  insuranceRequirements?: boolean;
  insurancePageReference?: string;
  
  // Section 15: Additional Terms
  additionalTerms: boolean;
  additionalTermsDetails?: string;
  
  // Legal
  electronicSignatureConsent: boolean;
  termsAcceptance: boolean;
  
  // Section 17: Signatures
  // Landlord signatures
  landlord1Name?: string;
  landlord1Signature?: string;
  landlord1Date?: string;
  landlord2Name?: string;
  landlord2Signature?: string;
  landlord2Date?: string;
  landlord3Name?: string;
  landlord3Signature?: string;
  landlord3Date?: string;
  landlord4Name?: string;
  landlord4Signature?: string;
  landlord4Date?: string;
  
  // Tenant signatures
  tenant1Name?: string;
  tenant1Signature?: string;
  tenant1Date?: string;
  tenant2Name?: string;
  tenant2Signature?: string;
  tenant2Date?: string;
  tenant3Name?: string;
  tenant3Signature?: string;
  tenant3Date?: string;
  tenant4Name?: string;
  tenant4Signature?: string;
  tenant4Date?: string;
  
  // Agreement checkboxes
  landlordAgreement?: boolean;
  tenantAgreement?: boolean;
}

export interface OntarioLeaseContract {
  id: string;
  application_id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  
  // Form Data
  ontario_form_data: OntarioLeaseFormData | null;
  form_version: string;
  
  // Contract Terms
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  last_month_rent_deposit: number;
  key_deposit: number;
  lease_duration_months: number;
  
  // Property Information (cached)
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string;
  property_type: string;
  property_type_other?: string;
  property_bedrooms?: number;
  property_bathrooms?: number;
  property_square_footage?: number;
  parking_spaces?: number;
  
  // Party Information (cached)
  landlord_name: string;
  landlord_email: string;
  landlord_phone?: string;
  landlord_address?: string;
  landlord_city?: string;
  landlord_province?: string;
  landlord_postal_code?: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone?: string;
  tenant_address?: string;
  tenant_city?: string;
  tenant_province?: string;
  tenant_postal_code?: string;
  
  // Lease Terms
  pet_policy?: string;
  smoking_policy?: string;
  utilities_included?: string[];
  utilities_not_included?: string[];
  special_conditions?: string;
  maintenance_contact?: string;
  emergency_contact?: string;
  
  // Contract Status
  status: 'draft' | 'pending_landlord_signature' | 'pending_tenant_signature' | 'fully_signed' | 'executed' | 'cancelled';
  
  // Digital Signatures
  landlord_signature?: {
    signature_data: string;
    signed_at: string;
    ip_address: string;
    user_agent?: string;
  };
  tenant_signature?: {
    signature_data: string;
    signed_at: string;
    ip_address: string;
    user_agent?: string;
  };
  
  // Metadata
  contract_template_version: string;
  generated_by?: string;
  electronic_signature_consent: boolean;
  terms_acceptance_landlord: boolean;
  terms_acceptance_tenant: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface SignatureData {
  signature_data: string; // base64 encoded signature image
  ip_address: string;
  user_agent?: string;
}
