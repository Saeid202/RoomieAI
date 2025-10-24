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
  Trash2
} from "lucide-react";

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
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
      const data = await getUserApplications();
      setApplications(data);
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
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">My Applications</h1>
                <p className="text-blue-100 text-lg">Track your rental applications and continue the process</p>
              </div>
              <Button 
                onClick={load} 
                variant="secondary" 
                size="lg"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard title="Total" value={stats.total} icon={FileText} gradient="from-blue-500 to-blue-600" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} gradient="from-yellow-500 to-orange-500" />
          <StatCard title="Under Review" value={stats.underReview} icon={Eye} gradient="from-indigo-500 to-purple-500" />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle} gradient="from-green-500 to-emerald-500" />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} gradient="from-red-500 to-pink-500" />
        </div>

        {/* Enhanced Search and Filter */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Search property, city, state..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-56 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="all" className="text-lg">All Status</SelectItem>
                  <SelectItem value="pending" className="text-lg">Pending</SelectItem>
                  <SelectItem value="under_review" className="text-lg">Under Review</SelectItem>
                  <SelectItem value="approved" className="text-lg">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-lg">Rejected</SelectItem>
                  <SelectItem value="withdrawn" className="text-lg">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
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
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-[1.02] transform">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {application.property?.listing_title || 'Property Application'}
              </h3>
              <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{application.property?.city}, {application.property?.state}</span>
              </div>
              <div className="flex items-center gap-6 text-base">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-700 text-lg">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-800">Applicant</span>
            </div>
            <p className="text-lg text-gray-900 font-bold mb-1">{application.full_name}</p>
            <p className="text-sm text-gray-600">{application.email}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-800">Occupation</span>
            </div>
            <p className="text-lg text-gray-900 font-bold mb-1">{application.occupation}</p>
            <p className="text-sm text-gray-600">
              {application.monthly_income ? 
                new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(application.monthly_income) 
                : 'N/A'
              }/month
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-800">Move-in Date</span>
            </div>
            <p className="text-lg text-gray-900 font-bold mb-1">
              {application.move_in_date ? new Date(application.move_in_date).toLocaleDateString() : 'Not specified'}
            </p>
            <p className="text-sm text-gray-600">
              {application.lease_duration || 'Lease duration not specified'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onViewDetails(application)}
              className="flex items-center gap-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 rounded-xl px-6 py-3"
            >
              <Eye className="h-5 w-5" />
              View Details
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onContinue(application)}
              className="flex items-center gap-3 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all duration-300 rounded-xl px-6 py-3"
            >
              <Edit className="h-5 w-5" />
              Edit Application
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onContinue(application)}
              className="flex items-center gap-3 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all duration-300 rounded-xl px-6 py-3"
            >
              <ChevronRight className="h-5 w-5" />
              Continue
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {application.status !== 'withdrawn' && application.status !== 'approved' && application.status !== 'rejected' && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onWithdraw(application.id)}
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-300 rounded-xl px-6 py-3"
              >
                <Trash2 className="h-5 w-5 mr-2" />
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

function StatCard({ title, value, icon: Icon, className = "", gradient = "from-blue-500 to-blue-600" }: { title: string; value: number; icon?: any; className?: string; gradient?: string }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg`}>
            {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className={`text-3xl font-bold ${className}`}>{value}</div>
          </div>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`} style={{ width: `${Math.min((value / Math.max(value, 1)) * 100, 100)}%` }}></div>
        </div>
      </CardContent>
    </Card>
  );
}