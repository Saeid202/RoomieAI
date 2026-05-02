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
    /* Luxurious dark background matching other sections */
    <div className="w-full relative overflow-hidden" 
         style={{ 
           background: "linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)",
           height: "100vh"
         }}>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" 
           style={{
             backgroundImage: "radial-gradient(circle, #fbbf24 1.5px, transparent 1.5px)",
             backgroundSize: "40px 40px"
           }} />
      <div className="pointer-events-none absolute top-10 left-10 w-64 h-64 rounded-full opacity-[0.08]" 
           style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-10 right-10 w-48 h-48 rounded-full opacity-[0.06]" 
           style={{ background: "radial-gradient(circle, #fde047 0%, transparent 70%)" }} />

      <div className="relative w-full h-full">

        {/* ── The luxurious slider card ── */}
        <div
          className="relative w-full overflow-hidden rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl"
          style={{ 
            height: "100vh",
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)"
          }}
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
            /* Luxurious fallback gradient when no images uploaded */
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)",
              }}
            >
              {/* Gold corner accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t border-l rounded-tl" 
                   style={{ borderColor: "#fbbf24", boxShadow: "0 0 8px rgba(251, 191, 36, 0.3)" }} />
              <div className="absolute top-4 right-4 w-6 h-6 border-t border-r rounded-tr" 
                   style={{ borderColor: "#fbbf24", boxShadow: "0 0 8px rgba(251, 191, 36, 0.3)" }} />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l rounded-bl" 
                   style={{ borderColor: "#fbbf24", boxShadow: "0 0 8px rgba(251, 191, 36, 0.3)" }} />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r rounded-br" 
                   style={{ borderColor: "#fbbf24", boxShadow: "0 0 8px rgba(251, 191, 36, 0.3)" }} />

              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: "radial-gradient(circle, #fbbf24 1.5px, transparent 1.5px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Luxurious text content only shown on fallback gradient */}
              <div className="absolute inset-0 flex items-start justify-center px-8 sm:px-10 pt-12">
                <div className="max-w-lg w-full mt-8">
                  <div
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20"
                    style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(253,224,71,0.1) 100%)",
                      borderColor: "#fbbf24",
                      boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                    }}
                  >
                    <span
                      className="text-xs font-light uppercase tracking-[0.3em] text-amber-400"
                    >
                      {profile.location || profile.company}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/80" />
                  </div>
                  <h1
                    className="font-light text-white leading-tight tracking-wide mb-4"
                    style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.02em" }}
                  >
                    {profile.tagline
                      ? profile.tagline.split(" ").slice(0, 3).join(" ")
                      : "Professional in"}
                  </h1>
                  <h2
                    className="font-light leading-tight mb-6"
                    style={{
                      fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
                      letterSpacing: "-0.02em",
                      color: "#fbbf24",
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
                          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm border border-white/20"
                          style={{ 
                            background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                            color: "#1e293b",
                            boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-white font-light text-sm leading-tight tracking-wide">{f.title}</p>
                          <p className="text-white/70 text-xs leading-snug mt-1">{f.desc}</p>
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

          {/* ── Luxurious Left arrow ── */}
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none border border-white/20 hover:bg-white/10 hover:scale-110 z-20 backdrop-blur-sm"
              style={{ 
                backgroundColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* ── Luxurious Right arrow ── */}
          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none border border-white/20 hover:bg-white/10 hover:scale-110 z-20 backdrop-blur-sm"
              style={{ 
                backgroundColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* ── Luxurious Dot indicators ── */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300 focus:outline-none hover:scale-110"
                  style={{
                    width: i === current ? 28 : 8,
                    height: 8,
                    backgroundColor:
                      i === current ? "#fbbf24" : "rgba(255,255,255,0.3)",
                    boxShadow: i === current ? "0 0 12px rgba(251, 191, 36, 0.5)" : "none"
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Luxurious Bottom trust icon bar ── */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center backdrop-blur-sm border-t border-white/10"
            style={{ 
              background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)"
            }}
          >
            {TRUST_ICONS.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 flex-1 py-3 group"
                style={{
                  borderRight:
                    i < TRUST_ICONS.length - 1
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "none",
                }}
              >
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110"
                     style={{ 
                       background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(253,224,71,0.1) 100%)",
                       borderColor: "#fbbf24",
                       boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                     }}>
                  <Icon className="h-5 w-5" style={{ color: "#fbbf24" }} />
                </div>
                <span className="text-white/80 text-xs font-light uppercase tracking-wider hidden sm:block">
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
