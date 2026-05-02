import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { ContractorPublicProfile, NavLink } from "@/types/contractor";

interface ContractorNavbarProps {
  profile: ContractorPublicProfile;
  onGetQuote: () => void;
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "About Us",   href: "#about" },
  { label: "Services",   href: "#services" },
  { label: "Portfolio",  href: "#portfolio" },
  { label: "Reviews",    href: "#reviews" },
  { label: "Contact Us", href: "#contact" },
];

export function ContractorNavbar({ profile, onGetQuote }: ContractorNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");

  const brandColor = profile.primary_color || "#7C3AED";

  const navLinks: NavLink[] =
    profile.nav_links && profile.nav_links.length > 0
      ? profile.nav_links
      : DEFAULT_NAV_LINKS;

  /* active section tracking */
  useEffect(() => {
    const onScroll = () => {
      const ids = navLinks.map((l) => l.href.replace("#", "")).filter(Boolean);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveHref(`#${ids[i]}`);
          return;
        }
      }
      setActiveHref("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navLinks]);

  function scrollTo(href: string) {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = href;
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 shadow-2xl border-b border-white/10"
      style={{ 
        background: `linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)`,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="h-[72px] flex items-center justify-between gap-8">

          {/* ── Logo + company name ── */}
          <div className="flex items-center gap-3 shrink-0">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt=""
                className="h-10 w-10 rounded-lg object-cover ring-2 ring-white/30"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-lg ring-2 ring-white/30"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                {profile.company.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-light text-white text-[18px] tracking-wide leading-tight">
              {profile.company}
            </span>
          </div>

          {/* ── Desktop nav tabs ── */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="relative px-4 lg:px-6 py-2.5 text-[14px] lg:text-[15px] font-light rounded-xl transition-all duration-300 focus:outline-none tracking-wide hover:scale-105"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                    boxShadow: isActive ? "0 4px 12px rgba(255,255,255,0.1)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }
                  }}
                >
                  {link.label}
                  {/* luxurious gold underline */}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #fbbf24, #fde047, #fbbf24)",
                        boxShadow: "0 0 8px rgba(251, 191, 36, 0.5)"
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── CTA button ── */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGetQuote}
              className="hidden sm:inline-flex items-center px-6 py-3 rounded-xl font-semibold text-[14px] tracking-wide transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 focus:outline-none shadow-xl hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                color: "#1e293b",
                boxShadow: "0 8px 24px rgba(251, 191, 36, 0.3), 0 0 0 1px rgba(255,255,255,0.1)"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(251, 191, 36, 0.4), 0 0 0 1px rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(251, 191, 36, 0.3), 0 0 0 1px rgba(255,255,255,0.1)";
              }}
            >
              Get a Quote
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/10 backdrop-blur-xl"
          style={{ 
            background: "linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(88,28,135,0.95) 100%)"
          }}
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-[15px] font-light transition-all duration-300 focus:outline-none tracking-wide"
                  style={{
                    color: "#fff",
                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    boxShadow: isActive ? "0 4px 12px rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #fbbf24, #fde047)",
                        boxShadow: "0 0 8px rgba(251, 191, 36, 0.5)"
                      }}
                    />
                  )}
                </button>
              );
            })}
            <div className="pt-3 pb-1">
              <button
                onClick={() => { setMobileOpen(false); onGetQuote(); }}
                className="w-full py-3.5 rounded-xl font-semibold text-[15px] tracking-wide transition-all duration-300 hover:scale-[1.02] focus:outline-none"
                style={{ 
                  background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                  color: "#1e293b",
                  boxShadow: "0 8px 24px rgba(251, 191, 36, 0.3)"
                }}
              >
                Get a Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
