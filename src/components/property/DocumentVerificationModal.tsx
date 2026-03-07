import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileCheck, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  X,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  document_type: string;
  document_label: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  is_public: boolean;
}

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onComplete: () => void;
}

export function DocumentVerificationModal({ 
  isOpen, 
  onClose, 
  propertyId,
  onComplete 
}: DocumentVerificationModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedDocs, setVerifiedDocs] = useState<Set<string>>(new Set());
  const [docNotes, setDocNotes] = useState<Record<string, string>>({});
  const [flaggedDocs, setFlaggedDocs] = useState<Set<string>>(new Set());
  const [activeNoteDoc, setActiveNoteDoc] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, propertyId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_documents' as any)
        .select('*')
        .eq('property_id', propertyId)
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as any) || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerified = (docId: string) => {
    setVerifiedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const toggleFlagged = (docId: string) => {
    setFlaggedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const saveNote = (docId: string, note: string) => {
    setDocNotes(prev => ({ ...prev, [docId]: note }));
    setActiveNoteDoc(null);
    toast.success('Note saved');
  };

  const viewDocument = (fileUrl: string) => {
    // Navigate to Documents tab to view the document
    toast.info('Opening document viewer...');
    // This would trigger navigation to the Documents tab
  };

  // For now, treat all documents as required
  const requiredDocs = documents;
  const allRequiredVerified = requiredDocs.every(d => verifiedDocs.has(d.id));
  const progress = documents.length > 0 
    ? Math.round((verifiedDocs.size / documents.length) * 100) 
    : 0;

  const handleComplete = () => {
    if (!allRequiredVerified) {
      toast.error('Please review all required documents before continuing');
      return;
    }
    
    if (flaggedDocs.size > 0) {
      toast.warning('You have flagged documents. Please address concerns before proceeding.');
      return;
    }

    onComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-purple-600" />
            Document Verification Checklist
          </DialogTitle>
        </DialogHeader>

        {/* Progress Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-purple-900">Verification Progress</h3>
              <p className="text-sm text-purple-700">
                {verifiedDocs.size} of {documents.length} documents reviewed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-purple-600">{progress}%</div>
              <div className="text-xs text-purple-700 font-medium">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong> Review each document carefully. Click the checkbox to mark as reviewed. 
            Add notes or flag documents that need attention. All required documents must be reviewed to continue.
          </p>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No documents available for verification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const isVerified = verifiedDocs.has(doc.id);
              const isFlagged = flaggedDocs.has(doc.id);
              const hasNote = docNotes[doc.id];
              const isShowingNote = activeNoteDoc === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isVerified 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : isFlagged
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleVerified(doc.id)}
                      className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isVerified 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {isVerified && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>

                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {doc.document_label}
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {doc.document_type.replace('_', ' ')}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600">{doc.file_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </span>
                          )}
                          {isFlagged && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Flagged
                            </span>
                          )}
                          {!isVerified && !isFlagged && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes Display */}
                      {hasNote && !isShowingNote && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                          <p className="text-xs text-yellow-900">
                            <strong>Note:</strong> {hasNote}
                          </p>
                        </div>
                      )}

                      {/* Note Editor */}
                      {isShowingNote && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            placeholder="Add your notes or concerns about this document..."
                            defaultValue={docNotes[doc.id] || ''}
                            className="text-sm"
                            rows={3}
                            id={`note-${doc.id}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                const textarea = document.getElementById(`note-${doc.id}`) as HTMLTextAreaElement;
                                saveNote(doc.id, textarea.value);
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Save Note
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveNoteDoc(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDocument(doc.file_url)}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveNoteDoc(doc.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {hasNote ? 'Edit Note' : 'Add Note'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFlagged(doc.id)}
                          className={isFlagged ? 'text-red-600 border-red-300 bg-red-50' : 'text-gray-600 border-gray-300'}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {isFlagged ? 'Unflag' : 'Flag Issue'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-300"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Document Vault
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!allRequiredVerified || flaggedDocs.size > 0}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Verification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
