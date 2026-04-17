import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { DocumentTypeConfig, MortgageDocumentCategory, MortgageDocument } from '@/types/mortgageDocument';
import {
  uploadDocument,
  deleteDocument,
  getDocumentUrl,
  validateFile
} from '@/services/mortgageDocumentService';

interface DocumentUploadSlotProps {
  documentType: DocumentTypeConfig;
  category: MortgageDocumentCategory;
  mortgageProfileId: string;
  existingDocument?: MortgageDocument;
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
}

export function DocumentUploadSlot({
  documentType,
  category,
  mortgageProfileId,
  existingDocument,
  onDocumentUploaded,
  onDocumentDeleted
}: DocumentUploadSlotProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Comprehensive logging for debugging
    console.log('DOCUMENT UPLOAD DEBUG:');
    console.log('  File name:', file.name);
    console.log('  File type:', file.type);
    console.log('  File size:', file.size);
    console.log('  Mortgage Profile ID:', mortgageProfileId);
    console.log('  Category:', category);
    console.log('  Document Type:', documentType.type);

    // Check if mortgage profile is saved
    if (mortgageProfileId === 'new') {
      toast({
        title: 'Profile Not Saved',
        description: 'Please save the mortgage profile before uploading documents',
        variant: 'destructive'
      });
      return;
    }

    // Validate file
    const validation = await validateFile(file, category, documentType.type);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await uploadDocument(
        mortgageProfileId,
        category,
        documentType.type,
        file
      );

      if (error) throw error;

      toast({
        title: 'Document Uploaded',
        description: `${documentType.label} has been uploaded successfully`
      });

      onDocumentUploaded();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!existingDocument) return;

    setDeleting(true);
    try {
      const { error } = await deleteDocument(existingDocument.id);

      if (error) throw error;

      toast({
        title: 'Document Deleted',
        description: `${documentType.label} has been removed`
      });

      onDocumentDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleView = async () => {
    if (!existingDocument) return;

    try {
      const { data: url, error } = await getDocumentUrl(existingDocument.file_path);

      if (error || !url) throw error;

      window.open(url, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: 'View Failed',
        description: 'Failed to open document. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{documentType.label}</h4>
            {documentType.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
            {existingDocument && (
              <Badge variant="default" className="text-xs bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Uploaded
              </Badge>
            )}
          </div>
          {documentType.description && (
            <p className="text-xs text-slate-500 mt-1">{documentType.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Max size: {(documentType.maxSize / (1024 * 1024)).toFixed(0)}MB
          </p>
        </div>
      </div>

      {existingDocument ? (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <FileText className="h-5 w-5 text-slate-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{existingDocument.file_name}</p>
            <p className="text-xs text-slate-500">
              Uploaded {new Date(existingDocument.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="h-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 text-red-600 hover:text-red-700"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={documentType.acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {documentType.label}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
