import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface LeaseContract {
  id: string;
  application_id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;

  // Contract Terms
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  lease_duration_months: number;

  // Property Information (cached)
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string;
  property_type: string;
  property_bedrooms?: number;
  property_bathrooms?: number;
  property_square_footage?: number;

  // Party Information (cached)
  landlord_name: string;
  landlord_email: string;
  landlord_phone?: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone?: string;

  // Lease Terms
  pet_policy?: string;
  smoking_policy?: string;
  utilities_included?: string[];
  parking_details?: string;
  maintenance_responsibility?: string;
  additional_terms?: string;

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

export interface LeaseContractInput {
  application_id: string;
  lease_start_date: string;
  lease_duration_months: number;
  additional_terms?: string;
}

export interface SignatureData {
  signature_data: string; // base64 encoded signature image
  ip_address: string;
  user_agent?: string;
}

export interface LandlordContractView {
  contract_id: string;
  status: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  tenant_name: string;
  tenant_email: string;
  property_address: string;
  property_city: string;
  property_state: string;
  contract_created: string;
  landlord_signed: boolean;
  tenant_signed: boolean;
  application_id: string;
  application_date: string;
}

export interface TenantContractView {
  contract_id: string;
  status: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  landlord_name: string;
  landlord_email: string;
  property_address: string;
  property_city: string;
  property_state: string;
  property_type: string;
  contract_created: string;
  landlord_signed: boolean;
  tenant_signed: boolean;
  application_id: string;
}

/**
 * Generate a lease contract from an approved rental application
 */
export async function generateLeaseContract(input: LeaseContractInput): Promise<LeaseContract> {
  console.log("Generating lease contract:", input);

  try {
    const { data, error } = await sb
      .rpc('generate_lease_contract', {
        p_application_id: input.application_id,
        p_lease_start_date: input.lease_start_date,
        p_lease_duration_months: input.lease_duration_months,
        p_additional_terms: input.additional_terms
      });

    if (error) {
      console.error("Error generating lease contract:", error);
      throw new Error(`Failed to generate lease contract: ${error.message}`);
    }

    // Fetch the created contract
    const contract = await getLeaseContractById(data);

    if (!contract) {
      throw new Error("Failed to retrieve generated contract");
    }

    console.log("Lease contract generated successfully:", contract.id);
    return contract;
  } catch (error) {
    console.error("Error in generateLeaseContract:", error);
    throw error;
  }
}

/**
 * Get lease contract by ID
 */
export async function getLeaseContractById(contractId: string): Promise<LeaseContract | null> {
  console.log("Fetching lease contract by ID:", contractId);

  try {
    const { data, error } = await sb
      .from('lease_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      console.error("Error fetching lease contract:", error);
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to fetch lease contract: ${error.message}`);
    }

    console.log("Lease contract fetched successfully:", data.id);
    return data as LeaseContract;
  } catch (error) {
    console.error("Error in getLeaseContractById:", error);
    throw error;
  }
}

/**
 * Get lease contract by application ID
 */
export async function getLeaseContractByApplicationId(applicationId: string): Promise<LeaseContract | null> {
  console.log("Fetching lease contract by application ID:", applicationId);

  try {
    const { data, error } = await sb
      .from('lease_contracts')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching lease contract by application:", error);
      throw new Error(`Failed to fetch lease contract: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    console.log("Lease contract fetched successfully:", data.id);
    return data as LeaseContract;
  } catch (error) {
    console.error("Error in getLeaseContractByApplicationId:", error);
    throw error;
  }
}

/**
 * Add landlord signature to contract
 */
export async function signContractAsLandlord(
  contractId: string,
  signatureData: SignatureData
): Promise<LeaseContract> {
  console.log("Adding landlord signature to contract:", contractId);

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
        landlord_signature: signature,
        terms_acceptance_landlord: true
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error("Error adding landlord signature:", error);
      throw new Error(`Failed to add landlord signature: ${error.message}`);
    }

    console.log("Landlord signature added successfully");
    return data as LeaseContract;
  } catch (error) {
    console.error("Error in signContractAsLandlord:", error);
    throw error;
  }
}

/**
 * Add tenant signature to contract
 */
