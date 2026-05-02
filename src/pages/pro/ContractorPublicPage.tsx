import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useContractorPublicPage } from "@/hooks/useContractorPublicPage";
import { ContractorNavbar } from "@/components/contractor/public/ContractorNavbar";
import { HeroSlider } from "@/components/contractor/public/HeroSlider";
import { ServicesSection } from "@/components/contractor/public/ServicesSection";
import { PortfolioSection } from "@/components/contractor/public/PortfolioSection";
import { ReviewsSection } from "@/components/contractor/public/ReviewsSection";
import { Footer } from "@/components/contractor/public/Footer";
import { StickyMobileCTA } from "@/components/contractor/public/StickyMobileCTA";
import { LeadCaptureModal } from "@/components/contractor/public/LeadCaptureModal";
import { ReviewModal } from "@/components/contractor/public/ReviewModal";

export default function ContractorPublicPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { profile, services, projects, reviews, loading, notFound } =
    useContractorPublicPage(slug);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
        <p className="text-lg text-gray-500">This contractor page doesn't exist.</p>
      </div>
    );
  }

  if (!profile.is_published) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <h1 className="text-3xl font-extrabold text-gray-900">{profile.company}</h1>
        <p className="text-lg text-gray-500">This page is coming soon.</p>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const brandColor = profile.primary_color || "#7C3AED";
  const accentColor = profile.accent_color || "#F59E0B";
  const brandStyle = { "--brand": brandColor, "--accent": accentColor } as React.CSSProperties;

  return (
    <div style={brandStyle} className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <ContractorNavbar
        profile={profile}
        onGetQuote={() => setIsLeadModalOpen(true)}
      />

      {/* Hero slider */}
      <HeroSlider
        profile={profile}
        onRequestQuote={() => setIsLeadModalOpen(true)}
      />

      {/* Services */}
      <div id="services" className="bg-gray-50">
        <ServicesSection 
          services={services} 
          brandColor={brandColor} 
          accentColor={accentColor}
          slug={slug}
          onGetQuote={() => setIsLeadModalOpen(true)} 
        />
      </div>

      {/* Portfolio */}
      <div id="portfolio" className="bg-gray-50">
        <PortfolioSection 
          projects={projects} 
          brandColor={brandColor} 
        />
      </div>

      {/* Reviews */}
      <div id="reviews" className="bg-gray-50">
        <ReviewsSection 
          reviews={reviews} 
          brandColor={brandColor}
          onLeaveReview={() => setIsReviewModalOpen(true)}
        />
      </div>

      {/* Footer */}
      <Footer 
        profile={profile}
        brandColor={brandColor}
        onGetQuote={() => setIsLeadModalOpen(true)}
      />

      {/* Mobile sticky CTA */}
      <div className="h-16 md:hidden" />
      <StickyMobileCTA
        onGetQuote={() => setIsLeadModalOpen(true)}
        brandColor={brandColor}
      />

      {/* Modals */}
      <LeadCaptureModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        contractorId={profile.id}
        contractorName={profile.company}
        slug={slug}
      />
      <ReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        contractorId={profile.id}
      />
    </div>
  );
}
