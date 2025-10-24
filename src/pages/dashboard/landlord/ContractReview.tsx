import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ContractSigningForm } from '@/components/landlord/ContractSigningForm';

interface Contract {
  id: string;
  application_id: string;
  property_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  property_address: string;
  property_city: string;
  property_state: string;
  monthly_rent: number;
  security_deposit: number;
  lease_start_date: string;
  lease_end_date: string;
  status: string;
  created_at: string;
  tenant_signature?: {
    signature_data: string;
    signed_at: string;
    ip_address: string;
  };
  landlord_signature?: {
    signature_data: string;
    signed_at: string;
    ip_address: string;
  };
}

export default function ContractReviewPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSigningForm, setShowSigningForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // TODO: Implement getLandlordContracts service
      // const data = await getLandlordContracts();
      // setContracts(data);
      
      // Mock data for now
      setContracts([]);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowSigningForm(true);
  };

  const handleContractSigned = async (contractId: string) => {
    try {
      // TODO: Implement contract signing service
      toast.success('Contract signed successfully!');
      setShowSigningForm(false);
      setSelectedContract(null);
      loadContracts(); // Refresh the list
    } catch (error) {
      console.error('Failed to sign contract:', error);
      toast.error('Failed to sign contract');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_landlord_signature':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Awaiting Your Signature</Badge>;
      case 'fully_signed':
        return <Badge variant="default" className="text-green-600 bg-green-50">Fully Executed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contract Review</h1>
          <p className="text-muted-foreground">
            Review and sign lease contracts from tenants
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/landlord/applications')}
        >
          Back to Applications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {contracts.filter(c => c.status === 'pending_landlord_signature').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Contracts awaiting your signature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Executed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'fully_signed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Contracts fully executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">
              All lease contracts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              When tenants sign lease contracts, they will appear here for your review and signature.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/dashboard/landlord/applications')}
            >
              View Applications
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Lease Contract - {contract.tenant_name}
                      </CardTitle>
                      <CardDescription>
                        Property: {contract.property_address}, {contract.property_city}, {contract.property_state}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(contract.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{contract.tenant_name}</p>
                      <p className="text-xs text-muted-foreground">{contract.tenant_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{contract.property_city}</p>
                      <p className="text-xs text-muted-foreground">{contract.property_state}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(contract.monthly_rent)}</p>
                      <p className="text-xs text-muted-foreground">Monthly rent</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatDate(contract.lease_start_date)}</p>
                      <p className="text-xs text-muted-foreground">Lease start</p>
                    </div>
                  </div>
                </div>

                {/* Tenant Signature Status */}
                {contract.tenant_signature && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Tenant Signed
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Signed on {formatDate(contract.tenant_signature.signed_at)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(contract.created_at)}
                  </div>
                  
                  <div className="flex space-x-2">
                    {contract.status === 'pending_landlord_signature' && (
                      <Button
                        onClick={() => handleReviewContract(contract)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Review & Sign
                      </Button>
                    )}
                    
                    {contract.status === 'fully_signed' && (
                      <Button variant="outline" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Fully Executed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Signing Modal */}
      {showSigningForm && selectedContract && (
        <ContractSigningForm
          contract={selectedContract}
          onSign={handleContractSigned}
          onCancel={() => {
            setShowSigningForm(false);
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
}
