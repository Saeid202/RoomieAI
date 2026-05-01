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
      className="sticky top-0 z-50"
      style={{ backgroundColor: brandColor }}
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
            <span className="font-black text-white text-[17px] tracking-tight leading-tight">
              {profile.company}
            </span>
          </div>

          {/* ── Desktop nav tabs ── */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="relative px-5 py-2 text-[14px] font-bold rounded-lg transition-all duration-200 focus:outline-none"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {/* active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── CTA button ── */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGetQuote}
              className="hidden sm:inline-flex items-center px-6 py-2.5 rounded-lg font-black text-[14px] tracking-wide transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 focus:outline-none shadow-lg"
              style={{
                backgroundColor: "#F59E0B",
                color: "#1a1a1a",
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
          className="md:hidden border-t border-white/10"
          style={{ backgroundColor: brandColor }}
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-[15px] font-bold transition-all focus:outline-none"
                  style={{
                    color: "#fff",
                    backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  }}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2 pb-1">
              <button
                onClick={() => { setMobileOpen(false); onGetQuote(); }}
                className="w-full py-3.5 rounded-xl font-black text-[15px] tracking-wide transition-opacity hover:opacity-90 focus:outline-none"
                style={{ backgroundColor: "#F59E0B", color: "#1a1a1a" }}
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
