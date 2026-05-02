import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { upsertProject, deleteProject, uploadImage } from "@/services/contractorPublicPageService";
import {
  Plus, Pencil, Trash2, Loader2, ImageIcon,
  X, Save, XCircle, ArrowUp, ArrowDown, Images
} from "lucide-react";
import type { ContractorProject, ContractorService } from "@/types/contractor";

interface PortfolioEditorProps {
  projects: ContractorProject[];
  contractorId: string;
  services: ContractorService[];
  onRefresh: () => void;
}

interface ProjectForm {
  id?: string;
  title: string;
  description: string;
  images: string[];
  service_id: string | null;
}

const emptyForm: ProjectForm = { title: "", description: "", images: [], service_id: null };

export function PortfolioEditor({ projects, contractorId, services, onRefresh }: PortfolioEditorProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function openAdd() { setForm(emptyForm); setShowForm(true); }
  function openEdit(project: ContractorProject) {
    setForm({ id: project.id, title: project.title, description: project.description || "", images: project.images || [], service_id: project.service_id || null });
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const urls = await Promise.all(files.map((file) => {
        const path = `${contractorId}/projects/${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
        return uploadImage(file, path);
      }));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally { setUploadingImages(false); }
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!form.title.trim()) { toast({ variant: "destructive", title: "Project title is required" }); return; }
    setSaving(true);
    try {
      await upsertProject({
        ...(form.id ? { id: form.id } : {}),
        contractor_id: contractorId,
        title: form.title,
        description: form.description || null,
        images: form.images,
        service_id: form.service_id || null,
        sort_order: form.id ? projects.find((p) => p.id === form.id)?.sort_order ?? projects.length : projects.length,
      });
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProject(id);
      toast({ title: "Project deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    } finally { setDeletingId(null); }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    try {
      await Promise.all(newProjects.map((proj, i) => upsertProject({ ...proj, sort_order: i })));
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
          <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
          <p className="text-sm text-gray-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Project
        </button>
      </div>

      {/* ── Edit / Add Form ── */}
      {showForm && (
        <div className="bg-white border-2 border-violet-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Images className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-violet-900">{form.id ? "Edit Project" : "New Project"}</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-violet-400 hover:text-violet-600 transition-colors focus:outline-none">
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Master Bathroom Remodel" className="rounded-xl border-gray-200 focus:border-violet-400" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe this project" rows={4} className="resize-none rounded-xl border-gray-200 focus:border-violet-400" />
              </div>
              {services.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Link to Service</Label>
                  <select value={form.service_id || ""} onChange={(e) => setForm((p) => ({ ...p, service_id: e.target.value || null }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400">
                    <option value="">— No service —</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                  </select>
                  <p className="text-xs text-gray-400">This project will appear in the service's gallery.</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Images</Label>
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((url, i) => (
                  <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(i)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImages} className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/40 transition-all focus:outline-none">
                  {uploadingImages ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" strokeWidth={2.5} /><span className="text-xs font-semibold">Add</span></>}
                </button>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
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
                  saved ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white'
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

      {/* ── Projects List ── */}
      {projects.length === 0 && !showForm ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-violet-50 flex items-center justify-center mb-4">
            <Images className="h-8 w-8 text-violet-300" />
          </div>
          <p className="text-base font-bold text-gray-700 mb-1">No projects yet</p>
          <p className="text-sm text-gray-400 mb-5">Showcase your best work by adding portfolio projects</p>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={project.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:shadow-md transition-all group w-full" style={{ border: '1.5px solid #c7d2fe' }}>
              {/* Thumbnail */}
              {project.images?.[0] ? (
                <img src={project.images[0]} alt={project.title} className="h-14 w-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-violet-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">{project.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-sm text-gray-400 truncate">{project.description || <span className="italic">No description</span>}</p>
                  <span className="text-xs text-gray-300 flex-shrink-0">{project.images?.length || 0} img{(project.images?.length || 0) !== 1 ? 's' : ''}</span>
                  {project.service_id && (
                    <span className="text-xs font-semibold text-violet-500 flex-shrink-0 bg-violet-50 px-2 py-0.5 rounded-full">
                      {services.find((s) => s.id === project.service_id)?.service_name ?? "Linked"}
                    </span>
                  )}
                </div>
              </div>

              {/* Reorder */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => handleReorder(index, "up")} disabled={index === 0} className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus:outline-none" aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button onClick={() => handleReorder(index, "down")} disabled={index === projects.length - 1} className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus:outline-none" aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(project)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-xl transition-colors focus:outline-none border border-violet-200">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(project.id)} disabled={deletingId === project.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors focus:outline-none border border-red-200 disabled:opacity-50">
                  {deletingId === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
