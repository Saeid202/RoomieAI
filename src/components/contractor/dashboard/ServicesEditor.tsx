import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertService, deleteService, uploadImage } from "@/services/contractorPublicPageService";
import {
  Plus, Pencil, Trash2, Loader2, Wrench,
  ImageIcon, X, Save, XCircle, ArrowUp, ArrowDown
} from "lucide-react";
import type { ContractorService } from "@/types/contractor";
import { RichEditor } from "./RichEditor";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface ServicesEditorProps {
  services: ContractorService[];
  contractorId: string;
  onRefresh: () => void;
}

interface ServiceForm {
  id?: string;
  service_name: string;
  description: string;
  description_html: string | null;
  icon_name: string;
  image_url: string | null;
  title_bold: boolean;
}

const emptyForm: ServiceForm = {
  service_name: "", description: "", description_html: null,
  icon_name: "", image_url: null, title_bold: false,
};

export function ServicesEditor({ services, contractorId, onRefresh }: ServicesEditorProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function openAdd() { setForm(emptyForm); setShowForm(true); }
  function openEdit(service: ContractorService) {
    setForm({
      id: service.id, service_name: service.service_name,
      description: service.description || "", description_html: service.description_html || null,
      icon_name: service.icon_name || "", image_url: service.image_url || null,
      title_bold: service.title_bold ?? false,
    });
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${contractorId}/services/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const url = await uploadImage(file, path);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally { setUploadingImage(false); }
  }

  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!form.service_name.trim()) { toast({ variant: "destructive", title: "Service name is required" }); return; }
    setSaving(true);
    try {
      await upsertService({
        ...(form.id ? { id: form.id } : {}),
        contractor_id: contractorId,
        service_name: form.service_name,
        description: form.description || null,
        description_html: sanitizeHtml(form.description_html ?? '') ?? null,
        icon_name: form.icon_name || null,
        image_url: form.image_url || null,
        sort_order: form.id ? services.find((s) => s.id === form.id)?.sort_order ?? services.length : services.length,
      });
      setSaved(true);
      onRefresh();
      // Keep form open, just show success state briefly
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteService(id);
      toast({ title: "Service deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    } finally { setDeletingId(null); }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newServices = [...services];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;
    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    try {
      await Promise.all(newServices.map((svc, i) => upsertService({ ...svc, sort_order: i })));
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Reorder failed", description: err.message });
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Services</h2>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} service{services.length !== 1 ? 's' : ''} on your public page</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Service
        </button>
      </div>

      {/* ── Edit / Add Form ── */}
      {showForm && (
        <div className="bg-white border-2 border-violet-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Wrench className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-violet-900">{form.id ? "Edit Service" : "New Service"}</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-violet-400 hover:text-violet-600 transition-colors focus:outline-none">
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Service Name *</Label>
                <div className="flex items-center gap-2">
                  <Input value={form.service_name} onChange={(e) => setForm((p) => ({ ...p, service_name: e.target.value }))} placeholder="e.g. Kitchen Renovation" className={`flex-1 rounded-xl border-gray-200 focus:border-violet-400 ${form.title_bold ? "font-bold" : ""}`} />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, title_bold: !p.title_bold }))} className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border-2 text-sm font-black transition-all focus:outline-none ${form.title_bold ? "bg-violet-600 text-white border-violet-600 shadow-md" : "bg-white text-gray-400 border-gray-200 hover:border-violet-300"}`} aria-label="Bold title">B</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</Label>
                <RichEditor
                  initialContent={form.description_html ?? (form.description ? `<p>${form.description}</p>` : null)}
                  onChange={(html) => setForm((p) => ({ ...p, description_html: html }))}
                  onPlainTextChange={(text) => setForm((p) => ({ ...p, description: text }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Icon Name (Lucide)</Label>
                <Input value={form.icon_name} onChange={(e) => setForm((p) => ({ ...p, icon_name: e.target.value }))} placeholder="e.g. hammer, wrench, home" className="rounded-xl border-gray-200 focus:border-violet-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Service Card Image</Label>
              {form.image_url ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100">
                  <img src={form.image_url} alt="Service card" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setForm((p) => ({ ...p, image_url: null }))} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">
                      <X className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="w-full h-52 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/40 transition-all focus:outline-none">
                  {uploadingImage ? <Loader2 className="h-7 w-7 animate-spin" /> : <><div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center"><ImageIcon className="h-7 w-7" /></div><div className="text-center"><p className="text-sm font-semibold">Upload image</p><p className="text-xs text-gray-400 mt-0.5">JPEG, PNG or WebP</p></div></>}
                </button>
              )}
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            {saved && (
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Changes saved!
              </span>
            )}
            {!saved && <span />}
            <div className="flex items-center gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none">Close</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md focus:outline-none ${
                  saved
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white'
                }`}
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : saved ? (
                  <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Saved!</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Services List ── */}
      {services.length === 0 && !showForm ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-violet-300" />
          </div>
          <p className="text-base font-bold text-gray-700 mb-1">No services yet</p>
          <p className="text-sm text-gray-400 mb-5">Add your first service to showcase on your public page</p>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={service.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl hover:shadow-md transition-all group min-w-0 overflow-hidden" style={{ border: '1.5px solid #c7d2fe' }}>
              {/* Thumbnail */}
              {service.image_url ? (
                <img src={service.image_url} alt={service.service_name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-6 w-6 text-violet-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className={`text-base text-gray-900 truncate ${service.title_bold ? 'font-bold' : 'font-semibold'}`}>{service.service_name}</p>
                <p className="text-sm text-gray-400 truncate mt-0.5">{service.description || <span className="italic">No description added</span>}</p>
              </div>

              {/* Reorder */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => handleReorder(index, "up")}
                  disabled={index === 0}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus:outline-none"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => handleReorder(index, "down")}
                  disabled={index === services.length - 1}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus:outline-none"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(service)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-xl transition-colors focus:outline-none border border-violet-200"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors focus:outline-none border border-red-200 disabled:opacity-50"
                >
                  {deletingId === service.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
