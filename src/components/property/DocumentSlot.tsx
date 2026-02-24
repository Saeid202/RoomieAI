// =====================================================
// Document Slot Component
// =====================================================
// Purpose: Individual document upload slot with
//          preview, privacy toggle, and status
// =====================================================

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Circle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Download,
  File,
  Image as ImageIcon
} from "lucide-react";
import { PropertyDocument, PropertyDocumentType } from "@/types/propertyCategories";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SecureDocumentViewer } from "./SecureDocumentViewer";
import { DocumentProcessingBadge } from "./DocumentProcessingBadge";

// Pending document type
interface PendingDocument {
  type: PropertyDocumentType;
  label: string;
  file: File;
  previewUrl: string;
}

interface DocumentSlotProps {
  type: PropertyDocumentType;
  label: string;
  description: string;
  weight: number;
  document?: PropertyDocument | null;
  pendingDocument?: PendingDocument | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  onDeletePending?: () => void;
  onPrivacyToggle?: (documentId: string, isPublic: boolean) => Promise<void>;
  disabled?: boolean;
  readOnly?: boolean; // New: Read-only mode
  isBuyerView?: boolean; // New: Buyer-specific UI
}

export function DocumentSlot({
  type,
  label,
  description,
  weight,
  document,
  pendingDocument,
  onUpload,
  onDelete,
  onDeletePending,
  onPrivacyToggle,
  disabled = false,
  readOnly = false,
  isBuyerView = false,
}: DocumentSlotProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSecureViewer, setShowSecureViewer] = useState(false);
  const [viewerInfo, setViewerInfo] = useState<{ name: string; email: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasDocument = !!document;
  const hasPending = !!pendingDocument;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PDF, JPG, PNG, or DOC files only");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast.success(`${label} uploaded successfully!`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${label}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!document || !onDelete) return;

    if (!confirm(`Are you sure you want to delete ${label}?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(document.id);
      toast.success(`${label} deleted`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${label}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePending = () => {
    if (!pendingDocument || !onDeletePending) return;
    onDeletePending();
    toast.success(`${label} removed`);
  };

  const handlePrivacyToggle = async (checked: boolean) => {
    if (!document || !onPrivacyToggle) return;

    try {
      await onPrivacyToggle(document.id, checked);
      toast.success(`${label} is now ${checked ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Privacy toggle error:', error);
      toast.error('Failed to update privacy setting');
    }
  };

  const handleViewDocument = async () => {
    if (!document) return;

    if (isBuyerView) {
      // Use secure viewer for buyers
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to view documents");
          return;
        }

        // Get user profile for watermark
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        setViewerInfo({
          name: profile?.full_name || user.email || "Unknown User",
          email: profile?.email || user.email || "unknown@email.com",
        });

        setShowSecureViewer(true);
      } catch (error) {
        console.error("Error opening secure viewer:", error);
        toast.error("Failed to open document");
      }
    } else {
      // Regular view for property owners
      try {
        const urlParts = document.file_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split('/');
          const filePath = pathParts.slice(1).join('/');
          
          const { data } = supabase.storage
            .from('property-documents')
            .getPublicUrl(filePath);
          
          if (data?.publicUrl) {
            window.open(data.publicUrl, '_blank');
          } else {
            window.open(document.file_url, '_blank');
          }
        } else {
          window.open(document.file_url, '_blank');
        }
      } catch (error) {
        console.error('Error opening document:', error);
        window.open(document.file_url, '_blank');
      }
    }
  };

  const getFileIcon = () => {
    if (!document) return <File className="h-6 w-6 text-slate-300" />;

    const mimeType = document.mime_type || '';
    if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className={`relative bg-white rounded-xl border-4 transition-all duration-200 shadow-lg hover:shadow-xl ${
      hasDocument 
        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
        : hasPending
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50'
        : 'border-purple-200 hover:border-purple-400 bg-gradient-to-br from-white to-purple-50/30'
    }`}>
      {/* Status Indicator */}
      <div className="absolute -top-2 -right-2 z-10">
        {hasDocument ? (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-white flex items-center justify-center shadow-xl">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        ) : hasPending ? (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 border-4 border-white flex items-center justify-center shadow-xl">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white flex items-center justify-center shadow-md">
            <Circle className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label className="text-sm font-black text-slate-900">{label}</Label>
              <span className="text-xs font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full shadow-md">
                +{weight}%
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-snug font-medium">{description}</p>
          </div>
        </div>

        {/* Document Preview or Upload Area */}
        {hasDocument ? (
          <div className="space-y-3">
            {/* File Preview */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {document.file_name}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </p>
              </div>
            </div>

            {/* Privacy Toggle or Approved Access Badge */}
            {isBuyerView ? (
              <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold px-3 py-1 shadow-md">
                  ✓ Approved Access
                </Badge>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    {document.is_public ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                    <div>
                      <Label className="text-xs font-bold text-slate-900">
                        {document.is_public ? 'Public' : 'Private'}
                      </Label>
                      <p className="text-xs text-slate-500 font-medium">
                        {document.is_public 
                          ? 'Buyers can download' 
                          : 'Request access'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={document.is_public}
                    onCheckedChange={handlePrivacyToggle}
                    disabled={disabled}
                  />
                </div>
                
                {/* AI Processing Status */}
                <DocumentProcessingBadge
                  documentId={document.id}
                  propertyId={document.property_id}
                  documentUrl={document.file_url}
                  documentType={type}
                  compact
                />
              </>
            )}

            {/* Actions */}
            {isBuyerView ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm h-11 font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 border-0 shadow-lg"
                onClick={handleViewDocument}
              >
                View Document
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-10 font-bold border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                  onClick={handleViewDocument}
                >
                  <Download className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-10 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-300 hover:border-red-400"
                  onClick={handleDelete}
                  disabled={isDeleting || disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : hasPending ? (
          <div className="space-y-3">
            {/* Pending File Preview */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-yellow-300 shadow-sm">
              <File className="h-6 w-6 text-yellow-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {pendingDocument.file.name}
                </p>
                <p className="text-xs text-yellow-600 font-bold">
                  Ready • {(pendingDocument.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Pending Status Message */}
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 shadow-sm">
              <p className="text-xs text-yellow-800 font-bold text-center">
                Will upload when you save
              </p>
            </div>

            {/* Remove Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-10 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-300 hover:border-red-400"
              onClick={handleDeletePending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
            <Button
              variant="outline"
              className="w-full h-24 border-4 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className={`h-6 w-6 ${isUploading ? 'animate-bounce' : ''} text-purple-500`} />
                <span className="text-xs font-bold text-slate-700">
                  {isUploading ? 'Uploading...' : 'Click to upload'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  PDF, JPG, PNG, DOC (10MB)
                </span>
              </div>
            </Button>
          </div>
        )}
      </div>

      {/* Secure Document Viewer Modal */}
      {isBuyerView && showSecureViewer && document && viewerInfo && (
        <SecureDocumentViewer
          isOpen={showSecureViewer}
          onClose={() => setShowSecureViewer(false)}
          documentUrl={document.file_url}
          documentName={document.file_name}
          documentId={document.id}
          propertyId={document.property_id}
          viewerName={viewerInfo.name}
          viewerEmail={viewerInfo.email}
        />
      )}
    </div>
  );
}
