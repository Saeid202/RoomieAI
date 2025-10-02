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
  Eye
} from 'lucide-react';
import { getApplicationDocuments, RentalDocument } from '@/services/rentalDocumentService';
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

  useEffect(() => {
    if (isOpen && application?.id) {
      loadDocuments();
    }
  }, [isOpen, application?.id]);

  const loadDocuments = async () => {
    if (!application?.id) return;
    
    try {
      setLoadingDocuments(true);
      console.log('Loading documents for application:', application.id);
      const docs = await getApplicationDocuments(application.id);
      console.log('Documents loaded:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error(`Failed to load application documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDocuments(false);
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
                    >
                      <Eye className="h-4 w-4" />
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

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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

          <TabsContent value="documents" className="space-y-4">
            {loadingDocuments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentSection title="Reference Letters" type="reference" icon={FileText} />
                <DocumentSection title="Employment Documents" type="employment" icon={Briefcase} />
                <DocumentSection title="Credit Reports" type="credit" icon={DollarSign} />
                <DocumentSection title="Additional Documents" type="additional" icon={FileText} />
              </div>
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
