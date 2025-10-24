import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Clock, CheckCircle, XCircle, RefreshCw, FileSignature } from "lucide-react";
import { getLandlordApplications, updateApplicationStatus } from "@/services/rentalApplicationService";
import { ApplicationsList } from "@/components/landlord/ApplicationsList";
import { ApplicationDetailModal } from "@/components/landlord/ApplicationDetailModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MessagingService } from "@/services/messagingService";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getLandlordApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };
  const handleMessageApplicant = async (application: any) => {
    try {
      console.log('Creating conversation for application:', application.id);
      // TODO: Implement proper messaging integration
      toast.info('Messaging feature coming soon');
      // const convId = await MessagingService.getOrCreateConversation(propertyId, landlordId, tenantId);
      // navigate(`/dashboard/messenger/${convId}`);
    } catch (e) {
      console.error('Failed to open conversation', e);
      toast.error(`Could not open conversation: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleViewContract = async (application: any) => {
    try {
      console.log('Viewing contract for application:', application.id);
      
      // Check if contract exists
      if (!application.contract_status) {
        toast.error('No contract found for this application');
        return;
      }

      // If landlord hasn't signed yet, navigate to contract signing page
      if (application.contract_status.applicant_signed && !application.contract_status.landlord_signed) {
        // Navigate to contract signing page with application ID
        navigate(`/dashboard/contracts/sign/${application.id}`);
        toast.info('Opening contract for signature...');
      } else {
        // Navigate to contract viewing page
        navigate(`/dashboard/contracts/view/${application.id}`);
        toast.info('Opening contract for viewing...');
      }
    } catch (error) {
      console.error('Failed to open contract:', error);
      toast.error(`Could not open contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await updateApplicationStatus(applicationId, status as any);
      
      // If application is approved, create a rental contract
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          // Import contract creation utility
          const { createContractFromApplication } = await import('@/utils/contractUtils');
          
          try {
            // Get property details if not already included
            let property = application.property;
            if (!property && application.property_id) {
              const { fetchPropertyById } = await import('@/services/propertyService');
              property = await fetchPropertyById(application.property_id);
            }
            
            if (property) {
              const contractResult = await createContractFromApplication(application, property);
              
              if (contractResult.success) {
                toast.success(`Application approved and contract created! Contract ID: ${contractResult.contractId}`);
              } else {
                console.warn('Failed to create contract:', contractResult.message);
                toast.success(`Application approved successfully, but contract creation failed: ${contractResult.message}`);
              }
            } else {
              toast.success('Application approved successfully, but property details were not found for contract creation');
            }
          } catch (contractError) {
            console.error('Error creating contract:', contractError);
            toast.success('Application approved successfully, but there was an issue creating the contract');
          }
        }
      } else {
        toast.success(`Application ${status} successfully`);
      }
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status }
            : app
        )
      );

    } catch (error) {
      console.error('Failed to update application status:', error);
      toast.error('Failed to update application status');
    }
  };

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage tenant applications</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate('/dashboard/landlord/contracts')}
            variant="outline"
            className="flex items-center"
          >
            <FileSignature className="h-4 w-4 mr-2" />
            View Contracts
          </Button>
          <Button 
            variant="outline" 
            onClick={loadApplications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total === 0 ? 'No applications received' : 'Total received'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending === 0 ? 'No pending applications' : 'Awaiting review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
            <p className="text-xs text-muted-foreground">
              {stats.under_review === 0 ? 'None under review' : 'Being reviewed'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved === 0 ? 'No approved applications' : 'Successfully approved'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {stats.rejected === 0 ? 'No rejected applications' : 'Applications rejected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <ApplicationsList
        applications={applications}
        loading={loading}
        onViewDetails={handleViewDetails}
        onUpdateStatus={handleUpdateStatus}
        onMessageApplicant={handleMessageApplicant}
        onViewContract={handleViewContract}
      />

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}