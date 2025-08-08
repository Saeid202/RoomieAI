import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Dummy data for demonstration
const dummyPages = [
  { id: 1, title: "Home Page", slug: "/", lastModified: "2025-05-15" },
  { id: 2, title: "About Us", slug: "/about", lastModified: "2025-05-10" },
  { id: 3, title: "Contact", slug: "/contact", lastModified: "2025-05-12" },
  { id: 4, title: "FAQ", slug: "/faq", lastModified: "2025-05-14" },
];

export default function PagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState(dummyPages);
  const [query, setQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("edit");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", slug: "" });

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(p =>
      p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm({ title: "", slug: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (id: number) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    setMode("edit");
    setEditingId(id);
    setForm({ title: page.title, slug: page.slug });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Missing fields", description: "Please enter title and slug." });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (mode === "add") {
      const nextId = Math.max(0, ...pages.map(p => p.id)) + 1;
      setPages(prev => [...prev, { id: nextId, title: form.title.trim(), slug: form.slug.trim(), lastModified: today }]);
      toast({ title: "Page created", description: `${form.title} has been added.` });
    } else if (mode === "edit" && editingId != null) {
      setPages(prev => prev.map(p =>
        p.id === editingId ? { ...p, title: form.title.trim(), slug: form.slug.trim(), lastModified: today } : p
      ));
      toast({ title: "Page updated", description: `${form.title} has been saved.` });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    if (confirm(`Delete "${page.title}"?`)) {
      setPages(prev => prev.filter(p => p.id !== id));
      toast({ title: "Page deleted", description: `${page.title} was removed.` });
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
                    <TableCell>{page.lastModified}</TableCell>
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
