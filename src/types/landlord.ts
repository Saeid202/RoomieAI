/**
 * Landlord-related types and interfaces
 */

export interface LandlordContactInfo {
  contactUnit?: string;
  contactStreetNumber: string;
  contactStreetName: string;
  contactPoBox?: string;
  contactCityTown: string;
  contactProvince: string;
  contactPostalCode: string;
}

export interface LandlordProfile extends LandlordContactInfo {
  id: string;
  fullName: string;
  email: string;
  userType?: 'landlord' | 'realtor' | 'property_manager' | 'other';
  licenseNumber?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface LandlordVerification {
  id: string;
  userId: string;
  userType: 'landlord' | 'realtor' | 'property_manager' | 'other';
  licenseNumber?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  licenseDocumentUrl?: string;
  governmentIdUrl?: string;
  createdAt: string;
  updatedAt: string;
}
