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
}: DocumentSlotProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    <div className={`relative bg-white rounded-lg border-2 transition-all duration-200 ${
      hasDocument 
        ? 'border-green-200 bg-green-50/30' 
        : hasPending
        ? 'border-yellow-200 bg-yellow-50/30'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Status Indicator */}
      <div className="absolute -top-1.5 -right-1.5 z-10">
        {hasDocument ? (
          <div className="h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-md">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
        ) : hasPending ? (
          <div className="h-5 w-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center shadow-md">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
            <Circle className="h-2.5 w-2.5 text-slate-400" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Label className="text-xs font-bold text-slate-900">{label}</Label>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">
                +{weight}%
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">{description}</p>
          </div>
        </div>

        {/* Document Preview or Upload Area */}
        {hasDocument ? (
          <div className="space-y-2">
            {/* File Preview */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {document.file_name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                {document.is_public ? (
                  <Eye className="h-3 w-3 text-green-600" />
                ) : (
                  <EyeOff className="h-3 w-3 text-slate-400" />
                )}
                <div>
                  <Label className="text-[10px] font-semibold text-slate-900">
                    {document.is_public ? 'Public' : 'Private'}
                  </Label>
                  <p className="text-[9px] text-slate-500">
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
                className="scale-75"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7"
                onClick={async () => {
                  try {
                    // Extract the file path from the URL
                    const urlParts = document.file_url.split('/storage/v1/object/public/');
                    if (urlParts.length > 1) {
                      const pathParts = urlParts[1].split('/');
                      const bucketName = pathParts[0];
                      const filePath = pathParts.slice(1).join('/');
                      
                      console.log('📄 Opening document:', { bucketName, filePath });
                      
                      // Try to get a fresh signed URL with correct bucket name
                      const { data } = supabase.storage
                        .from('property-documents') // Use hyphen, not underscore
                        .getPublicUrl(filePath);
                      
                      if (data?.publicUrl) {
                        window.open(data.publicUrl, '_blank');
                      } else {
                        // Fallback to original URL
                        window.open(document.file_url, '_blank');
                      }
                    } else {
                      // Fallback to original URL
                      window.open(document.file_url, '_blank');
                    }
                  } catch (error) {
                    console.error('Error opening document:', error);
                    // Fallback to original URL
                    window.open(document.file_url, '_blank');
                  }
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting || disabled}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : hasPending ? (
          <div className="space-y-2">
            {/* Pending File Preview */}
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <File className="h-6 w-6 text-yellow-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {pendingDocument.file.name}
                </p>
                <p className="text-[10px] text-yellow-600 font-medium">
                  Ready • {(pendingDocument.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Pending Status Message */}
            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-[10px] text-yellow-800">
                Will upload when you save
              </p>
            </div>

            {/* Remove Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[10px] h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeletePending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
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
              className="w-full h-16 border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50 transition-all"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className={`h-4 w-4 ${isUploading ? 'animate-bounce' : ''} text-slate-400`} />
                <span className="text-[10px] font-semibold text-slate-600">
                  {isUploading ? 'Uploading...' : 'Click to upload'}
                </span>
                <span className="text-[9px] text-slate-400">
                  PDF, JPG, PNG, DOC (10MB)
                </span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
