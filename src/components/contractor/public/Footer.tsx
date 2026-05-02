import { MapPin, Phone, Mail, Clock, ChevronRight, ExternalLink } from "lucide-react";

interface ContractorPublicProfile {
  company: string;
  location: string;
  description: string | null;
  slug: string;
  cover_images: string[];
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  is_published: boolean;
  verified: boolean;
  tagline: string | null;
  nav_links: { label: string; href: string }[] | null;
}

interface FooterProps {
  profile: ContractorPublicProfile;
  brandColor: string;
  onGetQuote: () => void;
}

export function Footer({ profile, brandColor, onGetQuote }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="text-white relative overflow-hidden" 
         style={{
           background: "linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)"
         }}>
      {/* Purple gradient background overlay */}
      <div className="absolute inset-0 opacity-[0.95]" 
           style={{ background: "linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)" }} />
      
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)",
             backgroundSize: "50px 50px"
           }} />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* ── Brand Section ── */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-12 w-12 rounded-2xl object-cover backdrop-blur-sm border border-white/20" />
              ) : (
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-light text-lg backdrop-blur-sm border border-white/20"
                     style={{ 
                       background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                       color: "#1e293b",
                       boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                     }}>
                  {profile.company.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-light text-white text-xl tracking-wide">{profile.company}</span>
            </div>
            
            {profile.tagline && (
              <p className="text-white/70 text-base leading-relaxed mb-6">{profile.tagline}</p>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-3 text-white/60 text-base">
                <MapPin className="h-4 w-4" style={{ color: "#fbbf24" }} />
                <span>{profile.location}</span>
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-white/50 text-sm mb-2">Business Hours</p>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="h-4 w-4" style={{ color: "#fbbf24" }} />
                <span>Mon - Fri: 8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm ml-6">
                <span>Sat: 9:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="text-amber-400 text-xs font-light uppercase tracking-[0.3em] mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Services", section: "services" },
                { label: "Portfolio", section: "portfolio" },
                { label: "Reviews", section: "reviews" },
                { label: "Contact", section: "contact" }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.section)}
                    className="text-white/70 hover:text-white text-base transition-all duration-300 hover:translate-x-1 focus:outline-none tracking-wide flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-amber-400 text-xs font-light uppercase tracking-[0.3em] mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-white/60 hover:text-white text-sm transition-all duration-300 focus:outline-none">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white text-sm transition-all duration-300 focus:outline-none">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Contact Information ── */}
          <div>
            <h3 className="text-amber-400 text-xs font-light uppercase tracking-[0.3em] mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20"
                     style={{ 
                       background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(253,224,71,0.1) 100%)",
                       borderColor: "#fbbf24"
                     }}>
                  <Phone className="h-5 w-5" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Phone</p>
                  <a href="tel:+15551234567" className="text-white hover:text-amber-400 transition-colors text-base">
                    (555) 123-4567
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20"
                     style={{ 
                       background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(253,224,71,0.1) 100%)",
                       borderColor: "#fbbf24"
                     }}>
                  <Mail className="h-5 w-5" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <a href="mailto:contact@example.com" className="text-white hover:text-amber-400 transition-colors text-base">
                    contact@example.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20"
                     style={{ 
                       background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(253,224,71,0.1) 100%)",
                       borderColor: "#fbbf24"
                     }}>
                  <MapPin className="h-5 w-5" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Service Area</p>
                  <p className="text-white text-base">Greater Toronto Area</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Call to Action ── */}
          <div>
            <h3 className="text-amber-400 text-xs font-light uppercase tracking-[0.3em] mb-6">Start Your Project</h3>
            <p className="text-white/70 text-base mb-6 leading-relaxed">
              Ready to transform your space? Get a free, no-obligation quote today and let's discuss your project.
            </p>
            
            <button
              onClick={onGetQuote}
              className="w-full px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none tracking-wide shadow-xl mb-6"
              style={{ 
                background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                color: "#1e293b",
                boxShadow: "0 8px 32px rgba(251, 191, 36, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 48px rgba(251, 191, 36, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(251, 191, 36, 0.4)";
              }}
            >
              Get Free Quote
            </button>
            
            <div className="text-center">
              <p className="text-white/50 text-sm mb-3">Follow us on social media</p>
              <div className="flex justify-center gap-3">
                {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((social) => (
                  <button
                    key={social}
                    className="h-8 w-8 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-300"
                    style={{ 
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.1)"
                    }}
                  >
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-base text-white/60">
            <div className="flex items-center gap-2">
              <span>© {currentYear} {profile.company}. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
            
            <div className="flex items-center">
              <span className="mr-2">Powered by</span>
              <a 
                href="https://homieai.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors tracking-wide font-light"
              >
                <span style={{ color: "#fbbf24" }}>Homie AI</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
