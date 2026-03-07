import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LawyerProfile, CASE_TYPES } from "@/types/lawyer";
import { createClientRelationship } from "@/services/lawyerService";
import { supabase } from "@/integrations/supabase/client";

interface ConsultationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: LawyerProfile;
}

export function ConsultationRequestModal({ isOpen, onClose, lawyer }: ConsultationRequestModalProps) {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    case_type: "",
    case_description: "",
    preferred_date: "",
  });

  const handleSubmit = async () => {
    if (!formData.case_type || !formData.case_description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSending(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      // Create consultation request (client relationship)
      await createClientRelationship(lawyer.user_id, {
        client_id: user.id,
        case_type: formData.case_type,
        case_description: formData.case_description,
        consultation_date: formData.preferred_date || undefined,
        status: 'pending',
      });

      toast.success("Consultation request sent successfully! The lawyer will contact you soon.");
      onClose();
    } catch (error: any) {
      console.error("Error sending consultation request:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("You already have a consultation request with this lawyer for this case type");
      } else {
        toast.error("Failed to send consultation request");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Request Consultation with {lawyer.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {lawyer.consultation_fee && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Consultation Fee:</span> ${lawyer.consultation_fee}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="case_type">Case Type *</Label>
            <Select
              value={formData.case_type}
              onValueChange={(value) => setFormData({ ...formData, case_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {CASE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="case_description">Describe Your Legal Issue *</Label>
            <Textarea
              id="case_description"
              value={formData.case_description}
              onChange={(e) => setFormData({ ...formData, case_description: e.target.value })}
              placeholder="Please provide details about your legal matter..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="preferred_date">Preferred Consultation Date</Label>
            <Input
              id="preferred_date"
              type="date"
              value={formData.preferred_date}
              onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - The lawyer will contact you to confirm availability
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={sending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {sending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
