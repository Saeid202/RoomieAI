import { supabase } from "@/integrations/supabase/client";
import { 
  RentalContract, 
  ContractData, 
  SignatureData, 
  ContractStatus,
  SignContractRequest,
  UpdateContractStatusRequest,
  ContractResponse,
  ContractsListResponse
} from "@/types/contract";

// Note: This service will work once the rental_contracts table is created via migration

class ContractService {
  /**
   * Create a new rental contract
   */
  async createContract(data: ContractData): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('rental_contracts')
        .insert({
          property_id: data.propertyId,
          tenant_id: data.tenantId,
          landlord_id: data.landlordId,
          contract_terms: data.contractTerms,
          monthly_rent: data.monthlyRent,
          security_deposit: data.securityDeposit,
          lease_start_date: data.leaseStartDate,
          lease_end_date: data.leaseEndDate,
          special_terms: data.specialTerms,
          utilities_included: data.utilitiesIncluded,
          pet_policy: data.petPolicy,
          smoking_allowed: data.smokingAllowed,
          expires_at: data.expiresAt || this.getDefaultExpirationDate(),
          status: ContractStatus.PENDING_TENANT
        })
        .select(`
          *,
          property:properties(id, listing_title, address, city, state),
          tenant:tenant_id(email),
          landlord:landlord_id(email)
        `)
        .single();

      if (error) {
        console.error('Error creating contract:', error);
        return { contract: {} as RentalContract, success: false, message: error.message };
      }

