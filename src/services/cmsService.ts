import { supabase } from "@/integrations/supabase/client";

export type CmsStatus = "draft" | "published";

export type CmsBlock =
  | {
      type: "hero";
      data: {
        headline: string;
        subheadline?: string;
        ctaLabel?: string;
        ctaHref?: string;
        imageUrl?: string;
      };
    }
  | {
      type: "richText";
      data: {
        html: string;
      };
    };

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_canonical?: string | null;
  open_graph?: any | null;
  content?: CmsBlock[] | null;
  status: CmsStatus;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  author_id?: string | null;
}

export interface CmsPageSummary {
  id: string;
  slug: string;
  title: string;
  status: CmsStatus;
  updated_at: string | null;
}

export async function fetchPages(): Promise<CmsPageSummary[]> {
  const { data, error } = await supabase
    .from("cms_pages")
    .select("id, slug, title, status, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as CmsPageSummary[];
}

export async function getPageById(id: string): Promise<CmsPage | null> {
  const { data, error } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as CmsPage;
}

export async function createPage(values: Partial<CmsPage>): Promise<CmsPage> {
  const payload: Partial<CmsPage> = {
    title: values.title?.trim() || "Untitled",
    slug: values.slug?.trim() || "untitled",
    status: (values.status as CmsStatus) || "draft",
    excerpt: values.excerpt || null,
    seo_title: values.seo_title || null,
    seo_description: values.seo_description || null,
    seo_canonical: values.seo_canonical || null,
    content: (values.content as CmsBlock[]) || [],
  };
  const { data, error } = await supabase
    .from("cms_pages")
    .insert(payload as any)
    .select("*")
    .single();
  if (error) throw error;
  return data as CmsPage;
}

export async function updatePage(id: string, values: Partial<CmsPage>): Promise<CmsPage> {
  const { data, error } = await supabase
    .from("cms_pages")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as CmsPage;
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("cms_pages").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const { data, error } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) return null;
  return data as CmsPage;
}
