import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CASE_TYPES } from "@/types/lawyer";
import { createClientRelationship } from "@/services/lawyerService";
import { supabase } from "@/integrations/supabase/client";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    client_email: "",
    case_type: "",
    case_description: "",
    consultation_date: "",
  });

  const handleSubmit = async () => {
    if (!formData.client_email || !formData.case_type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      // Get current user (lawyer)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      // Find client by email
      const { data: clientData, error: clientError } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("email", formData.client_email)
        .single();

      if (clientError || !clientData) {
        toast.error("Client not found. Please check the email address.");
        return;
      }

      // Create relationship
      await createClientRelationship(user.id, {
        client_id: clientData.user_id,
        case_type: formData.case_type,
        case_description: formData.case_description || undefined,
        consultation_date: formData.consultation_date || undefined,
        status: 'pending',
      });

      toast.success("Client added successfully");
      onClose();
    } catch (error: any) {
      console.error("Error adding client:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("This client already exists for this case type");
      } else {
        toast.error("Failed to add client");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="client_email">Client Email *</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="client@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the email of an existing user on the platform
            </p>
          </div>

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
            <Label htmlFor="case_description">Case Description</Label>
            <Textarea
              id="case_description"
              value={formData.case_description}
              onChange={(e) => setFormData({ ...formData, case_description: e.target.value })}
              placeholder="Brief description of the case..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="consultation_date">Consultation Date</Label>
            <Input
              id="consultation_date"
              type="date"
              value={formData.consultation_date}
              onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {saving ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
