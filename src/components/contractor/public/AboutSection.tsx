import { CheckCircle2, MapPin, Star, Briefcase, ShieldCheck } from "lucide-react";
import type { ContractorPublicProfile } from "@/types/contractor";

interface AboutSectionProps {
  profile: ContractorPublicProfile;
  reviewCount: number;
  avgRating: number | null;
  projectCount: number;
  brandColor: string;
}

export function AboutSection({ profile, reviewCount, avgRating, projectCount, brandColor }: AboutSectionProps) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Framed card */}
        <div
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${brandColor}0d 0%, ${brandColor}18 50%, ${brandColor}08 100%)`,
            border: `2px solid ${brandColor}33`,
          }}
        >
          {/* Decorative background circles */}
          <div
            className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
          />
          {/* Subtle dot-grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(${brandColor} 1.5px, transparent 1.5px)`,
              backgroundSize: "28px 28px",
            }}
          />
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}66, transparent)` }}
          />

          {/* Section label */}
          <div className="relative flex items-center gap-3 mb-3">
            <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: brandColor }} />
            <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: brandColor }}>
              About Us
            </span>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* Left */}
          <div>
            <h2 className="text-4xl font-black text-gray-900 leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
              {profile.tagline || `Welcome to ${profile.company}`}
            </h2>

            <p className="text-gray-500 text-[16px] leading-relaxed mb-6">
              {profile.description ||
                "We are a dedicated renovation team committed to delivering exceptional quality and craftsmanship on every project. Your vision is our mission — we bring it to life with precision, care, and expertise."}
            </p>

            {profile.location && (
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-7">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
                Proudly serving {profile.location} and surrounding areas
              </div>
            )}

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Licensed & Insured", "Free Estimates", "Satisfaction Guaranteed", "On-Time Delivery"].map((b) => (
                <div key={b} className="flex items-center gap-2.5 text-[14px] font-semibold text-gray-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Right: stat cards */}
          <div className="space-y-4">
            {/* Rating card */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)` }}>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Client Satisfaction</p>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-black leading-none">
                  {avgRating !== null ? avgRating.toFixed(1) : "New"}
                </span>
                <div className="pb-1">
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="h-4 w-4"
                        fill={avgRating !== null && s <= Math.round(avgRating) ? "white" : "none"}
                        stroke="white" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs">
                    {reviewCount > 0 ? `${reviewCount} verified reviews` : "Be the first to review"}
                  </p>
                </div>
              </div>
            </div>

            {/* Two smaller cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center">
                <Briefcase className="h-6 w-6 mx-auto mb-2" style={{ color: brandColor }} />
                <div className="text-4xl font-black text-gray-900">{projectCount}</div>
                <div className="text-xs font-semibold text-gray-500 mt-1">Projects Completed</div>
              </div>
              <div className="rounded-2xl p-5 text-center border"
                style={{ borderColor: `${brandColor}33`, backgroundColor: `${brandColor}08` }}>
                <ShieldCheck className="h-6 w-6 mx-auto mb-2" style={{ color: brandColor }} />
                <div className="text-2xl font-black" style={{ color: brandColor }}>
                  {profile.verified ? "Verified" : "Trusted"}
                </div>
                <div className="text-xs font-semibold mt-1" style={{ color: `${brandColor}99` }}>
                  {profile.verified ? "Identity confirmed" : "Professional"}
                </div>
              </div>
            </div>
          </div>
        </div>{/* end grid */}
        </div>{/* end framed card */}
      </div>
    </section>
  );
}
