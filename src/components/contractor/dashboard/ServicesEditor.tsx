import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { upsertService, deleteService } from "@/services/contractorPublicPageService";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, Wrench } from "lucide-react";
import type { ContractorService } from "@/types/contractor";

interface ServicesEditorProps {
  services: ContractorService[];
  contractorId: string;
  onRefresh: () => void;
}

interface ServiceForm {
  id?: string;
  service_name: string;
  description: string;
  icon_name: string;
}

const emptyForm: ServiceForm = {
  service_name: "",
  description: "",
  icon_name: "",
};

export function ServicesEditor({
  services,
  contractorId,
  onRefresh,
}: ServicesEditorProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(service: ContractorService) {
    setForm({
      id: service.id,
      service_name: service.service_name,
      description: service.description || "",
      icon_name: service.icon_name || "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.service_name.trim()) {
      toast({ variant: "destructive", title: "Service name is required" });
      return;
    }
    setSaving(true);
    try {
      await upsertService({
        ...(form.id ? { id: form.id } : {}),
        contractor_id: contractorId,
        service_name: form.service_name,
        description: form.description || null,
        icon_name: form.icon_name || null,
        sort_order: form.id
          ? services.find((s) => s.id === form.id)?.sort_order ?? services.length
          : services.length,
      });
      toast({ title: "Service saved" });
      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteService(id);
      toast({ title: "Service deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newServices = [...services];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    [newServices[index], newServices[targetIndex]] = [
      newServices[targetIndex],
      newServices[index],
    ];

    try {
      await Promise.all(
        newServices.map((svc, i) =>
          upsertService({ ...svc, sort_order: i })
        )
      );
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Reorder failed", description: err.message });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wrench className="h-4 w-4 text-violet-600" />
          Services
        </CardTitle>
        <Button size="sm" onClick={openAdd} variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Inline form */}
        {showForm && (
          <div className="border border-violet-200 rounded-lg p-4 bg-violet-50 space-y-3">
            <h4 className="font-semibold text-sm text-violet-800">
              {form.id ? "Edit Service" : "New Service"}
            </h4>
            <div className="space-y-1">
              <Label>Service Name *</Label>
              <Input
                value={form.service_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, service_name: e.target.value }))
                }
                placeholder="e.g. Kitchen Renovation"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description of this service"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Icon Name (Lucide)</Label>
              <Input
                value={form.icon_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, icon_name: e.target.value }))
                }
                placeholder="e.g. hammer, wrench, home"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Services list */}
        {services.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 text-center py-4">
            No services yet. Add your first service.
          </p>
        )}

        {services.map((service, index) => (
          <div
            key={service.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">
                {service.service_name}
              </p>
              {service.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {service.description}
                </p>
              )}
              {service.icon_name && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Icon: {service.icon_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleReorder(index, "up")}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus:outline-none"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReorder(index, "down")}
                disabled={index === services.length - 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus:outline-none"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEdit(service)}
                className="p-1 text-gray-400 hover:text-violet-600 focus:outline-none"
                aria-label="Edit service"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Delete service"
              >
                {deletingId === service.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
