import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserApplications, updateApplicationStatus } from "@/services/rentalApplicationService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getUserContracts } from "@/services/ontarioLeaseService";
import { printOntarioLease } from "@/utils/printLease";
import { OntarioLeaseContract } from "@/types/ontarioLease";
import {
  FileText,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  MapPin,
  DollarSign,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  FileImage,
  File,
  Edit,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter
} from "lucide-react";


export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [contracts, setContracts] = useState<OntarioLeaseContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [appsData, contractsData] = await Promise.all([
        getUserApplications(),
        getUserContracts()
      ]);
      setApplications(appsData);
      setContracts(contractsData);
    } catch (e) {
      console.error("Load failed", e);
      toast.error("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const continueFlow = (app: any) => {
    const currentStep = app.current_step || 1;
    const targetStep = Math.min(currentStep + 1, 5);

    // Navigate with step and applicationId parameters
    navigate(`/dashboard/rental-application/${app.property_id}?step=${targetStep}&applicationId=${app.id}`);
  };

  const withdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("🔄 Withdrawing application:", appId);
      await updateApplicationStatus(appId, 'withdrawn');
      console.log("✅ Database update successful");

      // Remove from list instead of updating status
      setApplications(prev => {
        const filtered = prev.filter(a => a.id !== appId);
        console.log("🗑️ Removed from list. Remaining applications:", filtered.length);
        return filtered;
      });

      toast.success("Application withdrawn successfully");

      // Force reload to ensure consistency
      setTimeout(() => {
        console.log("🔄 Reloading applications to ensure consistency");
        load();
      }, 1000);

    } catch (e) {
      console.error("❌ Withdraw failed:", e);
      toast.error("Failed to withdraw application. Please try again.");
    }
  };

  const openApplicationDetails = (application: any) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const downloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filtered = applications.filter((a) => {
    const matchesSearch = !search ||
      a.property?.listing_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.property?.city?.toLowerCase().includes(search.toLowerCase()) ||
      a.property?.state?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || a.status === status;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="space-y-8 p-6">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-sm text-muted-foreground">Track and manage your rental journey</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Compact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-slate-100 p-1.5 rounded text-slate-600">
                <FileText className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-lg font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-1.5 rounded text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Reviewing</p>
                <p className="text-lg font-bold text-indigo-600">{stats.underReview}</p>
              </div>
              <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                <Eye className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Approved</p>
                <p className="text-lg font-bold text-emerald-600">{stats.approved}</p>
              </div>
              <div className="bg-emerald-100 p-1.5 rounded text-emerald-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Rejected</p>
                <p className="text-lg font-bold text-rose-600">{stats.rejected}</p>
              </div>
              <div className="bg-rose-100 p-1.5 rounded text-rose-600">
                <XCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-white/50 backdrop-blur-sm rounded-xl">
            <TabsTrigger
              value="applications"
              className="rounded-lg text-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all duration-300"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="rounded-lg text-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-300"
            >
              My Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4 animate-in slide-in-from-left-4 duration-500">
            {/* Compact Search and Filter */}
            <Card className="border shadow-sm bg-white mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="Search property, city, state..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 rounded-md transition-all duration-300 hover:border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-9 text-sm border-gray-200 focus:border-blue-500 rounded-md">
                        <div className="flex items-center gap-2">
                          <Filter className="h-3.5 w-3.5 text-gray-500" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Application List */}
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="py-16 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Applications Found</h3>
                    <p className="text-lg text-gray-600 mb-6">Your submitted applications will appear here.</p>
                    <Button
                      onClick={() => navigate('/dashboard/rental-options')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((application) => (
                  <ProfessionalApplicationCard
                    key={application.id}
                    application={application}
                    onViewDetails={openApplicationDetails}
                    onWithdraw={withdraw}
                    onContinue={continueFlow}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {contracts.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Contracts Found</h3>
                  <p className="text-lg text-gray-600 mb-6">Signed lease agreements will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onDownload={(c) => printOntarioLease(c)}
                  onSign={(c) => navigate(`/dashboard/contracts/${c.application_id}`)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Application Details Modal */}
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onDownloadDocument={downloadDocument}
          />
        )}
      </div>
    </div>
  );
}

function ProfessionalApplicationCard({
  application,
  onViewDetails,
  onWithdraw,
  onContinue
}: {
  application: any;
  onViewDetails: (app: any) => void;
  onWithdraw: (id: string) => void;
  onContinue: (app: any) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'withdrawn':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white transform">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-sm">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                {application.property?.listing_title || 'Property Application'}
              </h3>
              <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{application.property?.city}, {application.property?.state}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-bold text-green-700">
                    {application.property?.monthly_rent ?
                      new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(application.property.monthly_rent)
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Applied {new Date(application.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(application.status)}
            <StatusBadge status={application.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md p-2 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-500 p-1 rounded">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Applicant</span>
            </div>
            <p className="text-xs text-gray-900 font-bold truncate">{application.full_name}</p>
            <p className="text-[10px] text-gray-600 truncate">{application.email}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-md p-2 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-green-500 p-1 rounded">
                <Briefcase className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Occupation</span>
            </div>
            <p className="text-xs text-gray-900 font-bold truncate">{application.occupation}</p>
            <p className="text-[10px] text-gray-600">
              {application.monthly_income ?
                new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(application.monthly_income)
                : 'N/A'
              }/mo
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-md p-2 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-purple-500 p-1 rounded">
                <Calendar className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Move-in</span>
            </div>
            <p className="text-xs text-gray-900 font-bold">
              {application.move_in_date ? new Date(application.move_in_date).toLocaleDateString() : 'Not set'}
            </p>
            <p className="text-[10px] text-gray-600 truncate">
              {application.lease_duration || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(application)}
              className="h-8 text-xs flex items-center gap-1.5 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded px-3"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContinue(application)}
              className="h-8 text-xs flex items-center gap-1.5 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 rounded px-3"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContinue(application)}
              className="h-8 text-xs flex items-center gap-1.5 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 rounded px-3"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Continue
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {application.status !== 'withdrawn' && application.status !== 'approved' && application.status !== 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(application.id)}
                className="h-8 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100 rounded px-3"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Withdraw
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  onDownloadDocument
}: {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onDownloadDocument: (url: string, filename: string) => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderDocuments = (documents: any[], title: string) => {
    if (!documents || documents.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">No {title.toLowerCase()} uploaded</div>
      );
    }

    return (
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getFileIcon(doc.url || doc)}
              <span className="text-sm font-medium">
                {doc.name || `Document ${index + 1}`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadDocument(doc.url || doc, doc.name || `document_${index + 1}`)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            Application Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={application.status} />
                    <span className="text-sm text-gray-600">
                      Applied on {formatDate(application.created_at)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-mono text-xs">{application.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-mono text-xs">{application.property_id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rental Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Move-in Date:</span>
                    <span>{application.move_in_date ? formatDate(application.move_in_date) : 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Duration:</span>
                    <span>{application.lease_duration || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pet Ownership:</span>
                    <span>{application.pet_ownership ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Smoking Status:</span>
                    <span>{application.smoking_status || 'Not specified'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">{application.full_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span>{application.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span>{application.phone}</span>
                  </div>
                  {application.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>Born {formatDate(application.date_of_birth)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">{application.occupation}</span>
                  </div>
                  {application.employer && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-600" />
                      <span>{application.employer}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span>Monthly Income: {formatCurrency(application.monthly_income)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {application.emergency_contact_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span>{application.emergency_contact_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{application.emergency_contact_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Relation:</span>
                    <span>{application.emergency_contact_relation}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reference Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDocuments(application.reference_documents || [], 'Reference Documents')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employment Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDocuments(application.employment_documents || [], 'Employment Documents')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credit Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDocuments(application.credit_documents || [], 'Credit Documents')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDocuments(application.additional_documents || [], 'Additional Documents')}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="property" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">{application.property?.listing_title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{application.property?.city}, {application.property?.state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {application.property?.monthly_rent ?
                      formatCurrency(application.property.monthly_rent)
                      : 'Rent not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span>Property Type: {application.property?.property_type || 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    under_review: { label: 'Under Review', cls: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
    withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-800' },
  };
  const v = map[status] || map.pending;
  return <Badge className={`${v.cls}`}>{v.label}</Badge>;
}



interface ContractCardProps {
  contract: OntarioLeaseContract;
  onDownload: (c: OntarioLeaseContract) => void;
  onSign: (c: OntarioLeaseContract) => void;
}

function ContractCard({ contract, onDownload, onSign }: ContractCardProps) {
  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount || 0);

  const d = contract.ontario_form_data;
  const address = d ? `${d.streetNumber} ${d.streetName}` : (contract.property_address || 'Address N/A');
  const city = d?.cityTown || contract.property_city || '';
  const state = d?.province || contract.property_state || '';
  const rent = d?.totalRent || contract.monthly_rent || 0;
  const start = d?.tenancyStartDate || contract.lease_start_date;
  const end = d?.tenancyEndDate || contract.lease_end_date; // might be undefined for monthly
  const landlordName = d?.landlordLegalName || contract.landlord_name || 'Landlord';
  const landlordEmail = d?.landlordEmail || contract.landlord_email || 'N/A';

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'fully_signed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Signed & Active
          </Badge>
        );
      case 'pending_tenant_signature':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Action Required: Sign
          </Badge>
        );
      case 'pending_landlord_signature':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Waiting for Landlord
          </Badge>
        );
      default:
        return <Badge variant="outline">{contract.status.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                Lease Agreement - {address}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <MapPin className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium">{city}{state ? `, ${state}` : ''}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-bold text-green-700">
                    {formatMoney(Number(rent))}/mo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium">{formatDate(start as string)} {end ? `- ${formatDate(end as string)}` : '(Monthly)'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md p-2 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-500 p-1 rounded">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Landlord</span>
            </div>
            <p className="text-xs text-gray-900 font-bold truncate">{landlordName}</p>
            <p className="text-[10px] text-gray-600 truncate">{landlordEmail}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-md p-2 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-purple-500 p-1 rounded">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Duration</span>
            </div>
            <p className="text-xs text-gray-900 font-bold">{contract.lease_duration_months} Months</p>
            <p className="text-[10px] text-gray-600 truncate">
              {end ? `Expires ${formatDate(end as string)}` : 'Monthly'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-md p-2 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-orange-500 p-1 rounded">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800">Contract</span>
            </div>
            <p className="text-xs text-gray-900 font-bold">Standard 2229E</p>
            <p className="text-[10px] text-gray-600 truncate">
              ID: {contract.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSign(contract)}
            className="h-8 text-xs flex items-center gap-1.5 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 rounded px-3"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          {contract.status === 'pending_tenant_signature' && (
            <Button
              size="sm"
              onClick={() => onSign(contract)}
              className="h-8 text-xs flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded px-3 shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              Review & Sign
            </Button>
          )}
          {contract.status === 'fully_signed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(contract)}
              className="h-8 text-xs flex items-center gap-1.5 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 rounded px-3"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}