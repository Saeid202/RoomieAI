import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DOCUMENT_TYPES } from "@/types/lawyerDocument";
import { uploadLawyerDocument } from "@/services/lawyerDocumentService";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  relationshipId?: string;
}

export function DocumentUploadModal({ isOpen, onClose, clientId, relationshipId }: DocumentUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    document_name: "",
    document_type: "",
    description: "",
    is_shared_with_client: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.document_name) {
        setFormData({ ...formData, document_name: selectedFile.name });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !formData.document_name || !formData.document_type) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      await uploadLawyerDocument(user.id, file, {
        document_name: formData.document_name,
        document_type: formData.document_type,
        description: formData.description || undefined,
        is_shared_with_client: formData.is_shared_with_client,
        client_id: clientId,
        relationship_id: relationshipId,
      });

      toast.success("Document uploaded successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="file">Select File *</Label>
            <div className="mt-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="document_name">Document Name *</Label>
            <Input
              id="document_name"
              value={formData.document_name}
              onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
              placeholder="e.g., Lease Agreement - Smith Property"
            />
          </div>

          <div>
            <Label htmlFor="document_type">Document Type *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData({ ...formData, document_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description or notes..."
              rows={3}
            />
          </div>

          {clientId && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_shared_with_client"
                checked={formData.is_shared_with_client}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_shared_with_client: checked as boolean })
                }
              />
              <Label htmlFor="is_shared_with_client" className="cursor-pointer">
                Share this document with client
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !file}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
