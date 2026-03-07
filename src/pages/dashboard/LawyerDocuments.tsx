import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchLawyerDocuments, deleteLawyerDocument, getDocumentSignedUrl } from "@/services/lawyerDocumentService";
import { LawyerDocument } from "@/types/lawyerDocument";
import { FileText, Download, Trash2, Upload, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadModal } from "@/components/lawyer/DocumentUploadModal";

export default function LawyerDocuments() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LawyerDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LawyerDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      const docs = await fetchLawyerDocuments(user.id);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => {
      const name = doc.document_name.toLowerCase();
      const type = doc.document_type.toLowerCase();
      const desc = doc.description?.toLowerCase() || "";
      return name.includes(query) || type.includes(query) || desc.includes(query);
    });
    
    setFilteredDocuments(filtered);
  };

  const handleDownload = async (doc: LawyerDocument) => {
    try {
      const url = await getDocumentSignedUrl(doc.file_path);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error("Failed to generate download link");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handleDelete = async (doc: LawyerDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.document_name}"?`)) {
      return;
    }

    try {
      await deleteLawyerDocument(doc.id, doc.file_path);
      toast.success("Document deleted successfully");
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Document Management
        </h1>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Documents</p>
            <p className="text-2xl font-bold">{documents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Shared with Clients</p>
            <p className="text-2xl font-bold">{documents.filter(d => d.is_shared_with_client).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Private</p>
            <p className="text-2xl font-bold">{documents.filter(d => !d.is_shared_with_client).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No documents found matching your search" : "No documents yet"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-purple-100">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">{doc.document_name}</h3>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{doc.document_type}</Badge>
                        {doc.is_shared_with_client && (
                          <Badge className="bg-green-100 text-green-700">Shared</Badge>
                        )}
                        <span className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</span>
                      </div>

                      {doc.description && (
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      )}

                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            loadDocuments();
          }}
        />
      )}
    </div>
  );
}
