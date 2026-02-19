// Reusable document upload component for tenant profile
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Download, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadTenantDocument,
  deleteTenantDocument,
  getDocumentSignedUrl,
  updateTenantProfileDocument,
  DocumentType
} from "@/services/documentUploadService";

interface DocumentUploadFieldProps {
  label: string;
  description?: string;
  documentType: DocumentType;
  userId: string;
  existingFileUrl?: string | null;
  onUploadSuccess?: (filePath: string) => void;
  onDeleteSuccess?: () => void;
}

export function DocumentUploadField({
  label,
  description,
  documentType,
  userId,
  existingFileUrl,
  onUploadSuccess,
  onDeleteSuccess
}: DocumentUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(existingFileUrl || null);
  const [fileName, setFileName] = useState<string | null>(
    existingFileUrl ? existingFileUrl.split('/').pop() || null : null
  );

  // Update state when existingFileUrl prop changes
  useEffect(() => {
    setFileUrl(existingFileUrl || null);
    setFileName(existingFileUrl ? existingFileUrl.split('/').pop() || null : null);
  }, [existingFileUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload file to storage
      const result = await uploadTenantDocument(file, userId, documentType);

      if (!result.success) {
        toast.error(result.error || "Failed to upload document");
        return;
      }

      // Update tenant profile with document URL
      const updated = await updateTenantProfileDocument(
        userId,
        documentType,
        result.url!
      );

      if (!updated) {
        toast.error("Failed to update profile with document");
        return;
      }

      setFileUrl(result.url!);
      setFileName(file.name);
      
      toast.success("Document uploaded successfully");
      
      if (onUploadSuccess) {
        onUploadSuccess(result.url!);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!fileUrl) return;

    try {
      // Delete from storage
      const deleted = await deleteTenantDocument(fileUrl);
      
      if (!deleted) {
        toast.error("Failed to delete document");
        return;
      }

      // Update tenant profile to remove document URL
      const updated = await updateTenantProfileDocument(
        userId,
        documentType,
        ''
      );

      if (!updated) {
        toast.error("Failed to update profile");
        return;
      }

      setFileUrl(null);
      setFileName(null);
      
      toast.success("Document deleted successfully");
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleView = async () => {
    if (!fileUrl) return;

    try {
      const signedUrl = await getDocumentSignedUrl(fileUrl);
      
      if (!signedUrl) {
        toast.error("Failed to generate view link");
        return;
      }

      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error("View error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const signedUrl = await getDocumentSignedUrl(fileUrl);
      
      if (!signedUrl) {
        toast.error("Failed to generate download link");
        return;
      }

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      
      {!fileUrl ? (
        // Upload State - Beautiful design matching other fields
        <div className="relative">
          <label 
            htmlFor={`file-${documentType}`}
            className="flex items-center justify-center h-12 px-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 group"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600 mr-2" />
                <span className="text-base text-slate-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 mr-2 transition-colors" />
                <span className="text-base text-slate-600 group-hover:text-indigo-700 transition-colors">
                  Click to upload or drag and drop
                </span>
              </>
            )}
          </label>
          <Input
            id={`file-${documentType}`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      ) : (
        // Uploaded State - Beautiful card design
        <div className="relative group">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg transition-all duration-200 hover:shadow-md">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900">Document Uploaded</p>
              <p className="text-xs text-green-700 truncate">{fileName || 'Document'}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleView}
                title="View document"
                className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-700"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                title="Download document"
                className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-700"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Delete document"
                className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-slate-500">
        Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
      </p>
    </div>
  );
}

