import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Save, Upload, Trash2, Loader2, ImageIcon, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PageEditor from "@/components/admin/PageEditor";
import { fetchPages as cmsFetchPages, createPage as cmsCreatePage, getPageById, updatePage as cmsUpdatePage, deletePage as cmsDeletePage, CmsPage, CmsPageSummary } from "@/services/cmsService";
import { getSiteSetting, setSiteSetting, uploadHeroBanner, removeHeroBanner } from "@/services/siteSettingsService";

export default function PagesPage() {
  const { toast } = useToast();

  // ── CMS pages state ──────────────────────────────────────────
  const [pages, setPages] = useState<CmsPageSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "" });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);

  // ── Hero banner state ────────────────────────────────────────
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [heroMode, setHeroMode] = useState<"default" | "banner" | "fullbanner">("default");
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [heroModeUpdating, setHeroModeUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load pages ───────────────────────────────────────────────
  useEffect(() => {
    cmsFetchPages()
      .then(setPages)
      .catch((e: any) => toast({ title: "Failed to load pages", description: e.message || "" }));

    Promise.all([
      getSiteSetting("hero_banner_url"),
      getSiteSetting("hero_mode"),
    ]).then(([url, m]) => {
      setBannerUrl(url);
      setHeroMode((m as "default" | "banner") || "default");
    }).finally(() => setBannerLoading(false));
  }, []);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(p =>
      p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [pages, query]);

  // ── CMS page actions ─────────────────────────────────────────
  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm({ title: "", slug: "" });
    setIsDialogOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const full = await getPageById(id);
      if (full) { setEditingPage(full); setIsEditorOpen(true); }
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
        toast({ title: "Page created" });
        setIsDialogOpen(false);
        setPages(await cmsFetchPages());
        setEditingPage(created);
        setIsEditorOpen(true);
      } else if (mode === "edit" && editingId) {
        const updated = await cmsUpdatePage(editingId, { title: form.title.trim(), slug: form.slug.trim() });
        toast({ title: "Page updated" });
        setIsDialogOpen(false);
        setPages(await cmsFetchPages());
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
        setPages(await cmsFetchPages());
        toast({ title: "Page deleted", description: `${page.title} was removed.` });
      } catch (e: any) {
        toast({ title: "Delete failed", description: e.message || "Unknown error" });
      }
    }
  };

  // ── Hero banner actions ──────────────────────────────────────
  const handleHeroModeChange = async (m: "default" | "banner" | "fullbanner") => {
    setHeroModeUpdating(true);
    try {
      await setSiteSetting("hero_mode", m);
      setHeroMode(m);
      toast({
        title: m === 'banner' ? 'Split banner active' : m === 'fullbanner' ? 'Full banner active' : 'Default mode active',
        description: m === 'banner'
          ? 'The hero shows text left, your banner right.'
          : m === 'fullbanner'
          ? 'Your banner now fills the entire hero section.'
          : 'The hero shows the default platform diagram.',
      });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setHeroModeUpdating(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadHeroBanner(file);
      setBannerUrl(url);
      toast({ title: "Banner uploaded", description: "The hero banner has been updated." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBannerRemove = async () => {
    setBannerUploading(true);
    try {
      await removeHeroBanner();
      setBannerUrl(null);
      if (heroMode === "banner") {
        await setSiteSetting("hero_mode", "default");
        setHeroMode("default");
      }
      toast({ title: "Banner removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
    }
  };

  // ── If editor is open, show it full-screen ───────────────────
  if (isEditorOpen && editingPage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>
            ← Back to Pages
          </Button>
          <h2 className="text-xl font-semibold">{editingPage.title}</h2>
          <span className="text-sm text-muted-foreground">/{editingPage.slug}</span>
        </div>
        <PageEditor page={editingPage} onSaved={(saved) => {
          setEditingPage(saved);
          cmsFetchPages().then(setPages);
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground mt-1">Manage website pages, content, and the landing page hero</p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages" className="gap-2">
            <Layout size={15} /> All Pages
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-2">
            <ImageIcon size={15} /> Hero Section
          </TabsTrigger>
        </TabsList>

        {/* ── ALL PAGES TAB ── */}
        <TabsContent value="pages" className="space-y-4 mt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <Input
              placeholder="Search pages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
              aria-label="Search pages"
            />
            <Button className="flex items-center gap-2" onClick={openAdd}>
              <Plus size={18} />
              Add New Page
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>URL Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No pages found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            page.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {page.status}
                          </span>
                        </TableCell>
                        <TableCell>{page.updated_at ? new Date(page.updated_at).toLocaleDateString() : "—"}</TableCell>
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
        </TabsContent>

        {/* ── HERO SECTION TAB ── */}
        <TabsContent value="hero" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Mode</CardTitle>
              <CardDescription>
                Choose what displays in the landing page hero — the default platform diagram or your own uploaded banner image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bannerLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : (
                <>
                  {/* Mode selector */}
                  <div className="grid grid-cols-3 gap-3 max-w-2xl">
                    {/* Default */}
                    <button
                      onClick={() => handleHeroModeChange("default")}
                      disabled={heroModeUpdating}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        heroMode === "default"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                        Platform Diagram
                      </div>
                      <span className="text-sm font-semibold">Default</span>
                      <span className="text-xs text-center text-muted-foreground">Split layout with diagram</span>
                      {heroMode === "default" && <span className="text-xs text-primary font-medium">● Active</span>}
                    </button>

                    {/* Split Banner */}
                    <button
                      onClick={() => handleHeroModeChange("banner")}
                      disabled={heroModeUpdating || !bannerUrl}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        heroMode === "banner"
                          ? "border-primary bg-primary/5 text-primary"
                          : !bannerUrl
                          ? "border-border opacity-50 cursor-not-allowed text-muted-foreground"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {bannerUrl
                          ? <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                          : <span className="text-xs text-muted-foreground">No banner</span>
                        }
                      </div>
                      <span className="text-sm font-semibold">Split Banner</span>
                      <span className="text-xs text-center text-muted-foreground">Text left, image right</span>
                      {heroMode === "banner" && <span className="text-xs text-primary font-medium">● Active</span>}
                      {!bannerUrl && <span className="text-xs text-muted-foreground">Upload first</span>}
                    </button>

                    {/* Full Banner */}
                    <button
                      onClick={() => handleHeroModeChange("fullbanner")}
                      disabled={heroModeUpdating || !bannerUrl}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        heroMode === "fullbanner"
                          ? "border-primary bg-primary/5 text-primary"
                          : !bannerUrl
                          ? "border-border opacity-50 cursor-not-allowed text-muted-foreground"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center relative">
                        {bannerUrl ? (
                          <>
                            <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">FULL WIDTH</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No banner</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold">Full Banner</span>
                      <span className="text-xs text-center text-muted-foreground">Image fills entire hero</span>
                      {heroMode === "fullbanner" && <span className="text-xs text-primary font-medium">● Active</span>}
                      {!bannerUrl && <span className="text-xs text-muted-foreground">Upload first</span>}
                    </button>
                  </div>

                  {/* Upload section */}
                  <div className="border-t pt-5 space-y-3">
                    <div>
                      <Label className="text-sm font-semibold">Banner Image</Label>
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 1920×600px. JPG, PNG, or WebP.</p>
                    </div>

                    {bannerUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-border aspect-[16/5] bg-muted max-w-2xl">
                        <img src={bannerUrl} alt="Hero banner" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={bannerUploading}
                        className="gap-2"
                      >
                        {bannerUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {bannerUrl ? "Replace Banner" : "Upload Banner"}
                      </Button>
                      {bannerUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBannerRemove}
                          disabled={bannerUploading}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add / Edit dialog */}
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
                placeholder="e.g., pricing"
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
