import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Clock, CheckCircle, XCircle, RefreshCw, FileSignature, Lock } from "lucide-react";
import { getLandlordApplications, updateApplicationStatus } from "@/services/rentalApplicationService";
import { ApplicationsList } from "@/components/landlord/ApplicationsList";
import { ApplicationDetailModal } from "@/components/landlord/ApplicationDetailModal";
import { DocumentAccessRequestCard } from "@/components/landlord/DocumentAccessRequestCard";
import { getPropertyAccessRequests } from "@/services/propertyDocumentService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MessagingService } from "@/services/messagingService";
import { supabase } from "@/integrations/supabase/client";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rental' | 'sales'>('rental');
  const [documentRequests, setDocumentRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (activeTab === 'sales') {
      loadDocumentRequests();
    }
  }, [activeTab]);

  const loadDocumentRequests = async () => {
    try {
      setLoadingRequests(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Loading document requests for user:', user?.id);
      
      if (!user) {
        console.log('❌ No user found');
        return;
      }

      // Get all properties owned by this landlord
      const { data: properties, error: propsError } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_category', 'sale');

      console.log('📦 Sales properties found:', properties?.length || 0, properties);
      
      if (propsError) {
        console.error('❌ Error fetching properties:', propsError);
        throw propsError;
      }

      if (!properties || properties.length === 0) {
        console.log('ℹ️ No sales properties found for this user');
        setDocumentRequests([]);
        return;
      }

      // Get all document requests for these properties
      const propertyIds = properties.map(p => p.id);
      console.log('🔑 Property IDs to check:', propertyIds);
      
      const { data: requests, error: reqError } = await supabase
        .from('document_access_requests')
        .select(`
          *,
          property:properties!property_id(address, listing_title)
        `)
        .in('property_id', propertyIds)
        .order('requested_at', { ascending: false });

      console.log('📨 Document requests found:', requests?.length || 0, requests);
      
      if (reqError) {
        console.error('❌ Error fetching requests:', reqError);
        throw reqError;
      }

      setDocumentRequests(requests || []);
    } catch (error) {
      console.error('❌ Failed to load document requests:', error);
      toast.error('Failed to load document access requests');
    } finally {
      setLoadingRequests(false);
    }
  };

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

  // Filter applications by category
  const rentalApplications = applications.filter(app => 
    app.property?.listing_category === 'rental' || !app.property?.listing_category
  );
  const salesApplications = applications.filter(app => 
    app.property?.listing_category === 'sale'
  );

  // Calculate stats for active tab
  const activeApplications = activeTab === 'rental' ? rentalApplications : salesApplications;
  const activeStats = {
    total: activeApplications.length,
    pending: activeApplications.filter(app => app.status === 'pending').length,
    under_review: activeApplications.filter(app => app.status === 'under_review').length,
    approved: activeApplications.filter(app => app.status === 'approved').length,
    rejected: activeApplications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage tenant applications</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'rental' && (
            <Button
              onClick={() => navigate('/dashboard/landlord/contracts')}
              variant="outline"
              className="flex items-center"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              View Contracts
            </Button>
          )}
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rental' | 'sales')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl border-2 border-blue-200 shadow-sm">
          <TabsTrigger 
            value="rental" 
            className="flex items-center gap-2 h-full text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <FileText className="h-5 w-5" />
            Rental Applications
            {rentalApplications.length > 0 && (
              <Badge variant="secondary" className="ml-1 data-[state=active]:bg-white data-[state=active]:text-blue-700">{rentalApplications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className="flex items-center gap-2 h-full text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <Users className="h-5 w-5" />
            Sales Inquiries
            {salesApplications.length > 0 && (
              <Badge variant="secondary" className="ml-1 data-[state=active]:bg-white data-[state=active]:text-purple-700">{salesApplications.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total {activeTab === 'rental' ? 'Applications' : 'Inquiries'}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStats.total === 0 ? 'No applications received' : 'Total received'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{activeStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStats.pending === 0 ? 'No pending applications' : 'Awaiting review'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeStats.under_review}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStats.under_review === 0 ? 'None under review' : 'Being reviewed'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeStats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStats.approved === 0 ? 'No approved applications' : 'Successfully approved'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{activeStats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStats.rejected === 0 ? 'No rejected applications' : 'Applications rejected'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <ApplicationsList
            applications={activeApplications}
            loading={loading}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
            onMessageApplicant={handleMessageApplicant}
            onViewContract={activeTab === 'rental' ? handleViewContract : undefined}
          />

          {/* Document Access Requests (Sales Tab Only) */}
          {activeTab === 'sales' && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Document Access Requests</h2>
                  {documentRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {documentRequests.length}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDocumentRequests}
                  disabled={loadingRequests}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loadingRequests ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : documentRequests.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="p-8 text-center">
                    <Lock className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-1">No Document Requests</h3>
                    <p className="text-sm text-slate-600">
                      When buyers request access to private documents, they'll appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentRequests.map((request) => (
                    <DocumentAccessRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={loadDocumentRequests}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

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