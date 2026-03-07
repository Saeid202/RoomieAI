import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LawyerClientRelationship, CASE_STATUS } from "@/types/lawyer";
import { updateClientRelationship, deleteClientRelationship } from "@/services/lawyerService";
import { Trash2 } from "lucide-react";

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: LawyerClientRelationship;
}

export function CaseDetailsModal({ isOpen, onClose, client }: CaseDetailsModalProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    case_description: client.case_description || "",
    status: client.status,
    consultation_date: client.consultation_date ? new Date(client.consultation_date).toISOString().split('T')[0] : "",
    retainer_paid: client.retainer_paid,
    retainer_amount: client.retainer_amount || "",
    notes: client.notes || "",
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateClientRelationship(client.id, {
        case_description: formData.case_description,
        status: formData.status,
        consultation_date: formData.consultation_date || undefined,
        retainer_paid: formData.retainer_paid,
        retainer_amount: formData.retainer_amount ? parseFloat(formData.retainer_amount.toString()) : undefined,
        notes: formData.notes,
      });
      toast.success("Case updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating case:", error);
      toast.error("Failed to update case");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this client? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteClientRelationship(client.id);
      toast.success("Client removed successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to remove client");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Case Details - {client.client?.user_metadata?.full_name || "Unknown Client"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900">Client Information</h3>
            <p className="text-sm"><span className="font-medium">Email:</span> {client.client?.email}</p>
            <p className="text-sm"><span className="font-medium">Case Type:</span> {client.case_type}</p>
            <p className="text-sm"><span className="font-medium">Added:</span> {new Date(client.created_at).toLocaleDateString()}</p>
          </div>

          {/* Case Description */}
          <div>
            <Label htmlFor="case_description">Case Description</Label>
            <Textarea
              id="case_description"
              value={formData.case_description}
              onChange={(e) => setFormData({ ...formData, case_description: e.target.value })}
              placeholder="Describe the case details..."
              rows={4}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASE_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Date */}
          <div>
            <Label htmlFor="consultation_date">Consultation Date</Label>
            <Input
              id="consultation_date"
              type="date"
              value={formData.consultation_date}
              onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
            />
          </div>

          {/* Retainer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retainer_amount">Retainer Amount ($)</Label>
              <Input
                id="retainer_amount"
                type="number"
                step="0.01"
                value={formData.retainer_amount}
                onChange={(e) => setFormData({ ...formData, retainer_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="retainer_paid"
                  checked={formData.retainer_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, retainer_paid: checked as boolean })}
                />
                <Label htmlFor="retainer_paid" className="cursor-pointer">
                  Retainer Paid
                </Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Removing..." : "Remove Client"}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving || deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || deleting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
