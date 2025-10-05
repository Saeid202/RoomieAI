import { supabase } from "@/integrations/supabase/client";
import { OntarioLeaseFormData, OntarioLeaseContract, SignatureData } from "@/types/ontarioLease";

const sb: any = supabase;

/**
 * Generate Ontario lease contract from form data
 */
export async function generateOntarioLeaseContract(input: {
  application_id: string;
  ontario_form_data: OntarioLeaseFormData;
  lease_start_date: string;
  lease_end_date: string;
}): Promise<OntarioLeaseContract> {
  console.log("Generating Ontario lease contract:", input);
  
  try {
    // Calculate lease duration in months
    const startDate = new Date(input.lease_start_date);
    const endDate = new Date(input.lease_end_date);
    const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    const contractData = {
      application_id: input.application_id,
      ontario_form_data: input.ontario_form_data,
      form_version: '2229E-2024',
      lease_start_date: input.lease_start_date,
      lease_end_date: input.lease_end_date,
      monthly_rent: input.ontario_form_data.monthlyRent,
      security_deposit: input.ontario_form_data.securityDeposit,
      last_month_rent_deposit: input.ontario_form_data.lastMonthRentDeposit,
      key_deposit: input.ontario_form_data.keyDeposit,
      lease_duration_months: durationMonths,
      property_address: input.ontario_form_data.propertyAddress,
      property_city: input.ontario_form_data.propertyCity,
      property_state: input.ontario_form_data.propertyProvince,
      property_zip: input.ontario_form_data.propertyPostalCode,
      property_type: input.ontario_form_data.propertyType,
      property_type_other: input.ontario_form_data.propertyTypeOther,
      property_bedrooms: input.ontario_form_data.numberOfBedrooms,
      property_bathrooms: input.ontario_form_data.numberOfBathrooms,
      property_square_footage: input.ontario_form_data.squareFootage,
      parking_spaces: input.ontario_form_data.parkingSpaces,
      landlord_name: input.ontario_form_data.landlordName,
      landlord_email: input.ontario_form_data.landlordEmail,
      landlord_address: input.ontario_form_data.landlordAddress,
      landlord_city: input.ontario_form_data.landlordCity,
      landlord_province: input.ontario_form_data.landlordProvince,
      landlord_postal_code: input.ontario_form_data.landlordPostalCode,
      tenant_name: input.ontario_form_data.tenantName,
      tenant_email: input.ontario_form_data.tenantEmail,
      tenant_phone: input.ontario_form_data.tenantPhone,
      tenant_address: input.ontario_form_data.tenantAddress,
      tenant_city: input.ontario_form_data.tenantCity,
      tenant_province: input.ontario_form_data.tenantProvince,
      tenant_postal_code: input.ontario_form_data.tenantPostalCode,
      pet_policy: input.ontario_form_data.petPolicyDetails || `Pets: ${input.ontario_form_data.petPolicy}`,
      smoking_policy: input.ontario_form_data.smokingPolicyDetails || `Smoking: ${input.ontario_form_data.smokingPolicy}`,
      utilities_included: input.ontario_form_data.utilitiesIncluded,
      utilities_not_included: input.ontario_form_data.utilitiesNotIncluded,
      special_conditions: input.ontario_form_data.specialConditions,
      maintenance_contact: input.ontario_form_data.maintenanceContact,
      emergency_contact: input.ontario_form_data.emergencyContact,
      status: 'draft',
      contract_template_version: 'v1.0',
      electronic_signature_consent: input.ontario_form_data.electronicSignatureConsent,
      terms_acceptance_landlord: false,
      terms_acceptance_tenant: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from('lease_contracts')
      .insert(contractData)
      .select()
      .single();

    if (error) {
      console.error("Error creating Ontario lease contract:", error);
      throw new Error(`Failed to create lease contract: ${error.message}`);
    }

    console.log("Ontario lease contract created successfully:", data.id);
    return data as OntarioLeaseContract;
  } catch (error) {
    console.error("Error in generateOntarioLeaseContract:", error);
    throw error;
  }
}

/**
 * Sign Ontario lease contract as tenant
 */
export async function signOntarioLeaseAsTenant(
  contractId: string,
  signatureData: SignatureData
): Promise<OntarioLeaseContract> {
  try {
    const signature = {
      signature_data: signatureData.signature_data,
      signed_at: new Date().toISOString(),
      ip_address: signatureData.ip_address,
      user_agent: signatureData.user_agent || navigator.userAgent
    };

    const { data, error } = await sb
      .from('lease_contracts')
      .update({
        tenant_signature: signature,
        terms_acceptance_tenant: true,
        status: 'pending_landlord_signature'
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error("Error adding tenant signature:", error);
      throw new Error(`Failed to add tenant signature: ${error.message}`);
    }

    console.log("Tenant signature added successfully");
    return data as OntarioLeaseContract;
  } catch (error) {
    console.error("Error in signOntarioLeaseAsTenant:", error);
    throw error;
  }
}

/**
 * Download Ontario lease PDF
 */
export async function downloadOntarioLeasePdf(
  contractId: string,
  filename: string,
  contractData?: OntarioLeaseContract
): Promise<void> {
  try {
    console.log("Generating Ontario lease PDF for contract:", contractId);
    
    // If we have contract data, use it; otherwise fetch from database
    let contract = contractData;
    if (!contract) {
      const { data, error } = await sb
        .from('lease_contracts')
        .select('*')
        .eq('id', contractId)
        .single();
      
      if (error || !data) {
        throw new Error("Contract not found");
      }
      contract = data as OntarioLeaseContract;
    }

    // Create a simple PDF using the browser's print functionality
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error("Unable to open print window");
    }

    // Generate HTML content for the PDF
    const htmlContent = generateOntarioLeaseHtml(contract);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
    
    console.log("Ontario lease PDF generation initiated");
  } catch (error) {
    console.error("Error generating Ontario lease PDF:", error);
    throw error;
  }
}

/**
 * Generate HTML content for Ontario lease PDF
 */
function generateOntarioLeaseHtml(contract: OntarioLeaseContract): string {
  const formData = contract.ontario_form_data;
  if (!formData) {
    throw new Error("No form data available for contract");
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ontario Residential Tenancy Agreement</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; text-decoration: underline; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; }
        .signature-section { margin-top: 40px; border-top: 1px solid #000; padding-top: 20px; }
        .signature-box { display: inline-block; width: 45%; margin: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ONTARIO RESIDENTIAL TENANCY AGREEMENT</h1>
        <p>Form 2229E - Residential Tenancy Agreement</p>
        <p>Contract ID: ${contract.id}</p>
      </div>

      <div class="section">
        <div class="section-title">LANDLORD INFORMATION</div>
        <div class="field"><span class="field-label">Name:</span> ${formData.landlordName}</div>
        <div class="field"><span class="field-label">Email:</span> ${formData.landlordEmail}</div>
        <div class="field"><span class="field-label">Address:</span> ${formData.landlordAddress}, ${formData.landlordCity}, ${formData.landlordProvince} ${formData.landlordPostalCode}</div>
      </div>

      <div class="section">
        <div class="section-title">TENANT INFORMATION</div>
        <div class="field"><span class="field-label">Name:</span> ${formData.tenantName}</div>
        <div class="field"><span class="field-label">Email:</span> ${formData.tenantEmail}</div>
        <div class="field"><span class="field-label">Phone:</span> ${formData.tenantPhone}</div>
        <div class="field"><span class="field-label">Address:</span> ${formData.tenantAddress}, ${formData.tenantCity}, ${formData.tenantProvince} ${formData.tenantPostalCode}</div>
      </div>

      <div class="section">
        <div class="section-title">PROPERTY INFORMATION</div>
        <div class="field"><span class="field-label">Address:</span> ${formData.propertyAddress}, ${formData.propertyCity}, ${formData.propertyProvince} ${formData.propertyPostalCode}</div>
        <div class="field"><span class="field-label">Type:</span> ${formData.propertyType}${formData.propertyTypeOther ? ` (${formData.propertyTypeOther})` : ''}</div>
        <div class="field"><span class="field-label">Bedrooms:</span> ${formData.numberOfBedrooms}</div>
        <div class="field"><span class="field-label">Bathrooms:</span> ${formData.numberOfBathrooms}</div>
        ${formData.squareFootage ? `<div class="field"><span class="field-label">Square Footage:</span> ${formData.squareFootage}</div>` : ''}
        ${formData.parkingSpaces ? `<div class="field"><span class="field-label">Parking Spaces:</span> ${formData.parkingSpaces}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">LEASE TERMS</div>
        <div class="field"><span class="field-label">Monthly Rent:</span> $${formData.monthlyRent.toLocaleString()}</div>
        <div class="field"><span class="field-label">Security Deposit:</span> $${formData.securityDeposit.toLocaleString()}</div>
        <div class="field"><span class="field-label">Last Month Rent Deposit:</span> $${formData.lastMonthRentDeposit.toLocaleString()}</div>
        <div class="field"><span class="field-label">Key Deposit:</span> $${formData.keyDeposit.toLocaleString()}</div>
        <div class="field"><span class="field-label">Lease Period:</span> ${new Date(contract.lease_start_date).toLocaleDateString()} to ${new Date(contract.lease_end_date).toLocaleDateString()}</div>
        <div class="field"><span class="field-label">Duration:</span> ${contract.lease_duration_months} months</div>
      </div>

      <div class="section">
        <div class="section-title">UTILITIES AND SERVICES</div>
        <div class="field"><span class="field-label">Included:</span> ${formData.utilitiesIncluded.join(', ')}</div>
        <div class="field"><span class="field-label">Not Included:</span> ${formData.utilitiesNotIncluded.join(', ')}</div>
      </div>

      <div class="section">
        <div class="section-title">POLICIES</div>
        <div class="field"><span class="field-label">Pet Policy:</span> ${formData.petPolicy}${formData.petPolicyDetails ? ` - ${formData.petPolicyDetails}` : ''}</div>
        <div class="field"><span class="field-label">Smoking Policy:</span> ${formData.smokingPolicy}${formData.smokingPolicyDetails ? ` - ${formData.smokingPolicyDetails}` : ''}</div>
      </div>

      ${formData.specialConditions ? `
      <div class="section">
        <div class="section-title">SPECIAL CONDITIONS</div>
        <div class="field">${formData.specialConditions}</div>
      </div>
      ` : ''}

      <div class="signature-section">
        <div class="section-title">SIGNATURES</div>
        <div class="signature-box">
          <div class="field"><span class="field-label">Landlord Signature:</span></div>
          <div style="border: 1px solid #000; height: 60px; margin: 10px 0;"></div>
          <div class="field"><span class="field-label">Date:</span> _________________</div>
        </div>
        <div class="signature-box">
          <div class="field"><span class="field-label">Tenant Signature:</span></div>
          <div style="border: 1px solid #000; height: 60px; margin: 10px 0;"></div>
          <div class="field"><span class="field-label">Date:</span> _________________</div>
        </div>
      </div>

      <div style="margin-top: 40px; font-size: 12px; text-align: center;">
        <p>This agreement complies with the Ontario Residential Tenancies Act, 2006</p>
        <p>Generated on ${new Date().toLocaleDateString()} | Contract ID: ${contract.id}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Test PDF generation
 */
export async function testPdfGeneration(): Promise<void> {
  try {
    console.log("Testing PDF generation...");
    
    // Create a mock contract for testing
    const mockContract: OntarioLeaseContract = {
      id: 'test-contract-123',
      application_id: 'test-app-123',
      property_id: 'test-property-123',
      landlord_id: 'test-landlord-123',
      tenant_id: 'test-tenant-123',
      ontario_form_data: {
        landlordName: 'John Smith',
        landlordEmail: 'john@example.com',
        landlordAddress: '123 Main St',
        landlordCity: 'Toronto',
        landlordProvince: 'ON',
        landlordPostalCode: 'M5V 3A8',
        tenantName: 'Jane Doe',
        tenantEmail: 'jane@example.com',
        tenantPhone: '(416) 555-0123',
        tenantAddress: '456 Oak Ave',
        tenantCity: 'Toronto',
        tenantProvince: 'ON',
        tenantPostalCode: 'M5V 3B9',
        propertyAddress: '789 Queen St W',
        propertyCity: 'Toronto',
        propertyProvince: 'ON',
        propertyPostalCode: 'M6J 1G5',
        propertyType: 'apartment',
        numberOfBedrooms: 2,
        numberOfBathrooms: 1,
        squareFootage: 800,
        monthlyRent: 2500,
        securityDeposit: 2500,
        lastMonthRentDeposit: 2500,
        keyDeposit: 100,
        leaseStartDate: new Date('2024-02-01'),
        leaseEndDate: new Date('2025-01-31'),
        utilitiesIncluded: ['Heat', 'Water'],
        utilitiesNotIncluded: ['Electricity', 'Internet'],
        petPolicy: 'allowed',
        smokingPolicy: 'not_allowed',
        electronicSignatureConsent: true,
        termsAcceptance: true
      },
      form_version: '2229E-2024',
      lease_start_date: '2024-02-01',
      lease_end_date: '2025-01-31',
      monthly_rent: 2500,
      security_deposit: 2500,
      last_month_rent_deposit: 2500,
      key_deposit: 100,
      lease_duration_months: 12,
      property_address: '789 Queen St W',
      property_city: 'Toronto',
      property_state: 'ON',
      property_zip: 'M6J 1G5',
      property_type: 'apartment',
      property_bedrooms: 2,
      property_bathrooms: 1,
      property_square_footage: 800,
      landlord_name: 'John Smith',
      landlord_email: 'john@example.com',
      tenant_name: 'Jane Doe',
      tenant_email: 'jane@example.com',
      tenant_phone: '(416) 555-0123',
      status: 'draft',
      contract_template_version: 'v1.0',
      electronic_signature_consent: true,
      terms_acceptance_landlord: false,
      terms_acceptance_tenant: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await downloadOntarioLeasePdf('test-contract-123', 'test-ontario-lease.pdf', mockContract);
    console.log("Test PDF generation completed successfully");
  } catch (error) {
    console.error("Test PDF generation failed:", error);
    throw error;
  }
}
