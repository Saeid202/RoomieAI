import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Zap
} from 'lucide-react';
import { getApplicationDocuments, RentalDocument } from '@/services/rentalDocumentService';
import { getTenantProfileForLandlord, getTenantDocumentUrl, TenantProfileView } from '@/services/tenantProfileViewService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ApplicationDetailModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, status: string, notes?: string) => void;
}

export function ApplicationDetailModal({ 
  application, 
  isOpen, 
  onClose, 
  onUpdateStatus 
}: ApplicationDetailModalProps) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<TenantProfileView | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (isOpen && application?.id) {
      loadDocuments();
      loadTenantProfile();
    }
  }, [isOpen, application?.id]);

  // Add state to track active tab
  const [activeTab, setActiveTab] = useState("overview");

  // Load documents when Documents tab is selected
  useEffect(() => {
    if (activeTab === "documents" && application?.id) {
      console.log("Documents tab selected, loading documents...");
      loadDocuments();
    }
  }, [activeTab, application?.id]);

  const loadDocuments = async () => {
    if (!application?.id) {
      console.log('No application ID provided');
      return;
    }
    
    try {
      setLoadingDocuments(true);
      console.log('Loading documents for application:', application.id);
      console.log('Application details:', application);
      const docs = await getApplicationDocuments(application.id);
      console.log('Documents loaded:', docs);
      console.log('Document count:', docs.length);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      console.error('Error details:', error);
      toast.error(`Failed to load application documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadTenantProfile = async () => {
    if (!application?.applicant_id) {
      console.log('No applicant ID provided');
      return;
    }
    
    try {
      setLoadingProfile(true);
      console.log('Loading tenant profile for:', application.applicant_id);
      const profile = await getTenantProfileForLandlord(application.applicant_id);
      console.log('Tenant profile loaded:', profile);
      setTenantProfile(profile);
    } catch (error) {
      console.error('Failed to load tenant profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      toast.info(`Downloading ${fileName}...`);
      
      // Get signed URL
      const url = await getTenantDocumentUrl(filePath);
      if (!url) {
        toast.error('Failed to get document URL');
        return;
      }

      // Fetch the file as blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleApprove = () => {
    onUpdateStatus(application.id, 'approved');
    onClose();
    toast.success('Application approved successfully!');
  };

  const handleReject = () => {
    if (!rejectionNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onUpdateStatus(application.id, 'rejected', rejectionNotes);
    onClose();
    setShowRejectionForm(false);
    setRejectionNotes('');
    toast.success('Application rejected');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', label: 'Withdrawn' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter(doc => doc.document_type === type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentSection = ({ title, type, icon: Icon }: { title: string; type: string; icon: any }) => {
    const typeDocs = getDocumentsByType(type);
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4" />
            {title}
            <Badge variant="secondary">{typeDocs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {typeDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {typeDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-48">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size_bytes)} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.storage_url, '_blank')}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.storage_url;
                        link.download = doc.original_filename;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success(`Downloading ${doc.original_filename}`);
                      }}
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{application.full_name}</h2>
                <p className="text-sm text-muted-foreground">{application.property?.listing_title}</p>
              </div>
            </div>
            {getStatusBadge(application.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">
              <div className="flex items-center gap-1">
                Profile
                {tenantProfile && <Zap className="h-3 w-3 text-indigo-600" />}
              </div>
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.occupation}</span>
                  </div>
                  {application.employer && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.employer}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      ${application.monthly_income?.toLocaleString()}/month
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Applied</p>
                    <p className="text-sm font-medium">{new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
                  {application.move_in_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Move-in</p>
                      <p className="text-sm font-medium">{new Date(application.move_in_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {application.lease_duration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Lease Duration</p>
                      <p className="text-sm font-medium">{application.lease_duration}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Pet Ownership</p>
                    <p className="text-sm font-medium">{application.pet_ownership ? 'Yes' : 'No'}</p>
                  </div>
                  {application.smoking_status && (
                    <div>
                      <p className="text-sm text-muted-foreground">Smoking</p>
                      <p className="text-sm font-medium capitalize">{application.smoking_status}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            {(application.emergency_contact_name || application.emergency_contact_phone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {application.emergency_contact_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{application.emergency_contact_name}</p>
                    </div>
                  )}
                  {application.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{application.emergency_contact_phone}</p>
                    </div>
                  )}
                  {application.emergency_contact_relation && (
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="text-sm font-medium">{application.emergency_contact_relation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {application.additional_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{application.additional_info}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* NEW: Profile Tab - Shows tenant's complete profile */}
          <TabsContent value="profile" className="space-y-6">
            {loadingProfile ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading profile...</p>
              </div>
            ) : tenantProfile ? (
              <>
                {/* Quick Apply Badge */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-indigo-900">Quick Apply Profile</p>
                    <p className="text-sm text-indigo-700">This applicant used their profile for instant application</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Profile Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tenantProfile.reference_letters && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Reference Letters</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                const url = await getTenantDocumentUrl(tenantProfile.reference_letters!);
                                if (url) window.open(url, '_blank');
                              }}
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadDocument(tenantProfile.reference_letters!, 'reference_letters.pdf')}
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {tenantProfile.employment_letter && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Employment Letter</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                const url = await getTenantDocumentUrl(tenantProfile.employment_letter!);
                                if (url) window.open(url, '_blank');
                              }}
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadDocument(tenantProfile.employment_letter!, 'employment_letter.pdf')}
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {tenantProfile.credit_score_report && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Credit Score Report</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                const url = await getTenantDocumentUrl(tenantProfile.credit_score_report!);
                                if (url) window.open(url, '_blank');
                              }}
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadDocument(tenantProfile.credit_score_report!, 'credit_score_report.pdf')}
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {!tenantProfile.reference_letters && !tenantProfile.employment_letter && !tenantProfile.credit_score_report && (
                        <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Additional Profile Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tenantProfile.age && (
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="text-sm font-medium">{tenantProfile.age} years old</p>
                        </div>
                      )}
                      {tenantProfile.nationality && (
                        <div>
                          <p className="text-sm text-muted-foreground">Nationality</p>
                          <p className="text-sm font-medium">{tenantProfile.nationality}</p>
                        </div>
                      )}
                      {tenantProfile.preferred_location && (
                        <div>
                          <p className="text-sm text-muted-foreground">Preferred Location</p>
                          <p className="text-sm font-medium">{tenantProfile.preferred_location}</p>
                        </div>
                      )}
                      {tenantProfile.budget_range && (
                        <div>
                          <p className="text-sm text-muted-foreground">Budget Range</p>
                          <p className="text-sm font-medium">{tenantProfile.budget_range}</p>
                        </div>
                      )}
                      {tenantProfile.housing_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Housing Type Preference</p>
                          <p className="text-sm font-medium capitalize">{tenantProfile.housing_type}</p>
                        </div>
                      )}
                      {tenantProfile.pet_preference && (
                        <div>
                          <p className="text-sm text-muted-foreground">Pet Preference</p>
                          <p className="text-sm font-medium">{tenantProfile.pet_preference}</p>
                        </div>
                      )}
                      {tenantProfile.smoking && (
                        <div>
                          <p className="text-sm text-muted-foreground">Smoking</p>
                          <p className="text-sm font-medium">{tenantProfile.smoking}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No profile data available</p>
                <p className="text-xs text-muted-foreground mt-1">This applicant may have used the standard application form</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {loadingDocuments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : (
              <>
                {/* Download All Button */}
                {documents.length > 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        documents.forEach((doc, index) => {
                          setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = doc.storage_url;
                            link.download = doc.original_filename;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }, index * 500); // Stagger downloads
                        });
                        toast.success(`Downloading ${documents.length} documents...`);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All Documents
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentSection title="Reference Letters" type="reference" icon={FileText} />
                  <DocumentSection title="Employment Documents" type="employment" icon={Briefcase} />
                  <DocumentSection title="Credit Reports" type="credit" icon={DollarSign} />
                  <DocumentSection title="Additional Documents" type="additional" icon={FileText} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="property" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{application.property?.listing_title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.property?.address}, {application.property?.city}, {application.property?.state}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="text-lg font-semibold">${application.property?.monthly_rent?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {application.status === 'pending' || application.status === 'under_review' ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Approve Application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Approve this application to move forward with the rental process.
                    </p>
                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">Reject Application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Reject this application with a reason for the applicant.
                    </p>
                    {!showRejectionForm ? (
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setShowRejectionForm(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Please provide a reason for rejection..."
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleReject}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirm Rejection
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowRejectionForm(false);
                              setRejectionNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    This application has been {application.status}. No further actions are available.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
