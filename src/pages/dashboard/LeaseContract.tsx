import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getLeaseContractByApplicationId,
  LeaseContract,
  canUserAccessContract
} from "@/services/leaseContractService";
import { getApplicationById } from "@/services/rentalApplicationService";
import { fetchPropertyById, Property } from "@/services/propertyService";
import {
  generateOntarioLeaseContract,
  updateOntarioLeaseContract,
  signOntarioLeaseAsLandlord,
  signOntarioLeaseAsTenant
} from "@/services/ontarioLeaseService";
import { printOntarioLease } from "@/utils/printLease";
import { LeaseContractTemplate } from "@/components/lease/LeaseContractTemplate";
import { OntarioLeaseDisplay } from "@/components/lease/OntarioLeaseDisplay";
import OntarioLeaseForm2229E from "@/components/ontario/OntarioLeaseForm2229E";
import { OntarioLeaseContract, OntarioLeaseFormData } from "@/types/ontarioLease";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LeaseContractPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<LeaseContract | OntarioLeaseContract | null>(null);
  const [appData, setAppData] = useState<any | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!applicationId || !user) return;
    loadData();
  }, [applicationId, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Try to fetch existing contract
      const existingContract = await getLeaseContractByApplicationId(applicationId!);

      if (existingContract) {
        // Contract exists - Verify access
        // Pass contract ID, not object
        // const hasAccess = await canUserAccessContract(existingContract.id, user!.id);
        // Note: canUserAccessContract might fetch contract again, but here we just check IDs
        // Simplification for now:
        const hasAccess = existingContract.landlord_id === user!.id || existingContract.tenant_id === user!.id;

        if (!hasAccess) {
          toast.error("You do not have permission to view this contract");
          navigate("/dashboard");
          return;
        }
        setContract(existingContract);

        // Also load AppData and Property if we might need to Edit (Draft status)
        if (existingContract.status === 'draft') {
          const app = await getApplicationById(applicationId!);
          setAppData(app);
          if (app && app.property_id) {
            const prop = await fetchPropertyById(app.property_id);
            setProperty(prop as Property);
          }
        }
      } else {
        // Contract does not exist - Load App & Property to prepare for creation
        const app = await getApplicationById(applicationId!);
        if (!app) {
          toast.error("Application not found");
          navigate("/dashboard");
          return;
        }
        setAppData(app);

        if (app.property_id) {
          const prop = await fetchPropertyById(app.property_id);
          setProperty(prop as Property);
        }
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
      toast.error("Failed to load lease information");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (formData: OntarioLeaseFormData) => {
    if (!appData || !property) return;

    try {
      setIsCreating(true);

      // Calculate dates from form data
      const startDate = formData.startDate ||
        (formData.tenancyStartDate ? new Date(formData.tenancyStartDate).toISOString().split('T')[0] :
          new Date().toISOString().split('T')[0]);

      // Default to 1 year if not specified
      const endDate = formData.endDate ||
        (formData.tenancyEndDate ? new Date(formData.tenancyEndDate).toISOString().split('T')[0] :
          new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)).toISOString().split('T')[0]);

      if (contract) {
        // Update existing draft
        await updateOntarioLeaseContract(contract.id, {
          ontario_form_data: formData,
          lease_start_date: startDate,
          lease_end_date: endDate
        });
      } else {
        // Create new
        await generateOntarioLeaseContract({
          application_id: applicationId!,
          ontario_form_data: formData,
          lease_start_date: startDate,
          lease_end_date: endDate
        });
      }

      // Reload full data to ensure relations (landlord, property, etc.) are present
      // explicitly call loadData to refresh state
      await loadData();

      toast.success(contract ? "Lease contract updated!" : "Lease contract created successfully!");
    } catch (error) {
      console.error("Error creating/updating contract:", error);
      toast.error("Failed to create contract");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSign = async (role: 'landlord' | 'tenant') => {
    if (!contract || !user) return;

    try {
      // Use distinct signature per role? For now using text valid
      const signatureData = {
        signature_data: "Digital Signature - " + new Date().toISOString(),
        ip_address: "127.0.0.1", // In real app, get from server
        user_agent: navigator.userAgent
      };

      let updatedContract;
      if (role === 'landlord') {
        updatedContract = await signOntarioLeaseAsLandlord(contract.id, signatureData);
        toast.success("Signed as Landlord successfully");
      } else {
        updatedContract = await signOntarioLeaseAsTenant(contract.id, signatureData);
        toast.success("Signed as Tenant successfully");
      }

      setContract(updatedContract);
    } catch (error) {
      console.error(`Error signing as ${role}:`, error);
      toast.error(`Failed to sign contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if contract exists AND has ontario data
  const isOntarioContract = contract && 'ontario_form_data' in contract && contract.ontario_form_data !== null;

  // Show Editor if: 
  // 1. No contract exists
  // 2. Contract exists, is Draft, and is NOT an Ontario Contract (missing data)
  // 3. Contract exists, is Draft, and IS Ontario Contract (Allow editing draft)
  // Actually, allow editing even if it IS Ontario Contract as long as it's Draft.
  const showEditor = !contract || (contract.status === 'draft');

  if (showEditor) {
    if (!appData || (!property && !contract)) return <div>Error loading application details</div>;

    // Use existing contract data if avaliable, otherwise incomplete/new defaults
    const existingFormData = isOntarioContract ? (contract as OntarioLeaseContract).ontario_form_data : {};

    // Attempt to parse address better (for new or generic drafts)
    const addressParts = property?.address?.split(' ') || [];
    const streetNum = addressParts.length > 0 && /^\d+$/.test(addressParts[0]) ? addressParts[0] : '';
    const streetName = streetNum ? addressParts.slice(1).join(' ') : property?.address || '';

    const initialFormData = {
      // Defaults from Property/App
      landlordLegalName: user?.user_metadata?.full_name ||
        (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : '') ||
        '',
      landlordEmail: user?.email || '',
      streetNumber: streetNum,
      streetName: streetName,
      cityTown: property?.city || '',
      postalCode: property?.zip_code || '',
      tenantFirstName: appData?.full_name?.split(' ')[0] || '',
      tenantLastName: appData?.full_name?.split(' ').slice(1).join(' ') || '',
      tenantEmail: appData?.email || '',
      baseRent: property?.monthly_rent || 0,
      totalRent: property?.monthly_rent || 0,
      startDate: appData?.move_in_date || appData?.moveInDate || '',

      // Override with existing saved data if present
      ...existingFormData
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{contract ? "Complete/Edit Lease Agreement" : "Create Lease Agreement"}</h1>
          <p className="text-gray-500">Review and finalize the Ontario Standard Lease Form.</p>
        </div>

        <OntarioLeaseForm2229E
          initialData={initialFormData}
          onSubmit={handleCreateContract}
          onCancel={() => navigate(-1)}
          isLandlord={true} // Explicitly passing true
        />
      </div>
    );
  }

  // VIEW MODE: Signed or Pending Signature (Non-Draft)
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {isOntarioContract ? (
        (() => {
          const role = contract.landlord_id === user!.id ? 'landlord' :
            contract.tenant_id === user!.id ? 'tenant' : null;
          const userHasSigned = role === 'landlord' ? !!contract.landlord_signature :
            role === 'tenant' ? !!contract.tenant_signature : false;

          return (
            <OntarioLeaseDisplay
              contract={contract as OntarioLeaseContract}
              isSigned={userHasSigned}
              onSign={() => {
                if (!role) {
                  toast.error("You are not a party to this contract");
                  return;
                }
                if (userHasSigned) {
                  toast.info("You have already signed this contract");
                  return;
                }
                handleSign(role);
              }}
              onDownload={() => {
                printOntarioLease(contract as OntarioLeaseContract);
              }}
            />
          );
        })()
      ) : (
        <LeaseContractTemplate
          contract={contract}
          showSignatures={true}
        />
      )}
    </div>
  );
}
