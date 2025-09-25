import { useState, useEffect } from 'react';
import { 
  uploadRentalDocument, 
  getApplicationDocuments, 
  deleteRentalDocument,
  getDocumentSummary,
  RentalDocument,
  DocumentUploadInput 
} from '@/services/rentalDocumentService';
import { toast } from 'sonner';

export function useRentalDocuments(applicationId: string | null) {
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>
  });

  // Load documents when applicationId changes
  useEffect(() => {
    if (applicationId) {
      loadDocuments();
      loadSummary();
    }
  }, [applicationId]);

  const loadDocuments = async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      const docs = await getApplicationDocuments(applicationId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!applicationId) return;
    
    try {
      const summaryData = await getDocumentSummary(applicationId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load document summary:', error);
    }
  };

  const uploadDocument = async (input: Omit<DocumentUploadInput, 'application_id'>) => {
    if (!applicationId) {
      toast.error('No application ID available');
      return null;
    }

    try {
      setUploading(true);
      const document = await uploadRentalDocument({
        ...input,
        application_id: applicationId
      });
      
      // Refresh documents and summary
      await loadDocuments();
      await loadSummary();
      
      toast.success(`${input.document_type} document uploaded successfully`);
      return document;
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error(`Failed to upload ${input.document_type} document`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      await deleteRentalDocument(documentId);
      
      // Refresh documents and summary
      await loadDocuments();
      await loadSummary();
      
      toast.success('Document removed successfully');
    } catch (error) {
      console.error('Failed to remove document:', error);
      toast.error('Failed to remove document');
    }
  };

  const getDocumentsByType = (type: 'reference' | 'employment' | 'credit' | 'additional') => {
    return documents.filter(doc => doc.document_type === type);
  };

  const getDocumentCount = (type: 'reference' | 'employment' | 'credit' | 'additional') => {
    return getDocumentsByType(type).length;
  };

  return {
    documents,
    loading,
    uploading,
    summary,
    uploadDocument,
    removeDocument,
    getDocumentsByType,
    getDocumentCount,
    refreshDocuments: loadDocuments
  };
}
