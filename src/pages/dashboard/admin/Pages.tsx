import { useEffect, useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageEditor from "@/components/admin/PageEditor";
import { fetchPages as cmsFetchPages, createPage as cmsCreatePage, getPageById, updatePage as cmsUpdatePage, deletePage as cmsDeletePage, CmsPage, CmsPageSummary } from "@/services/cmsService";

export default function PagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<CmsPageSummary[]>([]);
  const [query, setQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "" });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);


  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(p =>
      p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [pages, query]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await cmsFetchPages();
        setPages(data);
      } catch (e: any) {
        console.error(e);
        toast({ title: "Failed to load pages", description: e.message || "" });
      }
    };
    load();
  }, []);

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm({ title: "", slug: "" });
    setIsDialogOpen(true);
  };
  const openEdit = async (id: string) => {
    try {
      const full = await getPageById(id);
      if (full) {
        setEditingPage(full);
        setIsEditorOpen(true);
      }
    } catch (e: any) {
      toast({ title: "Failed to open editor", description: e.message || "" });
    }
  };
  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Missing fields", description: "Please enter title and slug." });
      return;
    }

    try {
      if (mode === "add") {
        const created = await cmsCreatePage({ title: form.title.trim(), slug: form.slug.trim(), status: "draft" });
        toast({ title: "Page created", description: `${form.title} has been added.` });
        setIsDialogOpen(false);
        // Refresh list
        const data = await cmsFetchPages();
        setPages(data);
        // Open editor
        setEditingPage(created);
        setIsEditorOpen(true);
      } else if (mode === "edit" && editingId) {
        const updated = await cmsUpdatePage(editingId, { title: form.title.trim(), slug: form.slug.trim() });
        toast({ title: "Page updated", description: `${form.title} has been saved.` });
        setIsDialogOpen(false);
        const data = await cmsFetchPages();
        setPages(data);
        setEditingPage(updated);
        setIsEditorOpen(true);
      }
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Unknown error" });
    }
  };
  const handleDelete = async (id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    if (confirm(`Delete "${page.title}"?`)) {
      try {
        await cmsDeletePage(id);
        const data = await cmsFetchPages();
        setPages(data);
        toast({ title: "Page deleted", description: `${page.title} was removed.` });
      } catch (e: any) {
        toast({ title: "Delete failed", description: e.message || "Unknown error" });
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground mt-1">Manage website pages and content</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Input
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:w-64"
            aria-label="Search pages"
          />
          <Button className="flex items-center gap-2" onClick={openAdd}>
            <Plus size={18} />
            Add New Page
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No pages found.</TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>{page.updated_at ? new Date(page.updated_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(page.id)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(page.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add New Page" : "Edit Page"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Pricing"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g., /pricing"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
