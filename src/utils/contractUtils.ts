import { contractService } from '@/services/contractService';
import { ContractData, ContractStatus } from '@/types/contract';
import { RentalApplication } from '@/services/rentalApplicationService';
import { Property } from '@/services/propertyService';

/**
 * Create a rental contract from an approved rental application
 */
export async function createContractFromApplication(
  application: RentalApplication,
  property: Property
): Promise<{ success: boolean; contractId?: string; message?: string }> {
  try {
    // Generate contract terms based on the application and property
    const contractTerms = generateContractTerms(application, property);
    
    // Calculate lease dates
    const leaseStartDate = application.move_in_date || new Date().toISOString().split('T')[0];
    const leaseEndDate = calculateLeaseEndDate(leaseStartDate, application.lease_duration || '12');
    
    // Create contract data
    const contractData: ContractData = {
      propertyId: property.id,
      tenantId: application.applicant_id,
      landlordId: property.user_id,
      monthlyRent: property.monthly_rent,
      securityDeposit: property.security_deposit || property.monthly_rent,
      leaseStartDate,
      leaseEndDate,
      contractTerms,
      specialTerms: generateSpecialTerms(application, property),
      utilitiesIncluded: property.utilities_included || [],
      petPolicy: property.pet_policy || (application.pet_ownership ? 'Pets allowed with approval' : 'No pets allowed'),
      smokingAllowed: application.smoking_status === 'smoker',
      expiresAt: calculateContractExpiration()
    };

    // Create the contract
    const response = await contractService.createContract(contractData);
    
    if (response.success && response.contract) {
      return {
        success: true,
        contractId: response.contract.id,
        message: 'Contract created successfully'
      };
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create contract'
      };
    }
  } catch (error) {
    console.error('Error creating contract from application:', error);
    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Generate standard contract terms
 */
function generateContractTerms(application: RentalApplication, property: Property): string {
  return `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into between the Landlord and Tenant for the rental of the property located at ${property.address}, ${property.city}, ${property.state} ${property.zip_code} ("Property").

TERMS AND CONDITIONS:

1. LEASE TERM
   - Lease Start Date: ${application.move_in_date || 'To be determined'}
   - Lease Duration: ${application.lease_duration || '12'} months
   - Property Type: ${property.property_type}

2. RENT AND FEES
   - Monthly Rent: $${property.monthly_rent.toLocaleString()}
   - Security Deposit: $${(property.security_deposit || property.monthly_rent).toLocaleString()}
   - Rent due on the 1st of each month

3. PROPERTY DETAILS
   - Bedrooms: ${property.bedrooms || 'N/A'}
   - Bathrooms: ${property.bathrooms || 'N/A'}
   - Square Footage: ${property.square_footage ? property.square_footage + ' sq ft' : 'N/A'}

4. TENANT INFORMATION
   - Name: ${application.full_name}
   - Email: ${application.email}
   - Phone: ${application.phone}
   - Occupation: ${application.occupation}
   - Monthly Income: $${application.monthly_income.toLocaleString()}

5. UTILITIES AND SERVICES
   ${property.utilities_included && property.utilities_included.length > 0 
     ? `- Included utilities: ${property.utilities_included.join(', ')}`
     : '- Tenant responsible for all utilities'}

6. PROPERTY RULES
   - Pet Policy: ${property.pet_policy || (application.pet_ownership ? 'Pets allowed with approval' : 'No pets allowed')}
   - Smoking Policy: ${application.smoking_status === 'smoker' ? 'Smoking permitted in designated areas' : 'No smoking allowed'}

7. EMERGENCY CONTACT
   ${application.emergency_contact_name ? `- Name: ${application.emergency_contact_name}` : ''}
   ${application.emergency_contact_phone ? `- Phone: ${application.emergency_contact_phone}` : ''}
   ${application.emergency_contact_relation ? `- Relationship: ${application.emergency_contact_relation}` : ''}

8. GENERAL TERMS
   - The Tenant agrees to use the Property solely as a private residence
   - The Tenant shall maintain the Property in good condition
   - No alterations to the Property without written consent
   - Landlord shall provide habitable conditions as required by law
   - This Agreement shall be binding upon both parties and their successors

9. ADDITIONAL INFORMATION
   ${application.additional_info || 'None provided'}

By signing below, both parties agree to the terms and conditions set forth in this Agreement.`;
}

/**
 * Generate special terms based on application details
 */
function generateSpecialTerms(application: RentalApplication, property: Property): string {
  const specialTerms = [];

  // Add employment verification clause
  if (application.employer) {
    specialTerms.push(`Employment Verification: Tenant is employed at ${application.employer}.`);
  }

  // Add pet-specific terms
  if (application.pet_ownership) {
    specialTerms.push('Pet Terms: Tenant has disclosed pet ownership and agrees to additional pet deposit and monthly pet fee if applicable.');
  }

  // Add property-specific amenities
  if (property.amenities && property.amenities.length > 0) {
    specialTerms.push(`Property Amenities: ${property.amenities.join(', ')}.`);
  }

  // Add parking information
  if (property.parking) {
    specialTerms.push(`Parking: ${property.parking}.`);
  }

  // Add neighborhood information
  if (property.neighborhood) {
    specialTerms.push(`Neighborhood: Property is located in ${property.neighborhood}.`);
  }

  return specialTerms.length > 0 ? specialTerms.join('\n\n') : '';
}

/**
 * Calculate lease end date based on start date and duration
 */
function calculateLeaseEndDate(startDate: string, duration: string): string {
  const start = new Date(startDate);
  const months = parseInt(duration) || 12;
  const endDate = new Date(start.setMonth(start.getMonth() + months));
  return endDate.toISOString().split('T')[0];
}

/**
 * Calculate contract expiration date (7 days from now)
 */
function calculateContractExpiration(): string {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 7);
  return expiration.toISOString();
}

/**
 * Get contract creation status message for different scenarios
 */
export function getContractStatusMessage(applicationStatus: string): string {
  switch (applicationStatus) {
    case 'approved':
      return 'Your application has been approved! A rental contract has been created and is ready for your signature.';
    case 'pending':
      return 'Your application is under review. A contract will be created once it\'s approved.';
    case 'under_review':
      return 'Your application is being reviewed by the landlord. You\'ll be notified when a decision is made.';
    case 'rejected':
      return 'Unfortunately, your application was not approved. You may apply for other properties.';
    case 'withdrawn':
      return 'Your application has been withdrawn.';
    default:
      return 'Application status unknown.';
  }
}

/**
 * Check if a contract should be created for an application
 */
export function shouldCreateContract(application: RentalApplication): boolean {
  return application.status === 'approved' && !application.contract_signed;
}

export default {
  createContractFromApplication,
  getContractStatusMessage,
  shouldCreateContract
};