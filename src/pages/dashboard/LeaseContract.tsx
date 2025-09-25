import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Pen, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { LeaseContractTemplate } from "@/components/lease/LeaseContractTemplate";
import { 
  getLeaseContractByApplicationId, 
  getUserRoleInContract,
  canUserAccessContract,
  LeaseContract 
} from "@/services/leaseContractService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LeaseContractPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState<LeaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'landlord' | 'tenant' | null>(null);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      if (!applicationId || !user) return;

      try {
        setLoading(true);
        
        // Get contract by application ID
        const contractData = await getLeaseContractByApplicationId(applicationId);
        
        if (!contractData) {
          toast.error("Lease contract not found");
          navigate("/dashboard");
          return;
        }

        // Check if user can access this contract
        const hasAccess = await canUserAccessContract(contractData.id, user.id);
        if (!hasAccess) {
          toast.error("You don't have permission to view this contract");
          navigate("/dashboard");
          return;
        }

        // Get user's role in the contract
        const role = await getUserRoleInContract(contractData.id, user.id);
        
        setContract(contractData);
        setUserRole(role);
        setCanAccess(true);
        
      } catch (error) {
        console.error("Failed to load contract:", error);
        toast.error("Failed to load lease contract");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [applicationId, user, navigate]);

  const handleSignContract = () => {
    if (!contract) return;
    navigate(`/dashboard/lease-contract/${applicationId}/sign`);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation and download
    toast.info("PDF download feature coming soon!");
  };

  const getStatusMessage = (status: string, role: 'landlord' | 'tenant' | null) => {
    switch (status) {
      case 'draft':
        return {
          message: "Contract is being prepared",
          color: "text-gray-600",
          icon: <FileText className="h-4 w-4" />
        };
      case 'pending_landlord_signature':
        return {
          message: role === 'landlord' ? "Ready for your signature" : "Waiting for landlord to sign",
          color: role === 'landlord' ? "text-blue-600" : "text-yellow-600",
          icon: role === 'landlord' ? <Pen className="h-4 w-4" /> : <Clock className="h-4 w-4" />
        };
      case 'pending_tenant_signature':
        return {
          message: role === 'tenant' ? "Ready for your signature" : "Waiting for tenant to sign",
          color: role === 'tenant' ? "text-blue-600" : "text-yellow-600",
          icon: role === 'tenant' ? <Pen className="h-4 w-4" /> : <Clock className="h-4 w-4" />
        };
      case 'fully_signed':
        return {
          message: "Contract fully signed - lease is active!",
          color: "text-green-600",
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'executed':
        return {
          message: "Lease agreement is now in effect",
          color: "text-green-600",
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'cancelled':
        return {
          message: "Contract has been cancelled",
          color: "text-red-600",
          icon: <AlertCircle className="h-4 w-4" />
        };
      default:
        return {
          message: "Unknown status",
          color: "text-gray-600",
          icon: <FileText className="h-4 w-4" />
        };
    }
  };

  const canUserSign = () => {
    if (!contract || !userRole) return false;
    
    if (userRole === 'landlord' && contract.status === 'pending_landlord_signature') {
      return true;
    }
    
    if (userRole === 'tenant' && contract.status === 'pending_tenant_signature') {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!contract || !canAccess) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to view this lease contract.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(contract.status, userRole);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lease Contract</h1>
            <p className="text-muted-foreground">
              {contract.property_address}, {contract.property_city}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {userRole === 'landlord' ? 'Landlord View' : 'Tenant View'}
          </Badge>
        </div>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={statusInfo.color}>
                {statusInfo.icon}
              </div>
              <div>
                <p className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.message}
                </p>
                <p className="text-sm text-muted-foreground">
                  Contract created on {new Date(contract.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canUserSign() && (
                <Button onClick={handleSignContract} className="bg-primary hover:bg-primary/90">
                  <Pen className="h-4 w-4 mr-2" />
                  Sign Contract
                </Button>
              )}
              
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Progress */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${
                contract.landlord_signature ? 'text-green-600' : 'text-gray-400'
              }`}>
                {contract.landlord_signature ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">Landlord</span>
              </div>
              
              <div className="flex-1 h-2 bg-gray-200 rounded-full mx-4">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    contract.tenant_signature ? 'bg-green-500 w-full' : 
                    contract.landlord_signature ? 'bg-blue-500 w-1/2' : 'bg-gray-300 w-0'
                  }`}
                />
              </div>
              
              <div className={`flex items-center gap-2 ${
                contract.tenant_signature ? 'text-green-600' : 'text-gray-400'
              }`}>
                {contract.tenant_signature ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">Tenant</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Template */}
      <Card>
        <CardContent className="p-0">
          <LeaseContractTemplate 
            contract={contract} 
            showSignatures={true}
            isPreview={false}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        {canUserSign() && (
          <Button 
            onClick={handleSignContract} 
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Pen className="h-4 w-4 mr-2" />
            Sign This Contract
          </Button>
        )}
        
        <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
