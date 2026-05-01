import { useEffect, useState, useTransition } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchPublishedPageBySlug, CmsPage, CmsBlock } from "@/services/cmsService";

interface CmsPageRendererProps {
  slug: string;
  fallback: React.ReactNode;
}

function renderBlock(block: CmsBlock, i: number) {
  if (block.type === "hero") {
    const { headline, subheadline, ctaLabel, ctaHref, imageUrl } = block.data;
    return (
      <div key={i} className="text-center py-12">
        {imageUrl && <img src={imageUrl} alt={headline} className="mx-auto mb-6 max-h-64 object-cover rounded-lg" />}
        <h1 className="text-4xl font-bold mb-4">{headline}</h1>
        {subheadline && <p className="text-xl text-gray-600 mb-6">{subheadline}</p>}
        {ctaLabel && ctaHref && (
          <a href={ctaHref} className="inline-block px-6 py-3 bg-roomie-purple text-white rounded-full hover:bg-roomie-dark transition-colors">
            {ctaLabel}
          </a>
        )}
      </div>
    );
  }
  if (block.type === "richText") {
    return (
      <div
        key={i}
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: block.data.html }}
      />
    );
  }
  return null;
}

export default function CmsPageRenderer({ slug, fallback }: CmsPageRendererProps) {
  const [page, setPage] = useState<CmsPage | null>(null);
  // Start as false so we render the fallback immediately on first paint
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublishedPageBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          startTransition(() => {
            setPage(data);
            setFetched(true);
            setLoading(false);
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          startTransition(() => {
            setFetched(true);
            setLoading(false);
          });
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Not fetched yet or loading — render fallback immediately (no flash, no suspension)
  if (!fetched || loading) {
    return <>{fallback}</>;
  }

  // No CMS content — render fallback
  if (!page || !Array.isArray(page.content) || page.content.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {(page.content as CmsBlock[]).map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
