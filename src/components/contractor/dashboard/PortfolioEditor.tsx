import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  upsertProject,
  deleteProject,
  uploadImage,
} from "@/services/contractorPublicPageService";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import type { ContractorProject } from "@/types/contractor";

interface PortfolioEditorProps {
  projects: ContractorProject[];
  contractorId: string;
  onRefresh: () => void;
}

interface ProjectForm {
  id?: string;
  title: string;
  description: string;
  images: string[];
}

const emptyForm: ProjectForm = { title: "", description: "", images: [] };

export function PortfolioEditor({
  projects,
  contractorId,
  onRefresh,
}: PortfolioEditorProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(project: ContractorProject) {
    setForm({
      id: project.id,
      title: project.title,
      description: project.description || "",
      images: project.images || [],
    });
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const urls = await Promise.all(
        files.map((file) => {
          const path = `${contractorId}/projects/${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${file.name.split(".").pop()}`;
          return uploadImage(file, path);
        })
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploadingImages(false);
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Project title is required" });
      return;
    }
    setSaving(true);
    try {
      await upsertProject({
        ...(form.id ? { id: form.id } : {}),
        contractor_id: contractorId,
        title: form.title,
        description: form.description || null,
        images: form.images,
        sort_order: form.id
          ? projects.find((p) => p.id === form.id)?.sort_order ?? projects.length
          : projects.length,
      });
      toast({ title: "Project saved" });
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
      await deleteProject(id);
      toast({ title: "Project deleted" });
      onRefresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    [newProjects[index], newProjects[targetIndex]] = [
      newProjects[targetIndex],
      newProjects[index],
    ];

    try {
      await Promise.all(
        newProjects.map((proj, i) =>
          upsertProject({ ...proj, sort_order: i })
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
          <ImageIcon className="h-4 w-4 text-violet-600" />
          Portfolio
        </CardTitle>
        <Button size="sm" onClick={openAdd} variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Inline form */}
        {showForm && (
          <div className="border border-violet-200 rounded-lg p-4 bg-violet-50 space-y-3">
            <h4 className="font-semibold text-sm text-violet-800">
              {form.id ? "Edit Project" : "New Project"}
            </h4>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Master Bathroom Remodel"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe this project"
                rows={2}
              />
            </div>
            {/* Images */}
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Project image ${i + 1}`}
                      className="h-16 w-20 object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="h-16 w-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors focus:outline-none"
                >
                  {uploadingImages ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
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

        {/* Projects list */}
        {projects.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 text-center py-4">
            No projects yet. Add your first project.
          </p>
        )}

        {projects.map((project, index) => (
          <div
            key={project.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
          >
            {project.images?.[0] && (
              <img
                src={project.images[0]}
                alt={project.title}
                className="h-14 w-20 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{project.title}</p>
              {project.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {project.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {project.images?.length || 0} image
                {(project.images?.length || 0) !== 1 ? "s" : ""}
              </p>
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
                disabled={index === projects.length - 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus:outline-none"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEdit(project)}
                className="p-1 text-gray-400 hover:text-violet-600 focus:outline-none"
                aria-label="Edit project"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={deletingId === project.id}
                className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Delete project"
              >
                {deletingId === project.id ? (
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