      return { 
        contract: this.transformContract(contract), 
        success: true, 
        message: 'Contract created successfully' 
      };
    } catch (error) {
      console.error('Contract creation error:', error);
      return { 
        contract: {} as RentalContract, 
        success: false, 
        message: 'Failed to create contract' 
      };
    }
  }

  /**
   * Get a contract by ID
   */
  async getContract(contractId: string): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          property:properties(id, listing_title, address, city, state),
          tenant:tenant_id(email),
          landlord:landlord_id(email)
        `)
        .eq('id', contractId)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        return { contract: {} as RentalContract, success: false, message: error.message };
      }

      return { 
        contract: this.transformContract(contract), 
        success: true 
      };
    } catch (error) {
      console.error('Contract fetch error:', error);
      return { 
        contract: {} as RentalContract, 
        success: false, 
        message: 'Failed to fetch contract' 
      };
    }
  }

  /**
   * Get contracts for a user (as tenant or landlord)
   */
  async getUserContracts(userId: string): Promise<ContractsListResponse> {
    try {
      const { data: contracts, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          property:properties(id, listing_title, address, city, state),
          tenant:tenant_id(email),
          landlord:landlord_id(email)
        `)
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user contracts:', error);
        return { contracts: [], success: false, message: error.message };
      }

      return { 
        contracts: contracts.map(this.transformContract), 
        success: true,
        totalCount: contracts.length
      };
    } catch (error) {
      console.error('User contracts fetch error:', error);
      return { 
        contracts: [], 
        success: false, 
        message: 'Failed to fetch contracts' 
      };
    }
  }

  /**
   * Sign a contract (tenant or landlord)
   */
  async signContract(request: SignContractRequest): Promise<ContractResponse> {
    try {
      if (!request.agreedToTerms) {
        return { 
          contract: {} as RentalContract, 
          success: false, 
          message: 'Must agree to terms and conditions' 
        };
      }

      const { data: currentContract } = await supabase
        .from('rental_contracts')
        .select('*')
        .eq('id', request.contractId)
        .single();

      if (!currentContract) {
        return { 
          contract: {} as RentalContract, 
          success: false, 
          message: 'Contract not found' 
        };
      }

      // Get user's IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIpAddress = ipData.ip;

      let updateData: any = {};
      let newStatus = currentContract.status;

      if (request.userType === 'tenant') {
        updateData = {
          tenant_signed_at: new Date().toISOString(),
          tenant_signature_data: request.signature,
          tenant_ip_address: userIpAddress
        };
        
        // If landlord already signed, contract is fully executed
        if (currentContract.landlord_signed_at) {
          newStatus = ContractStatus.FULLY_EXECUTED;
        } else {
          newStatus = ContractStatus.PENDING_LANDLORD;
        }
      } else {
        updateData = {
          landlord_signed_at: new Date().toISOString(),
          landlord_signature_data: request.signature,
          landlord_ip_address: userIpAddress
        };
        
        // If tenant already signed, contract is fully executed
        if (currentContract.tenant_signed_at) {
          newStatus = ContractStatus.FULLY_EXECUTED;
        } else {
          newStatus = ContractStatus.PENDING_TENANT;
        }
      }

      updateData.status = newStatus;

      const { data: updatedContract, error } = await supabase
        .from('rental_contracts')
        .update(updateData)
        .eq('id', request.contractId)
        .select(`
          *,
          property:properties(id, listing_title, address, city, state),
          tenant:tenant_id(email),
          landlord:landlord_id(email)
        `)
        .single();

      if (error) {
        console.error('Error signing contract:', error);
        return { contract: {} as RentalContract, success: false, message: error.message };
      }

      // If contract is fully executed, generate final PDF
      if (newStatus === ContractStatus.FULLY_EXECUTED) {
        await this.generateFinalPDF(request.contractId);
      }

      return { 
        contract: this.transformContract(updatedContract), 
        success: true, 
        message: 'Contract signed successfully' 
      };
    } catch (error) {
      console.error('Contract signing error:', error);
      return { 
        contract: {} as RentalContract, 
        success: false, 
        message: 'Failed to sign contract' 
      };
    }
  }

  /**
   * Update contract status (reject, expire, etc.)
   */
  async updateContractStatus(request: UpdateContractStatusRequest): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('rental_contracts')
        .update({ 
          status: request.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.contractId)
        .select(`
          *,
          property:properties(id, listing_title, address, city, state),
          tenant:tenant_id(email),
          landlord:landlord_id(email)
        `)
        .single();

      if (error) {
        console.error('Error updating contract status:', error);
        return { contract: {} as RentalContract, success: false, message: error.message };
      }

      return { 
        contract: this.transformContract(contract), 
        success: true, 
        message: 'Contract status updated successfully' 
      };
    } catch (error) {
      console.error('Contract status update error:', error);
      return { 
        contract: {} as RentalContract, 
        success: false, 
        message: 'Failed to update contract status' 
      };
    }
  }

  /**
   * Generate final PDF with signatures
   */
  async generateFinalPDF(contractId: string): Promise<Blob | null> {
    try {
      // This would typically call a server function to generate PDF
      // For now, we'll return null and implement this later
      console.log('Generating PDF for contract:', contractId);
      
      // TODO: Implement PDF generation using jsPDF or server-side PDF generation
      // const pdfBlob = await this.createPDFWithSignatures(contract);
      // const pdfUrl = await this.uploadPDFToStorage(pdfBlob, contractId);
      // await this.updateContractPDFUrl(contractId, pdfUrl);
      
      return null;
    } catch (error) {
      console.error('PDF generation error:', error);
      return null;
    }
  }

  /**
   * Get default expiration date (7 days from now)
   */
  private getDefaultExpirationDate(): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    return expirationDate.toISOString();
  }

  /**
   * Transform database contract to frontend format
   */
  private transformContract(contract: any): RentalContract {
    return {
      id: contract.id,
      propertyId: contract.property_id,
      tenantId: contract.tenant_id,
      landlordId: contract.landlord_id,
      contractTerms: contract.contract_terms,
      monthlyRent: contract.monthly_rent,
      securityDeposit: contract.security_deposit,
      leaseStartDate: contract.lease_start_date,
      leaseEndDate: contract.lease_end_date,
      status: contract.status as ContractStatus,
      tenantSignedAt: contract.tenant_signed_at,
      tenantSignatureData: contract.tenant_signature_data,
      tenantIpAddress: contract.tenant_ip_address,
      landlordSignedAt: contract.landlord_signed_at,
      landlordSignatureData: contract.landlord_signature_data,
      landlordIpAddress: contract.landlord_ip_address,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at,
      expiresAt: contract.expires_at,
      contractPdfUrl: contract.contract_pdf_url,
      specialTerms: contract.special_terms,
      utilitiesIncluded: contract.utilities_included,
      petPolicy: contract.pet_policy,
      smokingAllowed: contract.smoking_allowed,
      property: contract.property,
      tenant: contract.tenant,
      landlord: contract.landlord
    };
  }

  /**
   * Check if contract has expired
   */
  isContractExpired(contract: RentalContract): boolean {
    if (!contract.expiresAt) return false;
    return new Date(contract.expiresAt) < new Date();
  }

  /**
   * Get user's role in contract
   */
  getUserRole(contract: RentalContract, userId: string): 'tenant' | 'landlord' | null {
    if (contract.tenantId === userId) return 'tenant';
    if (contract.landlordId === userId) return 'landlord';
    return null;
  }

  /**
   * Check if user can sign contract
   */
  canUserSign(contract: RentalContract, userId: string): boolean {
    const role = this.getUserRole(contract, userId);
    if (!role) return false;

    if (contract.status === ContractStatus.EXPIRED || 
        contract.status === ContractStatus.REJECTED ||
        contract.status === ContractStatus.FULLY_EXECUTED) {
      return false;
    }

    if (role === 'tenant' && contract.tenantSignedAt) return false;
    if (role === 'landlord' && contract.landlordSignedAt) return false;

    return true;
  }
}

export const contractService = new ContractService();
export default contractService;