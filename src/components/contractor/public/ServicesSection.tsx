import { Wrench } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { ContractorService } from "@/types/contractor";

interface ServicesSectionProps {
  services: ContractorService[];
  brandColor: string;
  accentColor: string;
  onGetQuote: () => void;
}

// Amber/gold accent — matches the reference image border/label color
const GOLD = "#F59E0B";function DynamicIcon({ name, size = 20 }: { name: string; size?: number }) {
  const pascal = name
    .split(/[-_\s]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  const Icon = (LucideIcons as Record<string, any>)[pascal];
  const El = Icon && typeof Icon === "function" ? Icon : Wrench;
  return <El style={{ width: size, height: size }} />;
}

function parseBullets(desc: string | null): string[] {
  if (!desc) return [];
  const lines = desc.split(/\n|;/).map((l) => l.trim()).filter(Boolean);
  return lines.length > 1 ? lines : [];
}

/** Draws the 4-corner bracket frame used in the reference */
function CornerBrackets({ color }: { color: string }) {
  const s = 14; // bracket arm length px
  const t = 2;  // thickness px
  const style = { position: "absolute" as const, width: s, height: s };
  const line = { backgroundColor: color, position: "absolute" as const };
  return (
    <>
      {/* top-left */}
      <span style={{ ...style, top: 8, left: 8 }}>
        <span style={{ ...line, top: 0, left: 0, width: t, height: s }} />
        <span style={{ ...line, top: 0, left: 0, width: s, height: t }} />
      </span>
      {/* top-right */}
      <span style={{ ...style, top: 8, right: 8 }}>
        <span style={{ ...line, top: 0, right: 0, width: t, height: s }} />
        <span style={{ ...line, top: 0, right: 0, width: s, height: t }} />
      </span>
      {/* bottom-left */}
      <span style={{ ...style, bottom: 8, left: 8 }}>
        <span style={{ ...line, bottom: 0, left: 0, width: t, height: s }} />
        <span style={{ ...line, bottom: 0, left: 0, width: s, height: t }} />
      </span>
      {/* bottom-right */}
      <span style={{ ...style, bottom: 8, right: 8 }}>
        <span style={{ ...line, bottom: 0, right: 0, width: t, height: s }} />
        <span style={{ ...line, bottom: 0, right: 0, width: s, height: t }} />
      </span>
    </>
  );
}

export function ServicesSection({ services, brandColor, accentColor, onGetQuote }: ServicesSectionProps) {
  const GOLD = accentColor || "#F59E0B";
  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16">

        {/* ── Header card ── */}
        <div className="flex justify-center mb-12">
          <div
            className="relative px-14 py-9 rounded-2xl text-center w-full max-w-md"
            style={{ backgroundColor: brandColor }}
          >
            {/* Corner bracket decorations in gold */}
            <CornerBrackets color={GOLD} />

            {/* "WHAT WE OFFER" amber pill */}
            <div
              className="inline-flex items-center px-4 py-1 rounded-full mb-3"
              style={{ backgroundColor: GOLD }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white">
                What We Offer
              </span>
            </div>

            <h2 className="text-[2rem] font-black text-white leading-tight mb-2">
              Our Services
            </h2>
            <p className="text-white/70 text-[13px] leading-relaxed">
              Professional renovation services tailored to your needs and budget.
              We deliver quality you can see.
            </p>
          </div>
        </div>

        {/* ── Service cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const bullets = parseBullets(service.description);

            return (
              <div
                key={service.id}
                className="flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ border: `1.5px solid ${GOLD}` }}
              >
                <div className="p-6 flex flex-col flex-1">

                  {/* Icon circle + title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      <DynamicIcon name={service.icon_name || "wrench"} size={18} />
                    </div>
                    <h3 className="font-black text-gray-900 text-[15px] leading-snug capitalize pt-1.5">
                      {service.service_name}
                    </h3>
                  </div>

                  {/* Plain description (single block) */}
                  {!bullets.length && service.description && (
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-4">
                      {service.description}
                    </p>
                  )}

                  {/* Bulleted description */}
                  {bullets.length > 0 && (
                    <>
                      <p className="text-gray-500 text-[13px] leading-relaxed mb-3">
                        {bullets[0]}
                      </p>
                    </>
                  )}

                  {/* HOW IT WORKS */}
                  {bullets.length > 1 && (
                    <div className="mb-4 flex-1">
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.18em] mb-2"
                        style={{ color: GOLD }}
                      >
                        How It Works
                      </p>
                      <ol className="space-y-1.5">
                        {bullets.slice(1).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                            <span
                              className="shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-white text-[9px] font-black mt-0.5"
                              style={{ backgroundColor: brandColor }}
                            >
                              {i + 1}
                            </span>
                            {b}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {!bullets.length && !service.description && (
                    <p className="text-gray-400 text-[13px] italic mb-4 flex-1">
                      Quality workmanship, every time.
                    </p>
                  )}

                  <div className="flex-1" />
                </div>

                {/* Full-width solid CTA button */}
                <button
                  onClick={onGetQuote}
                  className="w-full py-3 text-[13px] font-black text-white tracking-wide transition-opacity hover:opacity-90 focus:outline-none"
                  style={{ backgroundColor: brandColor }}
                >
                  Inquire About This Service
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
