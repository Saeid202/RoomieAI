import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  Phone,
  Mail,
  Briefcase,
  Download,
  FileText,
  MessageSquare,
  FileSignature
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RentalApplication } from '@/services/rentalApplicationService';
import { toast } from 'sonner';

interface ApplicationsListProps {
  applications: any[];
  loading: boolean;
  onViewDetails: (application: any) => void;
  onUpdateStatus: (applicationId: string, status: string) => void;
  onMessageApplicant?: (application: any) => void;
  onViewContract?: (application: any) => void;
}

export function ApplicationsList({ 
  applications, 
  loading, 
  onViewDetails, 
  onUpdateStatus,
  onMessageApplicant,
  onViewContract 
}: ApplicationsListProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.property?.listing_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || app.property_id === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  // Get unique properties for filter dropdown
  const uniqueProperties = [...new Map(
    applications.map(app => [app.property_id, app.property])
  ).values()];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Withdrawn' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Mock function to handle document downloads
  const handleDownloadDocument = (application: any, documentType: string) => {
    // In a real app, this would fetch and download the actual document
    toast.info(`Downloading ${documentType} for ${application.full_name}...`);
    console.log(`Downloading ${documentType} for application ${application.id}`);
  };

  // Mock function to get document count for an application
  const getDocumentCount = (application: any) => {
    // In a real app, this would come from the application data
    return Math.floor(Math.random() * 5) + 1; // Mock: 1-5 documents
  };

  // Function to check if contract button should be shown
  const shouldShowContractButton = (application: any) => {
    // Show contract button if:
    // 1. Application has contract status data (contract exists)
    // 2. OR application is approved (ready for contract)
    // In a real app, this would check the actual contract status
    return application.contract_status || application.status === 'approved';
  };

  // Function to get contract button text and variant
  const getContractButtonProps = (application: any) => {
    // Handle withdrawn/rejected applications
    if (application.status === 'withdrawn' || application.status === 'rejected') {
      return {
        text: 'View Contract',
        variant: 'outline' as const,
        className: 'text-gray-500 border-gray-300',
        disabled: false
      };
    }

    // If no contract status data, show "Create Contract" for approved applications
    if (!application.contract_status) {
      if (application.status === 'approved') {
        return {
          text: 'Create Contract',
          variant: 'default' as const,
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
          disabled: false
        };
      } else {
        return {
          text: 'View Contract',
          variant: 'outline' as const,
          className: '',
          disabled: false
        };
      }
    }

    // If contract exists, check signing status
    if (application.contract_status.landlord_signed) {
      return {
        text: 'Contract Signed',
        variant: 'outline' as const,
        className: 'text-green-600 border-green-200',
        disabled: true
      };
    } else if (application.contract_status.applicant_signed) {
      return {
        text: 'Sign Contract',
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
        disabled: false
      };
    } else {
      return {
        text: 'View Contract',
        variant: 'outline' as const,
        className: '',
        disabled: false
      };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by applicant or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {uniqueProperties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.listing_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {applications.length === 0 
                  ? "You haven't received any rental applications yet."
                  : "No applications match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header with applicant name and status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{application.full_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {application.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {application.phone || 'No phone provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Applicant Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Applicant Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Occupation:</strong> {application.occupation || 'Not specified'}</span>
                      </div>
                      {application.employer && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span><strong>Employer:</strong> {application.employer}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Monthly Income:</strong> ${application.monthly_income?.toLocaleString() || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Applied:</strong> {formatDate(application.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Property Details
                    </h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={(application.property?.images && application.property.images[0]) ? application.property.images[0] : "/placeholder.svg"}
                        alt={`${application.property?.listing_title || 'Property'} photo`}
                        className="h-16 w-24 object-cover rounded border"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{application.property?.listing_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {application.property?.address}, {application.property?.city}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          ${application.property?.monthly_rent?.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents & Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents ({getDocumentCount(application)})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(application, 'Income Verification')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Income
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(application, 'Employment Letter')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Employment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(application, 'Reference Letters')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        References
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(application, 'Credit Report')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Credit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional info and actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {application.move_in_date && (
                      <span><strong>Preferred Move-in:</strong> {new Date(application.move_in_date).toLocaleDateString()}</span>
                    )}
                    {application.lease_duration && (
                      <span className="ml-4"><strong>Lease Duration:</strong> {application.lease_duration}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {onMessageApplicant && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMessageApplicant(application)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    )}
                    
                    {/* Contract Button - Show for all applications (for testing) */}
                    {onViewContract && (
                      (() => {
                        const contractProps = getContractButtonProps(application);
                        return (
                          <Button
                            variant={contractProps.variant}
                            size="sm"
                            className={contractProps.className}
                            disabled={contractProps.disabled}
                            onClick={() => onViewContract(application)}
                          >
                            <FileSignature className="h-4 w-4 mr-1" />
                            {contractProps.text}
                          </Button>
                        );
                      })()
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Full Details
                    </Button>
                    
                    {application.status === 'pending' || application.status === 'under_review' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => onUpdateStatus(application.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => onUpdateStatus(application.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredApplications.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </div>
  );
}
