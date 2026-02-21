// Simplified Property Document Viewer with Single Access Request
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { getPropertyDocuments } from "@/services/propertyDocumentService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PropertyDocument } from "@/types/propertyCategories";

interface PropertyDocumentViewerProps {
  propertyId: string;
  propertyAddress: string;
  className?: string;
}

export function PropertyDocumentViewer({
  propertyId,
  propertyAddress,
  className = "",
}: PropertyDocumentViewerProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [userId, setUserId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, [propertyId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.id);
      setUserId(user?.id || null);

      const docs = await getPropertyDocuments(propertyId);
      console.log('📄 Documents loaded:', docs.length);
      setDocuments(docs);

      // Check property-level access status
      if (user) {
        console.log('🔍 Checking access status for property:', propertyId);
        console.log('👤 User ID:', user.id);
        
        try {
          // Use any type to bypass TypeScript type checking
          // The table exists in the database but not in the generated types
          const supabaseAny = supabase as any;
          
          // Get the most recent request (order by requested_at DESC, limit 1)
          const { data: accessRequests, error: accessError } = await supabaseAny
            .from('document_access_requests')
            .select('*')
            .eq('property_id', propertyId)
            .eq('requester_id', user.id)
            .order('requested_at', { ascending: false })
            .limit(1);

          console.log('📋 Raw query result - data:', accessRequests);
          console.log('📋 Raw query result - error:', accessError);

          if (accessError) {
            console.error('🚨 Supabase error details:', JSON.stringify({
              message: accessError.message,
              details: accessError.details,
              hint: accessError.hint,
              code: accessError.code
            }, null, 2));
          }

          if (accessRequests && accessRequests.length > 0) {
            const accessRequest = accessRequests[0];
            console.log('✅ Access request found! Status:', accessRequest.status);
            console.log('✅ Full request object:', JSON.stringify(accessRequest, null, 2));
            setAccessStatus(accessRequest.status as 'none' | 'pending' | 'approved' | 'denied');
          } else {
            console.log('ℹ️ No access request found, status: none');
            setAccessStatus('none');
          }
        } catch (err) {
          console.error('❌ Exception caught:', err);
          console.error('❌ Error details:', JSON.stringify(err, null, 2));
        }
      }
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
      toast.error('Failed to load property documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!userId) {
      toast.error('Please log in to request document access');
      return;
    }

    try {
      console.log('📤 Requesting document access for property:', propertyId);
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      console.log('👤 User profile:', profile);

      const requestData = {
        property_id: propertyId,
        requester_id: userId,
        requester_name: profile?.full_name || 'Unknown',
        requester_email: profile?.email || '',
        request_message: requestMessage,
        status: 'pending'
      };

      console.log('📝 Creating request with data:', requestData);

      const { data: insertedData, error } = await supabase
        .from('document_access_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating request:', error);
        throw error;
      }

      console.log('✅ Request created successfully:', insertedData);
      toast.success('Access request sent successfully!');
      setAccessStatus('pending');
      setShowRequestForm(false);
      setRequestMessage("");
    } catch (error) {
      console.error('❌ Failed to request access:', error);
      toast.error('Failed to send access request');
    }
  };

  const getStatusBadge = () => {
    switch (accessStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Access Granted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Request Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Request Denied</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200"><Lock className="h-3 w-3 mr-1" />Access Required</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Property Documents
            <Badge variant="secondary">{documents.length}</Badge>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document List with Lock Icons */}
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">{doc.document_label}</p>
                  <p className="text-xs text-slate-500">{doc.file_name}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Private</Badge>
            </div>
          ))}
        </div>

        {/* Single Action Button */}
        <div className="pt-4 border-t">
          {accessStatus === 'none' && !showRequestForm && (
            <Button
              onClick={() => setShowRequestForm(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              Request Full Document Access
            </Button>
          )}

          {showRequestForm && (
            <div className="space-y-3">
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Optional: Add a message to the seller..."
                className="w-full p-3 border rounded-lg text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRequestAccess}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Send Request
                </Button>
                <Button
                  onClick={() => setShowRequestForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {accessStatus === 'pending' && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="font-medium text-yellow-900">Request Pending</p>
              <p className="text-sm text-yellow-700 mt-1">
                The seller will review your request soon
              </p>
            </div>
          )}

          {accessStatus === 'approved' && (
            <Button
              onClick={() => navigate(`property/${propertyId}/documents`)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Documents
            </Button>
          )}

          {accessStatus === 'denied' && (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="font-medium text-red-900">Request Denied</p>
              <p className="text-sm text-red-700 mt-1">
                The seller has declined your access request
              </p>
              <Button
                onClick={() => {
                  setAccessStatus('none');
                  setShowRequestForm(true);
                }}
                variant="outline"
                className="mt-3"
                size="sm"
              >
                Request Again
              </Button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-800">
            <Lock className="h-3 w-3 inline mr-1" />
            All documents require seller approval. Once approved, you'll have access to view and download all property documents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
