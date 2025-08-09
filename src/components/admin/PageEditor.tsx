import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Trash2, Save } from "lucide-react";
import { CmsBlock, CmsPage, updatePage } from "@/services/cmsService";
import { useToast } from "@/hooks/use-toast";

interface PageEditorProps {
  page: CmsPage;
  onSaved?: (page: CmsPage) => void;
}

export default function PageEditor({ page, onSaved }: PageEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState<"draft" | "published">(page.status);
  const [seoTitle, setSeoTitle] = useState(page.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(page.seo_description || "");
  const [seoCanonical, setSeoCanonical] = useState(page.seo_canonical || "");
  const [blocks, setBlocks] = useState<CmsBlock[]>(Array.isArray(page.content) ? (page.content as CmsBlock[]) : []);

  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);
    setSeoTitle(page.seo_title || "");
    setSeoDescription(page.seo_description || "");
    setSeoCanonical(page.seo_canonical || "");
    setBlocks(Array.isArray(page.content) ? (page.content as CmsBlock[]) : []);
  }, [page]);

  const addHero = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "hero",
        data: { headline: "New hero headline", subheadline: "Subheadline", ctaLabel: "Get started", ctaHref: "/auth", imageUrl: "" },
      },
    ]);
  };

  const addRich = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "richText",
        data: { html: "<p>Start writing content...</p>" },
      },
    ]);
  };

  const move = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;
      return next;
    });
  };

  const remove = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    try {
      const saved = await updatePage(page.id, {
        title: title.trim() || "Untitled",
        slug: slug.trim() || "untitled",
        status,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_canonical: seoCanonical || null,
        content: blocks,
      });
      toast({ title: "Saved", description: "Page updated successfully" });
      onSaved?.(saved);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Unknown error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g., pricing" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border bg-background px-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={addHero} className="">+ Hero</Button>
            <Button variant="outline" size="sm" onClick={addRich}>+ Rich Text</Button>
          </div>

          <div className="space-y-3">
            {blocks.map((block, i) => (
              <Card key={i} className="">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {block.type === "hero" ? "Hero Section" : "Rich Text"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => move(i, -1)} aria-label="Move up">
                      <ArrowUp size={16} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => move(i, 1)} aria-label="Move down">
                      <ArrowDown size={16} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => remove(i)} aria-label="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {block.type === "hero" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Headline</Label>
                        <Input
                          value={block.data.headline}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, headline: v } } : b));
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Subheadline</Label>
                        <Input
                          value={block.data.subheadline || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, subheadline: v } } : b));
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>CTA Label</Label>
                        <Input
                          value={block.data.ctaLabel || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, ctaLabel: v } } : b));
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>CTA Href</Label>
                        <Input
                          value={block.data.ctaHref || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, ctaHref: v } } : b));
                          }}
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label>Image URL</Label>
                        <Input
                          value={block.data.imageUrl || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, imageUrl: v } } : b));
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {block.type === "richText" && (
                    <div className="grid gap-2">
                      <Label>HTML</Label>
                      <Textarea
                        rows={6}
                        value={block.data.html}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, data: { ...(b as any).data, html: v } } : b));
                        }}
                        placeholder="<p>Write HTML content...</p>"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-3">
          <div className="grid gap-2">
            <Label>SEO Title</Label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Meta Description</Label>
            <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={4} />
          </div>
          <div className="grid gap-2">
            <Label>Canonical URL</Label>
            <Input value={seoCanonical} onChange={(e) => setSeoCanonical(e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-2">
        <div className="flex justify-end">
          <Button onClick={save} className="gap-2">
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
