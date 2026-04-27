import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPageBySlug(slug)
      .then(setPage)
      .finally(() => setLoading(false));
  }, [slug]);

  // Still loading — render nothing (avoids flash)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
            <div className="space-y-3 max-w-4xl mx-auto">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No CMS page found — render the hardcoded fallback
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
