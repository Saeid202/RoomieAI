// =====================================================
// Document Access Request Card
// =====================================================
// Purpose: Display document access requests in the
//          Sales Inquiries tab for seller approval
// =====================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, XCircle, FileText, MapPin, User, Mail, MessageSquare } from "lucide-react";
import { respondToAccessRequest } from "@/services/propertyDocumentService";
import { toast } from "sonner";
import type { DocumentAccessRequest } from "@/types/propertyCategories";

interface DocumentAccessRequestCardProps {
  request: DocumentAccessRequest & {
    document?: {
      document_label: string;
      document_type: string;
    };
    property?: {
      address: string;
      listing_title: string;
    };
  };
  onStatusUpdate?: () => void;
}

export function DocumentAccessRequestCard({
  request,
  onStatusUpdate,
}: DocumentAccessRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRespond = async (status: 'approved' | 'denied') => {
    setIsProcessing(true);
    try {
      const responseMessage = status === 'approved'
        ? 'Your request has been approved. You can now view the document.'
        : 'Your request has been declined by the property owner.';

      await respondToAccessRequest(request.id, status, responseMessage);
      
      toast.success(
        status === 'approved'
          ? 'Access granted successfully'
          : 'Request declined'
      );
      
      onStatusUpdate?.();
    } catch (error) {
      console.error('Failed to respond to request:', error);
      toast.error('Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Declined</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Document Access Request
              </CardTitle>
              <p className="text-xs text-slate-600 mt-0.5">
                {new Date(request.requested_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Requester Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{request.requester_name || 'Unknown'}</span>
          </div>
          {request.requester_email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{request.requester_email}</span>
            </div>
          )}
        </div>

        {/* Property & Document Info */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Property</p>
              <p className="text-sm font-semibold text-slate-900">
                {request.property?.address || request.property?.listing_title || 'Unknown Property'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Requested Access</p>
              <p className="text-sm font-semibold text-slate-900">
                All Property Documents
              </p>
            </div>
          </div>
        </div>

        {/* Request Message */}
        {request.request_message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-900 mb-1">Reason for Request</p>
                <p className="text-sm text-blue-800">{request.request_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Response Message (if responded) */}
        {request.response_message && request.status !== 'pending' && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-700 mb-1">Your Response</p>
            <p className="text-sm text-slate-600">{request.response_message}</p>
            {request.reviewed_at && (
              <p className="text-xs text-slate-500 mt-1">
                Responded on {new Date(request.reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons (only for pending requests) */}
        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleRespond('approved')}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleRespond('denied')}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
