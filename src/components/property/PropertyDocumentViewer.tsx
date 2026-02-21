// =====================================================
// Property Document Viewer (Buyer Side)
// =====================================================
// Purpose: Display property documents to buyers with
//          request access functionality for private docs
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, FileText, Download, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { getPropertyDocuments } from "@/services/propertyDocumentService";
import { DocumentAccessRequestModal } from "./DocumentAccessRequestModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PropertyDocument } from "@/types/propertyCategories";

interface PropertyDocumentViewerProps {
  propertyId: string;
  propertyAddress: string;
  className?: string;
}

interface PropertyAccessStatus {
  hasAccess: boolean;
  status: 'none' | 'pending' | 'approved' | 'denied';
  requestId?: string;
}

export function PropertyDocumentViewer({
  propertyId,
  propertyAddress,
  className = "",
}: PropertyDocumentViewerProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<PropertyAccessStatus>({
    hasAccess: false,
    status: 'none'
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, [propertyId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      console.log('📄 PropertyDocumentViewer: Starting to load documents for property:', propertyId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      console.log('👤 Current user:', user?.id);

      // Get all documents for this property
      const docs = await getPropertyDocuments(propertyId);
      console.log('📦 Documents fetched:', docs.length, docs);

      // If user is logged in, check request status for private documents
      if (user) {
        const privateDocIds = docs.filter(d => !d.is_public).map(d => d.id);
        console.log('🔒 Private document IDs:', privateDocIds);
        
        if (privateDocIds.length > 0) {
          const { data: requests } = await supabase
            .from('document_access_requests' as any)
            .select('document_id, status, id')
            .eq('requester_id', user.id)
            .in('document_id', privateDocIds);

          console.log('📋 Access requests:', requests);

          const requestMap = new Map(
            requests?.map((r: any) => [r.document_id, { status: r.status, id: r.id }]) || []
          );

          const docsWithStatus = docs.map(doc => ({
            ...doc,
            requestStatus: doc.is_public 
              ? 'none' 
              : (requestMap.get(doc.id)?.status as any || 'none'),
            requestId: requestMap.get(doc.id)?.id,
          }));

          console.log('✅ Documents with status:', docsWithStatus);
          setDocuments(docsWithStatus);
        } else {
          setDocuments(docs.map(d => ({ ...d, requestStatus: 'none' as const })));
        }
      } else {
        setDocuments(docs.map(d => ({ ...d, requestStatus: 'none' as const })));
      }
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
      toast.error('Failed to load property documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = (doc: DocumentWithRequestStatus) => {
    if (!userId) {
      toast.error('Please log in to request document access');
      return;
    }
    setSelectedDocument(doc);
    setShowRequestModal(true);
  };

  const handleDownload = async (doc: DocumentWithRequestStatus) => {
    try {
      // For approved private documents, get a signed URL
      if (!doc.is_public && doc.requestStatus === 'approved') {
        // Extract the file path from the URL
        const urlParts = doc.file_url.split('/property-documents/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          
          // Get signed URL from Supabase
          const { data, error } = await supabase.storage
            .from('property-documents')
            .createSignedUrl(filePath, 60); // 60 seconds expiry
          
          if (error) throw error;
          if (!data?.signedUrl) throw new Error('Failed to generate signed URL');
          
          // Download using signed URL
          const response = await fetch(data.signedUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.file_name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Document downloaded');
          return;
        }
      }
      
      // For public documents, use direct URL
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const getActionButton = (doc: DocumentWithRequestStatus) => {
    // Public documents - anyone can view/download
    if (doc.is_public) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(doc.file_url, '_blank')}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleDownload(doc)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      );
    }

    // Private documents - check request status
    switch (doc.requestStatus) {
      case 'approved':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  // Extract file path and get signed URL
                  const urlParts = doc.file_url.split('/property-documents/');
                  if (urlParts.length === 2) {
                    const filePath = urlParts[1];
                    const { data, error } = await supabase.storage
                      .from('property-documents')
                      .createSignedUrl(filePath, 60);
                    
                    if (error) throw error;
                    if (data?.signedUrl) {
                      window.open(data.signedUrl, '_blank');
                    }
                  }
                } catch (error) {
                  console.error('Failed to open document:', error);
                  toast.error('Failed to open document');
                }
              }}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload(doc)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        );
      
      case 'pending':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            Request Pending
          </Button>
        );
      
      case 'denied':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRequestAccess(doc)}
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Request Denied - Try Again
          </Button>
        );
      
      default: // 'none'
        return (
          <Button
            size="sm"
            onClick={() => handleRequestAccess(doc)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            Request Access
          </Button>
        );
    }
  };

  const getStatusBadge = (doc: DocumentWithRequestStatus) => {
    if (doc.is_public) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Public</Badge>;
    }

    switch (doc.requestStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Access Granted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Denied</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Private</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded" />
            <div className="h-20 bg-slate-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    // Show empty state for sales listings
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Property Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-600 font-medium">No documents available yet</p>
            <p className="text-xs text-slate-500 mt-1">
              The seller hasn't uploaded any property documents
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Property Documents
            <Badge variant="secondary">{documents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{doc.document_label}</h4>
                    {getStatusBadge(doc)}
                  </div>
                  <p className="text-xs text-slate-600">
                    {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {getActionButton(doc)}
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800">
              <Lock className="h-3 w-3 inline mr-1" />
              Private documents require seller approval before viewing. Your request will be reviewed by the property owner.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Request Access Modal */}
      {selectedDocument && (
        <DocumentAccessRequestModal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedDocument(null);
          }}
          documentId={selectedDocument.id}
          documentLabel={selectedDocument.document_label}
          propertyId={propertyId}
          propertyAddress={propertyAddress}
          onRequestSent={() => {
            loadDocuments(); // Reload to update status
          }}
        />
      )}
    </>
  );
}