export async function signContractAsTenant(
  contractId: string,
  signatureData: SignatureData
): Promise<LeaseContract> {
  console.log("Adding tenant signature to contract:", contractId);

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
        terms_acceptance_tenant: true
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error("Error adding tenant signature:", error);
      throw new Error(`Failed to add tenant signature: ${error.message}`);
    }

    console.log("Tenant signature added successfully");
    return data as LeaseContract;
  } catch (error) {
    console.error("Error in signContractAsTenant:", error);
    throw error;
  }
}

/**
 * Get contracts for landlord dashboard
 */
export async function getLandlordContracts(): Promise<LandlordContractView[]> {
  console.log("Fetching landlord contracts");

  try {
    const { data, error } = await sb
      .from('landlord_contracts_view')
      .select('*')
      .order('contract_created', { ascending: false });

    if (error) {
      console.error("Error fetching landlord contracts:", error);
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }

    console.log("Landlord contracts fetched successfully:", data?.length || 0);
    return (data as LandlordContractView[]) || [];
  } catch (error) {
    console.error("Error in getLandlordContracts:", error);
    return [];
  }
}

/**
 * Get contracts for tenant dashboard
 */
export async function getTenantContracts(): Promise<TenantContractView[]> {
  console.log("Fetching tenant contracts");

  try {
    const { data, error } = await sb
      .from('tenant_contracts_view')
      .select('*')
      .order('contract_created', { ascending: false });

    if (error) {
      console.error("Error fetching tenant contracts:", error);
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }

    console.log("Tenant contracts fetched successfully:", data?.length || 0);
    return (data as TenantContractView[]) || [];
  } catch (error) {
    console.error("Error in getTenantContracts:", error);
    return [];
  }
}

/**
 * Update contract status
 */
export async function updateContractStatus(
  contractId: string,
  status: LeaseContract['status']
): Promise<LeaseContract> {
  console.log("Updating contract status:", contractId, status);

  try {
    const { data, error } = await sb
      .from('lease_contracts')
      .update({ status })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error("Error updating contract status:", error);
      throw new Error(`Failed to update contract status: ${error.message}`);
    }

    console.log("Contract status updated successfully");
    return data as LeaseContract;
  } catch (error) {
    console.error("Error in updateContractStatus:", error);
    throw error;
  }
}

/**
 * Cancel/void a contract
 */
export async function cancelContract(contractId: string, reason?: string): Promise<void> {
  console.log("Cancelling contract:", contractId, reason);

  try {
    const { error } = await sb
      .from('lease_contracts')
      .update({
        status: 'cancelled',
        additional_terms: reason ? `CANCELLED: ${reason}` : 'CANCELLED'
      })
      .eq('id', contractId);

    if (error) {
      console.error("Error cancelling contract:", error);
      throw new Error(`Failed to cancel contract: ${error.message}`);
    }

    console.log("Contract cancelled successfully");
  } catch (error) {
    console.error("Error in cancelContract:", error);
    throw error;
  }
}

/**
 * Check if user can access contract (either as landlord or tenant)
 */
export async function canUserAccessContract(contractId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await sb
      .from('lease_contracts')
      .select('landlord_id, tenant_id')
      .eq('id', contractId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.landlord_id === userId || data.tenant_id === userId;
  } catch (error) {
    console.error("Error checking contract access:", error);
    return false;
  }
}

/**
 * Get user's role in contract (landlord or tenant)
 */
export async function getUserRoleInContract(contractId: string, userId: string): Promise<'landlord' | 'tenant' | null> {
  try {
    const { data, error } = await sb
      .from('lease_contracts')
      .select('landlord_id, tenant_id')
      .eq('id', contractId)
      .single();

    if (error || !data) {
      return null;
    }

    if (data.landlord_id === userId) return 'landlord';
    if (data.tenant_id === userId) return 'tenant';
    return null;
  } catch (error) {
    console.error("Error getting user role in contract:", error);
    return null;
  }
}

/**
 * Find PDF in all storage buckets - specifically looking for Ontario folder
 */
