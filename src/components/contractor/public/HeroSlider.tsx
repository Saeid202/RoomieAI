import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  Users,
  Headphones,
  ArrowRight,
} from "lucide-react";
import type { ContractorPublicProfile } from "@/types/contractor";

interface HeroSliderProps {
  profile: ContractorPublicProfile;
  onRequestQuote: () => void;
}

const TRUST_ICONS = [
  { icon: Shield,     label: "Licensed & Insured" },
  { icon: Truck,      label: "Fast Response" },
  { icon: Users,      label: "Expert Team" },
  { icon: Headphones, label: "24/7 Support" },
];

const DEFAULT_FEATURES = [
  {
    title: "Quality Craftsmanship",
    desc: "Every project delivered with precision, care, and attention to detail.",
  },
  {
    title: "Trusted Professionals",
    desc: "Licensed, insured, and committed to your satisfaction on every job.",
  },
];

export function HeroSlider({ profile, onRequestQuote }: HeroSliderProps) {
  const images = (profile.cover_images ?? []).filter(Boolean);
  const hasImages = images.length > 0;
  const [current, setCurrent] = useState(0);
  const brandColor = profile.primary_color || "#7C3AED";

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % Math.max(images.length, 1)),
    [images.length]
  );
  const prev = () =>
    setCurrent(
      (c) => (c - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1)
    );

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next, images.length]);

  return (
    /* White page background with padding — slider is a contained card */
    <div className="w-full bg-white py-5 px-4 sm:px-10 lg:px-20">
      <div className="max-w-5xl mx-auto relative">

        {/* ── The slider card ── */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ height: 400 }}
        >
          {/* ── Background: real photos ── */}
          {hasImages ? (
            images.map((src, i) => (
              <div
                key={src}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === current ? 1 : 0 }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))
          ) : (
            /* Fallback gradient when no images uploaded */
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, #0f0520 0%, ${brandColor}cc 55%, #1a0a3d 100%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                  backgroundSize: "36px 36px",
                }}
              />
              {/* Text content only shown on fallback gradient */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-8 sm:px-10 max-w-lg">
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: `${brandColor}99`,
                    }}
                  >
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: brandColor }}
                    >
                      {profile.location || profile.company}
                    </span>
                    <ArrowRight className="h-3 w-3 text-white/40" />
                  </div>
                  <h1
                    className="font-black text-white leading-tight"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", letterSpacing: "-0.02em" }}
                  >
                    {profile.tagline
                      ? profile.tagline.split(" ").slice(0, 3).join(" ")
                      : "Professional in"}
                  </h1>
                  <h2
                    className="font-black leading-tight mb-5"
                    style={{
                      fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                      letterSpacing: "-0.02em",
                      color: "#F59E0B",
                    }}
                  >
                    {profile.tagline
                      ? profile.tagline.split(" ").slice(3).join(" ") || profile.company
                      : profile.company}
                  </h2>
                  <div className="space-y-3">
                    {DEFAULT_FEATURES.map((f) => (
                      <div key={f.title} className="flex items-start gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${brandColor}66` }}
                        >
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-[13px] leading-tight">{f.title}</p>
                          <p className="text-white/55 text-[12px] leading-snug mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom gradient — only for trust bar readability ── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-14 z-10"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)",
            }}
          />

          {/* ── Left arrow ── */}
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center text-white transition-all focus:outline-none border border-white/20 hover:bg-white/20 z-20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* ── Right arrow ── */}
          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center text-white transition-all focus:outline-none border border-white/20 hover:bg-white/20 z-20"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* ── Dot indicators ── */}
          {images.length > 1 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300 focus:outline-none"
                  style={{
                    width: i === current ? 24 : 7,
                    height: 7,
                    backgroundColor:
                      i === current ? "white" : "rgba(255,255,255,0.45)",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Bottom trust icon bar ── */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
          >
            {TRUST_ICONS.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 flex-1 py-2.5"
                style={{
                  borderRight:
                    i < TRUST_ICONS.length - 1
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "none",
                }}
              >
                <Icon className="h-5 w-5 text-white/80" />
                <span className="text-white/65 text-[10px] font-semibold uppercase tracking-wider hidden sm:block">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* end slider card */}

      </div>
    </div>
  );
}
