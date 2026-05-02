import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getProfileBySlug,
  getServiceById,
  getProjectsByService,
} from "@/services/contractorPublicPageService";
import { ContractorNavbar } from "@/components/contractor/public/ContractorNavbar";
import { PortfolioLightbox } from "@/components/contractor/public/PortfolioLightbox";
import { LeadCaptureModal } from "@/components/contractor/public/LeadCaptureModal";
import { StickyMobileCTA } from "@/components/contractor/public/StickyMobileCTA";
import type {
  ContractorPublicProfile,
  ContractorService,
  ContractorProject,
} from "@/types/contractor";

export default function ServiceDetailPage() {
  const { slug = "", serviceId = "" } = useParams<{
    slug: string;
    serviceId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<ContractorPublicProfile | null>(null);
  const [service, setService] = useState<ContractorService | null>(null);
  const [projects, setProjects] = useState<ContractorProject[]>([]);
  const [lightboxProject, setLightboxProject] =
    useState<ContractorProject | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prof = await getProfileBySlug(slug);
      if (!prof || !prof.is_published) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const [svc, projs] = await Promise.all([
        getServiceById(serviceId),
        getProjectsByService(serviceId),
      ]);
      if (!svc || svc.contractor_id !== prof.id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(prof);
      setService(svc);
      setProjects(projs);
      setLoading(false);
    }
    load();
  }, [slug, serviceId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !profile || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
        <p className="text-lg text-gray-500">This service page doesn't exist.</p>
        <Link
          to={`/pro/${slug}`}
          className="text-violet-600 hover:underline text-sm font-medium"
        >
          ← Back to contractor page
        </Link>
      </div>
    );
  }

  const brandColor = profile.primary_color || "#7C3AED";
  const accentColor = (profile as any).accent_color || "#F59E0B";
  const brandStyle = {
    "--brand": brandColor,
    "--accent": accentColor,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className="min-h-screen bg-white">
      {/* ── Sticky navbar (same as main page) ── */}
      <ContractorNavbar
        profile={profile}
        onGetQuote={() => setIsLeadModalOpen(true)}
      />

      {/* ── Hero image ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "50vh", minHeight: 280 }}>
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.service_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${brandColor}33 0%, ${brandColor}88 100%)`,
            }}
          />
        )}
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Service name overlay */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 sm:px-12 sm:pb-14">
          <Link
            to={`/pro/${slug}#services`}
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>
          <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
            {service.service_name}
          </h1>
        </div>
      </div>

      {/* ── Description ── */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 py-14">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
          style={{ color: brandColor }}
        >
          About This Service
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          {service.description ||
            "We deliver this service with the highest standards of craftsmanship and attention to detail."}
        </p>
      </section>

      {/* ── Project gallery (only if tagged projects exist) ── */}
      {projects.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
            <div className="mb-10">
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
                style={{ color: brandColor }}
              >
                Our Work
              </p>
              <h2 className="text-3xl font-light text-gray-900 tracking-tight">
                Related Projects
              </h2>
              <div
                className="mt-3 h-px w-12"
                style={{ backgroundColor: brandColor }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setLightboxProject(project)}
                  className="group relative rounded-xl overflow-hidden bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-left"
                  style={{ paddingTop: "75%" }}
                  aria-label={`View project: ${project.title}`}
                >
                  <div className="absolute inset-0">
                    {project.images?.[0] ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${brandColor}22 0%, ${brandColor}44 100%)`,
                        }}
                      />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                    {/* Caption */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-semibold text-sm leading-snug drop-shadow">
                        {project.title}
                      </p>
                      {project.description && (
                        <p className="text-white/80 text-xs mt-0.5 line-clamp-2 drop-shadow">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Quote CTA ── */}
      <section className="py-20 text-center px-6">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
          style={{ color: brandColor }}
        >
          Ready to Start?
        </p>
        <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8 tracking-tight">
          Get a quote for {service.service_name}
        </h2>
        <button
          onClick={() => setIsLeadModalOpen(true)}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-lg"
          style={{
            backgroundColor: accentColor,
            color: "#1e293b",
            boxShadow: `0 8px 24px ${accentColor}55`,
          }}
        >
          Request a Free Quote
        </button>
        <p className="text-gray-400 text-xs mt-4 tracking-wide">
          No obligation · Fast response · Professional service
        </p>
      </section>

      {/* ── Mobile sticky CTA ── */}
      <div className="h-16 md:hidden" />
      <StickyMobileCTA
        onGetQuote={() => setIsLeadModalOpen(true)}
        brandColor={brandColor}
      />

      {/* ── Lightbox ── */}
      <PortfolioLightbox
        project={lightboxProject}
        onClose={() => setLightboxProject(null)}
      />

      {/* ── Lead modal ── */}
      <LeadCaptureModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        contractorId={profile.id}
        contractorName={profile.company}
        slug={slug}
      />
    </div>
  );
}