export async function findPdfInStorage(): Promise<{ bucket: string; path: string } | null> {
  console.log("🔍 Searching for PDF in Ontario folder...");

  try {
    // List all storage buckets
    const { data: buckets, error: bucketError } = await sb.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError);
      return null;
    }

    if (!buckets || buckets.length === 0) {
      console.error("❌ No storage buckets found!");
      return null;
    }

    console.log("✅ Found buckets:", buckets.map(b => b.id));

    // Search each bucket for PDF in Ontario folder
    for (const bucket of buckets) {
      console.log(`🔍 Checking bucket: ${bucket.id}`);

      try {
        // Check if Ontario folder exists
        const { data: ontarioFiles, error: ontarioError } = await sb.storage
          .from(bucket.id)
          .list('Ontario');

        if (ontarioError) {
          console.log(`No Ontario folder in ${bucket.id}`);
          continue;
        }

        if (ontarioFiles && ontarioFiles.length > 0) {
          console.log(`✅ Found Ontario folder in ${bucket.id}:`, ontarioFiles.map(f => f.name));

          // Look for PDF files
          const pdfFiles = ontarioFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));

          if (pdfFiles.length > 0) {
            const pdfFile = pdfFiles[0]; // Use first PDF found
            const path = `Ontario/${pdfFile.name}`;
            console.log(`✅ Found PDF in ${bucket.id}/${path}`);

            // Test if we can access it
            const { data: pdfData, error: pdfError } = await sb.storage
              .from(bucket.id)
              .download(path);

            if (pdfError) {
              console.error(`❌ Cannot access ${bucket.id}/${path}:`, pdfError.message);
              continue;
            }

            if (pdfData) {
              console.log(`✅ PDF accessible! Size: ${pdfData.size} bytes`);
              return { bucket: bucket.id, path: path };
            }
          }
        }

      } catch (error) {
        console.error(`Error checking bucket ${bucket.id}:`, error);
      }
    }

    console.error("❌ No accessible PDF found in Ontario folder of any bucket");
    return null;

  } catch (error) {
    console.error("Error finding PDF:", error);
    return null;
  }
}

/**
 * Comprehensive debug function
 */
export async function debugPdfSystem(): Promise<void> {
  console.log("=== PDF SYSTEM DEBUG ===");

  try {
    // 1. Test Supabase connection
    console.log("1. Testing Supabase connection...");
    const { data: { user }, error: authError } = await sb.auth.getUser();
    console.log("Auth status:", { user: !!user, error: authError });

    // 2. Find PDF in Ontario folder
    console.log("2. Searching for PDF in Ontario folder...");
    const pdfLocation = await findPdfInStorage();

    if (!pdfLocation) {
      console.error("❌ No PDF found in Ontario folder of any bucket!");
      return;
    }

    console.log("✅ Found PDF:", pdfLocation.bucket + '/' + pdfLocation.path);

    // 3. Test public URL
    const { data: { publicUrl } } = sb.storage
      .from(pdfLocation.bucket)
      .getPublicUrl(pdfLocation.path);
    console.log("Public URL:", publicUrl);

    // 4. Test fetch
    try {
      const response = await fetch(publicUrl);
      console.log("Public URL test:", response.status, response.statusText);
    } catch (fetchError) {
      console.error("Public URL fetch error:", fetchError);
    }

    console.log("=== DEBUG COMPLETE ===");
  } catch (error) {
    console.error("Debug error:", error);
  }
}

/**
 * Generate PDF contract - now looks specifically in Ontario folder
 */
export async function generateContractPdf(applicationId?: string): Promise<Blob> {
  console.log("=== PDF GENERATION DEBUG ===");
  console.log("Application ID:", applicationId || 'template');

  try {
    // Find PDF in Ontario folder
    const pdfLocation = await findPdfInStorage();

    if (!pdfLocation) {
      throw new Error('No PDF found in Ontario folder of any storage bucket. Please upload a PDF to the Ontario folder.');
    }

    console.log("Using PDF from:", pdfLocation.bucket + '/' + pdfLocation.path);

    // Download PDF
    const { data: pdfData, error: pdfError } = await sb.storage
      .from(pdfLocation.bucket)
      .download(pdfLocation.path);

    if (pdfError) {
      throw new Error(`Failed to download PDF: ${pdfError.message}`);
    }

    if (!pdfData) {
      throw new Error('No PDF data received');
    }

    console.log("PDF data received, converting to Blob...");
    const arrayBuffer = await pdfData.arrayBuffer();
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
    console.log("PDF Blob created:", pdfBlob.size, "bytes");

    return pdfBlob;
  } catch (error) {
    console.error("Error in generateContractPdf:", error);
    throw error;
  }
}

