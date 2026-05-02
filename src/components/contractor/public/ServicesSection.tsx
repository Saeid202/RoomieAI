import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ServiceDescription } from "./ServiceDescription";

interface Service {
  id: string;
  contractor_id: string;
  service_name: string;
  description: string | null;
  description_html: string | null;
  icon_name: string | null;
  image_url: string | null;
  sort_order: number;
  title_bold?: boolean;
}

interface ServicesSectionProps {
  services: Service[];
  brandColor: string;
  accentColor: string;
  slug: string;
  onGetQuote: () => void;
}

/** Gradient placeholder shown when no image is uploaded for a service */
function ServiceImagePlaceholder({ brandColor, name }: { brandColor: string; name: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${brandColor}22 0%, ${brandColor}55 100%)`,
      }}
    >
      <span
        className="text-5xl font-bold select-none"
        style={{ color: brandColor, opacity: 0.35 }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function ServicesSection({
  services,
  brandColor,
  accentColor,
  slug,
  onGetQuote,
}: ServicesSectionProps) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="pt-20 pb-8 bg-transparent">
      <div className="w-full px-4 sm:px-8 lg:px-16">

        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: brandColor }}
          >
            What We Do
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
            Our Services
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{ backgroundColor: brandColor }}
          />
        </div>

        {/* ── Cards grid — 3 per row, wraps naturally ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <article
              key={service.id}
              className="group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* ── Full-bleed image (4:3 ratio) ── */}
              <div className="relative w-full overflow-hidden" style={{ paddingTop: "75%" }}>
                <div className="absolute inset-0">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.service_name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <ServiceImagePlaceholder
                      brandColor={brandColor}
                      name={service.service_name}
                    />
                  )}
                  {/* Subtle bottom gradient so the divider line reads cleanly */}
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="h-px w-full bg-gray-200" />

              {/* ── Text content ── */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className={`text-gray-900 text-xl mb-2 leading-snug ${service.title_bold ? 'font-bold' : 'font-semibold'}`}>
                  {service.service_name}
                </h3>
                <div className="flex-1">
                  <ServiceDescription
                    descriptionHtml={service.description_html ?? null}
                    description={service.description || "Professional service with quality craftsmanship and attention to detail."}
                    brandColor={brandColor}
                  />
                </div>
                {/* ── Learn more link ── */}
                <Link
                  to={`/pro/${slug}/services/${service.id}`}
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium transition-colors duration-200"
                  style={{ color: brandColor }}
                  aria-label={`Learn more about ${service.service_name}`}
                >
                  Learn more
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="text-center mt-14">
          <button
            onClick={onGetQuote}
            className="flex items-center justify-center gap-2 mx-auto py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-lg"
            style={{
              backgroundColor: accentColor || brandColor,
              color: "#1e293b",
              boxShadow: `0 8px 24px ${accentColor || brandColor}55`,
              width: "100%",
              maxWidth: "100%",
            }}
          >
            Get a Free Quote
          </button>
        </div>
      </div>
    </section>
  );
}
