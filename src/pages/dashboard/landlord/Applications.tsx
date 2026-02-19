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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      console.log('🔄 Loading landlord applications...');
      setLoading(true);
      setError(null);
      
      const data = await getLandlordApplications();
      console.log('✅ Applications loaded:', data?.length || 0);
      
      setApplications(data || []);
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No applications found for this landlord');
      }
    } catch (error) {
      console.error('❌ Failed to load applications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
      setError(errorMessage);
      toast.error(errorMessage);
      setApplications([]);
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
      console.log('Viewing/Creating contract for application:', application.id);

      // Navigate to contract page which handles creation if needed
      navigate(`/dashboard/contracts/${application.id}`);
      // toast.success('Contract opened successfully');

    } catch (error) {
      console.error('Failed to open contract:', error);
      toast.error(`Could not open contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await updateApplicationStatus(applicationId, status as any);

      // If application is approved, notify landlord to create contract
      if (status === 'approved') {
        toast.success(`Application approved! Please proceed to create the contract.`);
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

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Applications</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadApplications}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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