// =====================================================
// Document Access Request Modal
// =====================================================
// Purpose: Allow buyers to request access to private
//          property documents with a message
// =====================================================

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lock, Send } from "lucide-react";
import { requestDocumentAccess } from "@/services/propertyDocumentService";
import { toast } from "sonner";

interface DocumentAccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentLabel: string;
  propertyId: string;
  propertyAddress: string;
  onRequestSent?: () => void;
}

export function DocumentAccessRequestModal({
  isOpen,
  onClose,
  documentId,
  documentLabel,
  propertyId,
  propertyAddress,
  onRequestSent,
}: DocumentAccessRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please provide a reason for your request");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestDocumentAccess(documentId, propertyId, message);
      toast.success("Access request sent to the seller");
      onRequestSent?.();
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Failed to request document access:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Request Document Access
          </DialogTitle>
          <DialogDescription>
            Request access to view this private document from the property owner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900">{documentLabel}</p>
            <p className="text-xs text-slate-600 mt-1">{propertyAddress}</p>
          </div>

          {/* Request Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Why do you need access to this document?</Label>
            <Textarea
              id="message"
              placeholder="Example: I'm interested in purchasing this property and would like to review the title deed as part of my due diligence..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500">
              The seller will review your request and decide whether to grant access
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