/**
 * Download contract PDF
 */
export async function downloadContractPdf(applicationId: string, filename?: string): Promise<void> {
  try {
    const pdfBlob = await generateContractPdf(applicationId);

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `lease-contract-${applicationId}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log("Contract PDF downloaded successfully");
  } catch (error) {
    console.error("Error downloading contract PDF:", error);
    throw error;
  }
}

/**
 * Get contract PDF URL for viewing
 */
export async function getContractPdfUrl(applicationId?: string): Promise<string> {
  try {
    const pdfBlob = await generateContractPdf(applicationId);
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error getting contract PDF URL:", error);
    throw error;
  }
}

/**
 * Finalize contract and store PDF
 */
export async function finalizeAndStoreContract(contractId: string): Promise<void> {
  console.log("Finalizing contract storage for:", contractId);

  try {
    // 1. Fetch complete contract details
    const contract = await getLeaseContractById(contractId);
    if (!contract) throw new Error("Contract not found");

    if (!contract.landlord_signature || !contract.tenant_signature) {
      console.warn("Contract not fully signed, skipping storage");
      return;
    }

    // 2. Generate/Fetch the PDF Blob
    console.log("Generating final PDF with signatures...");
    const pdfBlob = await generateContractPdf(contract.application_id);

    // 3. Define storage path: contracts/{property_id}/{lease_id}/{contract_id}.pdf
    const filePath = `contracts/${contract.property_id}/${contract.id}/${contract.id}.pdf`;

    // 4. Upload to Storage
    console.log("Uploading to storage:", filePath);
    await sb.storage.createBucket('contracts', { public: false }).catch(() => { });

    const { error: uploadError } = await sb.storage
      .from('contracts')
      .upload(filePath, pdfBlob, {
        upsert: true,
        contentType: 'application/pdf'
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
    }

    // 5. Create record in 'contracts' table
    console.log("Creating immutable contract record...");
    const { error: dbError } = await sb
      .from('contracts')
      .insert({
        application_id: contract.application_id,
        lease_id: contract.id,
        property_id: contract.property_id,
        landlord_id: contract.landlord_id,
        tenant_id: contract.tenant_id,
        file_path: filePath,
        file_name: `Lease_Contract_APP-${contract.application_id.slice(0, 8)}.pdf`,
        file_size: pdfBlob.size,
        status: 'signed',
        signed_at: new Date().toISOString()
      });

    if (dbError) {
      console.error("DB insert failed:", dbError);
    } else {
      console.log("Contract finalized and stored successfully!");
    }

  } catch (error) {
    console.error("Error in finalizeAndStoreContract:", error);
  }
}

/**
 * Get signed contract PDF URL from storage
 */
export async function getSignedContractPdfUrl(contractId: string): Promise<string> {
  try {
    console.log("Using getSignedContractPdfUrl for contract:", contractId);
    const { data, error } = await sb
      .from('contracts')
      .select('file_path')
      .eq('lease_id', contractId)
      .eq('status', 'signed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log("No signed contract record found for:", contractId);
      throw new Error("Signed contract document not found");
    }

    const { data: signedData, error: signError } = await sb.storage
      .from('contracts')
      .createSignedUrl(data.file_path, 3600);

    if (signError || !signedData) {
      throw new Error("Failed to generate download URL");
    }

    return signedData.signedUrl;

  } catch (error) {
    console.error("Error getting signed contract URL:", error);
    throw error;
  }
}

/**
 * Test function to check if PDF exists in storage
 */
export async function testPdfExists(): Promise<boolean> {
  try {
    console.log("Testing PDF existence in Ontario folder...");

    const pdfLocation = await findPdfInStorage();

    if (!pdfLocation) {
      console.error("❌ No PDF found in Ontario folder of any bucket!");
      return false;
    }

    console.log("✅ Found PDF:", pdfLocation.bucket + '/' + pdfLocation.path);
    return true;
  } catch (error) {
    console.error("Error testing PDF existence:", error);
    return false;
  }
}